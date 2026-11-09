import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Groq models in prioritized order (primary + verified robust fallbacks)
const GROQ_MODELS = [
  "openai/gpt-oss-120b",     // Primary: State-of-the-art 120B parameter model, best for instruction following & HTML
  "openai/gpt-oss-20b",      // Fallback 1: Ultra fast, high availability
  "qwen/qwen3.8-27b",        // Fallback 2: 27B model for writing & reasoning
  "allam-2-7b",              // Fallback 3: Fast conversational model
  "llama-3.3-70b-versatile", // Fallback 4: Llama 3.3
  "llama-3.1-8b-instant",    // Fallback 5: Llama 3.1
];

const SYSTEM_PROMPT = `You are the Lead Communications Director and Academic Email Copywriter for "Auto AI Academy" (autoaiacademy.com).
Auto AI Academy is a premier modern technical learning academy offering practical, cohort-based courses in Agentic AI, Python Automations, n8n Workflows, and AI-powered Lead Generation.

Your mission is to craft an exceptional, high-converting, warm, and professional email based on the user's instructions.

CRITICAL RULES & COPYWRITING GUIDELINES:
1. SUBJECT LINE:
   - Must be compelling, clear, professional, and strictly under 60 characters.
   - Engineered for high open rates with curiosity or clear value.
   - NEVER add prefixes in square brackets like "[Auto AI Academy]" or "[Announcement]". Write the natural subject directly.
   - NEVER use scammy words in all-caps (e.g., FREE, CLICK NOW, URGENT, CASH, 100% GUARANTEE).
   - You may use at most ONE relevant, tasteful emoji (e.g., 🚀, 💡, 🎓, ⭐, 💻, ⏱️) if appropriate.

2. EMAIL BODY (SEMANTIC HTML SNIPPET):
   - You are generating the INNER content snippet. DO NOT output <html>, <head>, <body>, or main container tags, as the academy's official responsive template wrapper already surrounds it with headers, verified security badges, social links, and footers.
   - Structure paragraphs with: <p style="margin: 0 0 14px 0; line-height: 1.6; color: #334155;">...</p>
   - Keep paragraphs brief (2 to 3 sentences maximum) for high readability on mobile devices.
   - Use <strong>...</strong> for key terms and emphasize value.
   - For lists, milestones, or step-by-step points, use:
     <ul style="margin: 0 0 16px 20px; line-height: 1.8; color: #334155;">
       <li><strong>Highlight:</strong> Description here.</li>
     </ul>
   - Support template variables if applicable:
     - {{name}} (Student's first/full name)
     - {{courseTitle}} (Enrolled course title)
     - {{siteUrl}} (Platform link)
   - Include a crisp Call-To-Action (CTA) encouraging the student to take action on their portal.
   - Signoff: End warmly and respectfully with:
     <p style="margin: 18px 0 0 0; line-height: 1.6; color: #334155;">Warm regards,<br><strong>Instruction Team</strong><br>Auto AI Academy</p>

3. STRICT JSON OUTPUT FORMAT:
   - Return strictly valid JSON with no markdown wrapping, no \`\`\`json backticks, and no extra prose outside the JSON object.
   - Format:
   {
     "subject": "Clear & Engaging Subject Line Here",
     "body": "<p>Clean semantic HTML body here...</p>"
   }
`;

export async function POST(req: Request) {
  try {
    const apiKey = (process.env.GROQ_COMPOSER_API_KEY || process.env.GROQ_API_KEY)?.trim();

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "GROQ_API_KEY_MISSING",
          message:
            "Groq API Key is not configured. Please add GROQ_COMPOSER_API_KEY to your environment variables (.env.local and Vercel).",
          requiresKey: true,
        },
        { status: 400 }
      );
    }

    const {
      topic = "",
      audience = "All enrolled students",
      keyPoints = "",
      tone = "Professional, encouraging, and motivational",
    } = await req.json();

    if (!topic.trim()) {
      return NextResponse.json(
        { error: "Please provide a topic or objective for the email." },
        { status: 400 }
      );
    }

    const userPrompt = `Please write an official academy email with the following details:
- TARGET AUDIENCE: ${audience}
- MAIN TOPIC / OBJECTIVE: ${topic}
${keyPoints ? `- KEY POINTS TO INCLUDE:\n${keyPoints}` : ""}
- DESIRED TONE: ${tone}

Remember to return only the JSON object with "subject" and "body" (HTML snippet).`;

    let lastError: any = null;

    // Try primary model and iterate through fallbacks
    for (const model of GROQ_MODELS) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: SYSTEM_PROMPT },
              { role: "user", content: userPrompt },
            ],
            temperature: 0.65,
            max_tokens: 900,
            response_format: { type: "json_object" },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.warn(`Groq model ${model} failed with status ${response.status}:`, errorData);
          lastError = new Error(
            errorData.error?.message || `Groq request failed for model ${model} (status ${response.status})`
          );
          continue; // Try next fallback model
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content?.trim();

        if (!content) {
          throw new Error(`Empty response received from Groq model ${model}`);
        }

        // Parse JSON response
        let parsed: { subject?: string; body?: string };
        try {
          parsed = JSON.parse(content);
        } catch {
          // If wrapped in markdown code fence, clean it
          const cleaned = content.replace(/^```json\s*/i, "").replace(/```\s*$/i, "").trim();
          parsed = JSON.parse(cleaned);
        }

        if (!parsed.subject || !parsed.body) {
          throw new Error("Missing subject or body in AI output");
        }

        return NextResponse.json({
          success: true,
          subject: parsed.subject.trim(),
          body: parsed.body.trim(),
          modelUsed: model,
        });
      } catch (err: any) {
        console.warn(`Error attempting Groq model ${model}:`, err.message);
        lastError = err;
      }
    }

    // If all models failed
    return NextResponse.json(
      {
        error: "All AI models failed to generate the email.",
        details: lastError?.message || "Unknown error connecting to Groq API.",
      },
      { status: 502 }
    );
  } catch (err: any) {
    console.error("Generate email error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to process AI email generation request." },
      { status: 500 }
    );
  }
}

