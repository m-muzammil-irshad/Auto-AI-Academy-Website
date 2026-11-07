import { NextResponse } from "next/server";
import OpenAI from "openai";
import { buildChatbotSystemPrompt } from "@/lib/chatbotKnowledge";
import { getUserProfile } from "@/lib/services/users";

export const dynamic = "force-dynamic";

// Initialize OpenAI client for Groq
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy_key_for_build",
  baseURL: "https://api.groq.com/openai/v1",
});

// Simple in-memory rate limiter (10 requests per min for visitors, 30 for admins)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const now = Date.now();

    const {
      messages,
      userName,
      userId,
      isRegistered,
      enrolledCourseIds,
      studentContext,
      adminIntelligenceData,
    } = await request.json();

    // Verify admin role securely via Firestore
    let verifiedIsAdmin = false;
    if (userId) {
      try {
        const userProfile = await getUserProfile(userId);
        if (userProfile && userProfile.role === "admin") {
          verifiedIsAdmin = true;
        }
      } catch (err) {
        console.error("Error verifying admin role in chat API:", err);
      }
    }

    if (ip !== "unknown") {
      const maxLimit = verifiedIsAdmin ? 30 : 10;
      const rateLimit = rateLimitMap.get(ip) || { count: 0, resetTime: now + 60000 };
      if (now > rateLimit.resetTime) {
        rateLimit.count = 1;
        rateLimit.resetTime = now + 60000;
      } else {
        rateLimit.count++;
      }
      rateLimitMap.set(ip, rateLimit);

      if (rateLimit.count > maxLimit) {
        return NextResponse.json(
          { error: "Too many requests. Please slow down." },
          { status: 429 }
        );
      }
    }

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json(
        { error: "Groq API key not configured." },
        { status: 500 }
      );
    }

    // Build the deeply crawled, triple-mode system prompt (Guest / Student / Admin)
    const systemPromptContent = await buildChatbotSystemPrompt({
      userName,
      userId: userId || undefined,
      isRegistered: Boolean(isRegistered ?? userName),
      isAdmin: verifiedIsAdmin,
      adminIntelligenceData: verifiedIsAdmin ? adminIntelligenceData : undefined,
      enrolledCourseIds: Array.isArray(enrolledCourseIds) ? enrolledCourseIds : [],
      studentContext: studentContext || undefined,
    });
    const systemPrompt = {
      role: "system",
      content: systemPromptContent,
    };

    const finalMessages = [systemPrompt, ...messages];

    // Define robust fallback models supported by Groq
    const models = [
      "llama-3.3-70b-versatile",
      "llama-3.1-8b-instant",
      "mixtral-8x7b-32768",
      "gemma2-9b-it",
    ];

    let aiResponse = "";

    // Try models with fallback logic
    for (const model of models) {
      try {
        const completion = await openai.chat.completions.create({
          model: model,
          messages: finalMessages,
          temperature: 0.4,
          max_tokens: 600,
        });

        aiResponse = completion.choices[0]?.message?.content || "";
        if (aiResponse) {
          console.log(`Successfully generated response using model: ${model}`);
          break; // Success! Exit the loop
        }
      } catch (err: any) {
        console.warn(`Failed with model ${model}:`, err.message);
        // Continue to the next fallback model
      }
    }

    if (!aiResponse) {
      throw new Error("All fallback models failed to generate a response.");
    }

    return NextResponse.json({
      role: "assistant",
      content: aiResponse,
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request." },
      { status: 500 }
    );
  }
}
