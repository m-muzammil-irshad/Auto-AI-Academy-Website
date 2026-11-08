import { NextResponse } from "next/server";
import { getUserProfile, fetchAllUsers } from "@/lib/services/users";
import { fetchCourse } from "@/lib/services/courses";
import { fetchEnrollmentsForCourse } from "@/lib/services/enrollments";
import { fetchAssignmentsForCourse } from "@/lib/services/assignments";
import { fetchSubmissionsForUser } from "@/lib/services/submissions";
import { formatDateTime } from "@/lib/utils/dates";
import {
  sendEnrollmentWelcomeEmail,
  sendNewAssignmentEmail,
  sendSubmissionReceivedEmail,
  sendSubmissionGradedEmail,
  sendLeaderboardRankEmail,
  sendCourseCompletedEligibleEmail,
  sendCourseCompletedCatchUpEmail,
  sendCatchUp80PercentReachedEmail,
  sendNewCoursePublishedEmail,
  sendCourseStatusOngoingEmail,
} from "@/lib/services/lifecycleEmail";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { event } = data;

    if (!event) {
      return NextResponse.json({ error: "Missing event parameter" }, { status: 400 });
    }

    switch (event) {
      // 1. Student Enrolled in a Course
      case "enrollment_welcome": {
        const { userId, courseId } = data;
        if (!userId || !courseId) break;

        const [user, course] = await Promise.all([
          getUserProfile(userId),
          fetchCourse(courseId),
        ]);

        if (user?.email && course) {
          await sendEnrollmentWelcomeEmail({
            studentEmail: user.email,
            studentName: user.name || "Student",
            courseTitle: course.title,
            courseId: course.id,
            youtubeUrl: course.youtubeChannelUrl,
          });
        }
        break;
      }

      // 2. New Assignment Created in a Course
      case "new_assignment": {
        const { courseId, assignmentTitle, description, dueDateMillis, recipients } = data;
        if (!courseId || !assignmentTitle) break;

        const course = await fetchCourse(courseId);
        if (!course) break;

        const dueDateFormatted = dueDateMillis
          ? new Date(dueDateMillis).toLocaleString()
          : "Check Student Portal";

        let studentList: Array<{ name: string; email: string }> = [];

        // 1. If explicit recipients provided from authenticated client, use directly
        if (Array.isArray(recipients) && recipients.length > 0) {
          studentList = recipients;
        } else {
          // 2. Otherwise try enrollments, then fallback to registered students
          try {
            const enrollments = await fetchEnrollmentsForCourse(courseId);
            if (enrollments && enrollments.length > 0) {
              const userProfiles = await Promise.all(
                enrollments.map((e) => getUserProfile(e.userId))
              );
              studentList = userProfiles
                .filter((u): u is NonNullable<typeof u> => Boolean(u?.email))
                .map((u) => ({ name: u.name || "Student", email: u.email }));
            }
          } catch (err) {
            console.warn("Could not query enrollments on server:", err);
          }

          if (studentList.length === 0) {
            const allUsers = await fetchAllUsers();
            studentList = allUsers
              .filter((u) => Boolean(u.email) && u.role === "student")
              .map((u) => ({ name: u.name || "Student", email: u.email }));
          }
        }

        let sentCount = 0;
        for (const u of studentList) {
          if (u?.email) {
            const ok = await sendNewAssignmentEmail({
              studentEmail: u.email,
              studentName: u.name || "Student",
              courseTitle: course.title,
              assignmentTitle,
              description: description || "",
              dueDateFormatted,
            });
            if (ok) sentCount++;
          }
        }
        return NextResponse.json({ success: true, event, sentCount });
      }

      // 3. Assignment Submission Received
      case "submission_received": {
        const { userId, assignmentTitle } = data;
        if (!userId || !assignmentTitle) break;

        const user = await getUserProfile(userId);
        if (user?.email) {
          await sendSubmissionReceivedEmail({
            studentEmail: user.email,
            studentName: user.name || "Student",
            assignmentTitle,
          });
        }
        break;
      }

      // 4. Submission Graded + Leaderboard Position + Catch-Up 80% Check
      case "submission_graded": {
        const {
          userId,
          assignmentTitle,
          grading,
          courseId,
          isCatchUp,
        } = data;
        if (!userId || !grading) break;

        const user = await getUserProfile(userId);
        if (!user?.email) break;

        // Send grade result email
        await sendSubmissionGradedEmail({
          studentEmail: user.email,
          studentName: user.name || "Student",
          assignmentTitle: assignmentTitle || "Assignment",
          finalStars: grading.finalStars || 0,
          correctness: grading.correctness || 0,
          creativity: grading.creativity || 0,
          timeliness: grading.timeliness || 0,
        });

        // Send Leaderboard Rank Update (if not catch-up submission in completed course)
        if (!isCatchUp) {
          const allUsers = await fetchAllUsers();
          // Sort by allTimeStars descending
          allUsers.sort((a, b) => (b.allTimeStars || 0) - (a.allTimeStars || 0));
          const rank = allUsers.findIndex((u) => u.uid === userId) + 1;

          if (rank > 0) {
            await sendLeaderboardRankEmail({
              studentEmail: user.email,
              studentName: user.name || "Student",
              rank,
              totalStars: user.allTimeStars || 0,
            });
          }
        }

        // If this is a catch-up submission or in a completed course, check if they now hit 80%
        if (courseId) {
          const course = await fetchCourse(courseId);
          if (course?.status === "completed") {
            const [assignments, userSubs] = await Promise.all([
              fetchAssignmentsForCourse(courseId),
              fetchSubmissionsForUser(userId),
            ]);

            const courseSubs = userSubs.filter((s) => s.assignmentId && assignments.some((a) => a.id === s.assignmentId));
            const totalAssigns = assignments.length;
            if (totalAssigns > 0 && courseSubs.length / totalAssigns >= 0.8) {
              await sendCatchUp80PercentReachedEmail({
                studentEmail: user.email,
                studentName: user.name || "Student",
                courseTitle: course.title,
              });
            }
          }
        }
        break;
      }

      // 5. Course Marked as Completed
      case "course_completed": {
        const { courseId } = data;
        if (!courseId) break;

        const [course, enrollments, assignments] = await Promise.all([
          fetchCourse(courseId),
          fetchEnrollmentsForCourse(courseId),
          fetchAssignmentsForCourse(courseId),
        ]);

        if (!course || enrollments.length === 0) break;

        const totalAssignments = assignments.length;

        for (const e of enrollments) {
          const [user, userSubs] = await Promise.all([
            getUserProfile(e.userId),
            fetchSubmissionsForUser(e.userId),
          ]);

          if (!user?.email) continue;

          const completedCount = totalAssignments === 0 ? 0 : userSubs.filter((s) => assignments.some((a) => a.id === s.assignmentId)).length;
          const rate = totalAssignments === 0 ? 1 : completedCount / totalAssignments;

          if (rate >= 0.8) {
            // >= 80%: Certificate Eligible
            await sendCourseCompletedEligibleEmail({
              studentEmail: user.email,
              studentName: user.name || "Student",
              courseTitle: course.title,
              courseId: course.id,
              submissionPercentage: rate * 100,
            });
          } else {
            // < 80%: Catch-up opportunity
            await sendCourseCompletedCatchUpEmail({
              studentEmail: user.email,
              studentName: user.name || "Student",
              courseTitle: course.title,
              courseId: course.id,
              submissionPercentage: rate * 100,
            });
          }
        }
        break;
      }

      // 6. New Course Published (Broadcast to All Students)
      case "new_course_published": {
        const { courseId } = data;
        if (!courseId) break;

        const course = await fetchCourse(courseId);
        if (!course) break;

        const users = await fetchAllUsers();
        for (const u of users) {
          if (u.email && u.role === "student") {
            await sendNewCoursePublishedEmail({
              studentEmail: u.email,
              studentName: u.name || "Student",
              courseTitle: course.title,
              courseId: course.id,
              description: course.description,
              level: course.level,
              duration: course.duration,
            });
          }
        }
        break;
      }

      // 7. Course Status Changed to Ongoing (Broadcast to All Students)
      case "course_status_ongoing": {
        const { courseId } = data;
        if (!courseId) break;

        const course = await fetchCourse(courseId);
        if (!course) break;

        const users = await fetchAllUsers();
        for (const u of users) {
          if (u.email && u.role === "student") {
            await sendCourseStatusOngoingEmail({
              studentEmail: u.email,
              studentName: u.name || "Student",
              courseTitle: course.title,
              courseId: course.id,
            });
          }
        }
        break;
      }

      default:
        return NextResponse.json({ error: `Unknown event: ${event}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, event });
  } catch (error: any) {
    console.error("Lifecycle Email Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process lifecycle email" },
      { status: 500 }
    );
  }
}
