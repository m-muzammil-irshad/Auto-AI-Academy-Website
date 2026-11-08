import { NextResponse } from "next/server";
import { getUserProfile } from "@/lib/services/users";
import {
  sendBroadcastEmails,
  sendTestEmail,
  verifySmtpConnection,
  type BroadcastRecipient,
} from "@/lib/services/mailer";
import { addDoc, serverTimestamp } from "firebase/firestore";
import { emailBroadcastsCol } from "@/lib/firebase/collections";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const {
      userId,
      action = "send",
      subject,
      body,
      recipients = [],
      testEmail,
      filterLabel = "All Students",
      courseTitle = "",
      config,
    } = await request.json();

    // 1. Verify caller has admin privileges
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized. Missing user ID." }, { status: 401 });
    }

    const adminProfile = await getUserProfile(userId);
    if (!adminProfile || adminProfile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden. Admin privileges required." },
        { status: 403 }
      );
    }

    // 2. Action: Test SMTP Connection
    if (action === "verify_smtp") {
      try {
        await verifySmtpConnection(config);
        return NextResponse.json({ success: true, message: "SMTP connection verified successfully!" });
      } catch (err: any) {
        return NextResponse.json(
          {
            success: false,
            error: err.message || "Failed to connect to SMTP server. Check credentials.",
          },
          { status: 400 }
        );
      }
    }

    // 3. Action: Send Test Email
    if (action === "test") {
      if (!testEmail || !testEmail.includes("@")) {
        return NextResponse.json(
          { error: "Please provide a valid test email address." },
          { status: 400 }
        );
      }
      if (!subject || !body) {
        return NextResponse.json(
          { error: "Subject and email body are required." },
          { status: 400 }
        );
      }

      try {
        await sendTestEmail({
          to: testEmail,
          subject,
          body,
          config,
        });

        return NextResponse.json({
          success: true,
          message: `Test email sent successfully to ${testEmail}!`,
        });
      } catch (err: any) {
        console.error("Test email error:", err);
        return NextResponse.json(
          {
            error: err.message || "Failed to send test email. Please verify SMTP settings.",
          },
          { status: 500 }
        );
      }
    }

    // 4. Action: Send Broadcast
    if (action === "send") {
      if (!subject?.trim() || !body?.trim()) {
        return NextResponse.json(
          { error: "Subject and email body cannot be empty." },
          { status: 400 }
        );
      }

      if (!Array.isArray(recipients) || recipients.length === 0) {
        return NextResponse.json(
          { error: "No recipients selected for this broadcast." },
          { status: 400 }
        );
      }

      const validRecipients: BroadcastRecipient[] = recipients
        .filter((r) => r && r.email && r.email.includes("@"))
        .map((r) => ({
          uid: r.uid || "",
          name: r.name || "Student",
          email: r.email.trim(),
        }));

      if (validRecipients.length === 0) {
        return NextResponse.json(
          { error: "No valid email addresses found in recipient list." },
          { status: 400 }
        );
      }

      const result = await sendBroadcastEmails({
        recipients: validRecipients,
        subject: subject.trim(),
        body: body.trim(),
        courseTitle,
      });

      // Log broadcast to Firestore email_broadcasts
      try {
        await addDoc(emailBroadcastsCol(), {
          subject: subject.trim(),
          body: body.trim(),
          filterLabel,
          courseTitle,
          totalRecipients: result.total,
          sentCount: result.sent,
          failedCount: result.failed,
          errors: result.errors.slice(0, 20),
          sentAt: serverTimestamp(),
          adminUserId: userId,
          adminEmail: adminProfile.email,
        });

        // Also record to emailDeliveryLogs so admin can filter recipient history
        const { recordEmailDelivery } = await import("@/lib/services/emailLogs");
        for (const r of validRecipients) {
          await recordEmailDelivery({
            category: "manual_broadcast",
            campaignLabel: filterLabel || "Manual Broadcast",
            recipientEmail: r.email,
            recipientName: r.name,
            subject: subject.trim(),
            previewSnippet: body.trim().slice(0, 120),
            bodyContent: body.trim(),
            courseTitle,
            status: "delivered",
          });
        }
      } catch (logErr) {
        console.error("Failed to log broadcast record:", logErr);
      }

      return NextResponse.json({
        success: true,
        result,
      });
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: any) {
    console.error("Broadcast API Error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process broadcast request." },
      { status: 500 }
    );
  }
}
