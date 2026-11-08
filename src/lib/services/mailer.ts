import nodemailer from "nodemailer";
import { SITE_NAME } from "@/lib/constants";
import { SITE_URL } from "@/lib/seo";
import { DEFAULT_SMTP_SETTINGS } from "./settings";

export interface SmtpConfig {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  fromName?: string;
  fromEmail?: string;
}

export interface BroadcastRecipient {
  uid: string;
  name: string;
  email: string;
}

export interface SendBroadcastOptions {
  recipients: BroadcastRecipient[];
  subject: string;
  body: string;
  courseTitle?: string;
  config?: SmtpConfig;
}

export interface BroadcastResult {
  total: number;
  sent: number;
  failed: number;
  errors: Array<{ email: string; error: string }>;
}

/**
 * Resolves the active SMTP configuration from parameters, environment, or defaults.
 */
export function getActiveSmtpConfig(override?: SmtpConfig): SmtpConfig {
  const host = override?.host || process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(override?.port || process.env.SMTP_PORT || 465);
  const user = override?.user || process.env.SMTP_USER || "";
  const pass = override?.pass || process.env.SMTP_PASS || "";
  const fromName = override?.fromName || process.env.SMTP_FROM_NAME || SITE_NAME;
  const fromEmail = override?.fromEmail || process.env.SMTP_FROM_EMAIL || user;

  return { host, port, user, pass, fromName, fromEmail };
}

/**
 * Resolves SMTP configuration asynchronously:
 * 1. override (if provided with credentials)
 * 2. process.env (SMTP_USER, SMTP_PASS, etc.)
 * 3. Firestore document `admin_settings/smtp` (if configured by admin in Settings UI)
 */
export async function resolveSmtpConfig(override?: SmtpConfig): Promise<SmtpConfig> {
  const syncConfig = getActiveSmtpConfig(override);
  if (syncConfig.user && syncConfig.pass) {
    return syncConfig;
  }

  // Fallback to Firestore admin_settings/smtp (allows web-based configuration on deployed Vercel)
  try {
    const { fetchSmtpSettings } = await import("@/lib/services/settings");
    const dbSettings = await fetchSmtpSettings();
    if (dbSettings.user && dbSettings.pass) {
      return {
        host: dbSettings.host || syncConfig.host,
        port: dbSettings.port || syncConfig.port,
        user: dbSettings.user,
        pass: dbSettings.pass,
        fromName: dbSettings.fromName || syncConfig.fromName,
        fromEmail: dbSettings.fromEmail || dbSettings.user || syncConfig.fromEmail,
      };
    }
  } catch (err) {
    console.warn("Could not read SMTP settings from Firestore:", err);
  }

  return syncConfig;
}

let defaultTransporter: ReturnType<typeof nodemailer.createTransport> | null = null;
let lastTransporterKey = "";

/**
 * Creates a Nodemailer transporter instance, reusing the active default connection.
 */
export function createSmtpTransporter(override?: SmtpConfig) {
  const config = getActiveSmtpConfig(override);

  if (!config.user || !config.pass) {
    throw new Error(
      "SMTP credentials not configured. Please set SMTP_USER and SMTP_PASS in .env.local or in Admin Settings."
    );
  }

  const key = `${config.host}:${config.port}:${config.user}:${config.pass}`;
  if (!override && defaultTransporter && lastTransporterKey === key) {
    return defaultTransporter;
  }

  const host = config.host || "smtp.gmail.com";
  const isGmail = host.includes("gmail.com") || Boolean(config.user?.endsWith("@gmail.com"));

  const transport = nodemailer.createTransport({
    host,
    port: config.port || 465,
    secure: (config.port || 465) === 465, // true for 465, false for 587
    auth: {
      user: config.user,
      pass: config.pass,
    },
    ...(isGmail && {
      service: "gmail",
    }),
  });

  if (!override) {
    defaultTransporter = transport;
    lastTransporterKey = key;
  }

  return transport;
}

/**
 * Verifies SMTP connection.
 */
export async function verifySmtpConnection(override?: SmtpConfig): Promise<boolean> {
  const config = await resolveSmtpConfig(override);
  const transporter = createSmtpTransporter(config);
  await transporter.verify();
  return true;
}

import { buildEmailTemplate, htmlToPlainText } from "./emailTemplates";
export { buildEmailTemplate, htmlToPlainText };

/**
 * Sends a single test email.
 */
export async function sendTestEmail({
  to,
  subject,
  body,
  config,
}: {
  to: string;
  subject: string;
  body: string;
  config?: SmtpConfig;
}) {
  const activeConfig = await resolveSmtpConfig(config);
  const transporter = createSmtpTransporter(activeConfig);

  // Strip any bracket prefix so the exact subject written by the admin is delivered
  const cleanSubject = subject.replace(/^\[.*?\]\s*/, "").trim();

  const html = buildEmailTemplate({
    subject: cleanSubject,
    bodyContent: body,
    studentName: "Admin (Test Preview)",
    categoryBadge: "🧪 Test Delivery",
  });

  const text = htmlToPlainText(html);

  return await transporter.sendMail({
    from: `"${activeConfig.fromName}" <${activeConfig.fromEmail}>`,
    to,
    subject: cleanSubject,
    text,
    html,
    headers: {
      "X-Entity-Ref-ID": `test-${Date.now()}`,
      "List-Unsubscribe": `<mailto:${activeConfig.fromEmail}?subject=Unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      "X-Mailer": "Auto AI Academy Notification Engine",
      "X-Priority": "3",
    },
  });
}

/**
 * Dispatches broadcast emails to target recipients in controlled batches.
 */
export async function sendBroadcastEmails({
  recipients,
  subject,
  body,
  courseTitle = "",
  config,
}: SendBroadcastOptions): Promise<BroadcastResult> {
  const activeConfig = await resolveSmtpConfig(config);
  const transporter = createSmtpTransporter(activeConfig);

  let sent = 0;
  let failed = 0;
  const errors: Array<{ email: string; error: string }> = [];

  // Batch sending in chunks of 5 with throttle pauses
  const BATCH_SIZE = 5;
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE);

    await Promise.all(
      batch.map(async (recipient) => {
        try {
          if (!recipient.email || !recipient.email.includes("@")) {
            throw new Error("Invalid recipient email address");
          }

          // Personalize variables
          const personalizedBody = body
            .replace(/\{\{name\}\}/gi, recipient.name || "Student")
            .replace(/\{\{email\}\}/gi, recipient.email)
            .replace(/\{\{courseTitle\}\}/gi, courseTitle)
            .replace(/\{\{siteUrl\}\}/gi, SITE_URL);

          const personalizedSubject = subject
            .replace(/\{\{name\}\}/gi, recipient.name || "Student")
            .replace(/\{\{courseTitle\}\}/gi, courseTitle)
            .replace(/^\[.*?\]\s*/, "")
            .trim();

          const html = buildEmailTemplate({
            subject: personalizedSubject,
            bodyContent: personalizedBody,
            studentName: recipient.name || "Student",
            categoryBadge: courseTitle ? `📚 ${courseTitle}` : "Official Announcement",
          });

          const text = htmlToPlainText(html);

          await transporter.sendMail({
            from: `"${activeConfig.fromName}" <${activeConfig.fromEmail}>`,
            to: `"${recipient.name || "Student"}" <${recipient.email}>`,
            subject: personalizedSubject,
            text,
            html,
            headers: {
              "X-Entity-Ref-ID": `broadcast-${Date.now()}-${recipient.uid}`,
              "List-Unsubscribe": `<mailto:${activeConfig.fromEmail}?subject=Unsubscribe>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
              "X-Mailer": "Auto AI Academy Notification Engine",
              "X-Priority": "3",
            },
          });

          sent++;
        } catch (err: any) {
          failed++;
          errors.push({
            email: recipient.email,
            error: err.message || "Failed to send",
          });
        }
      })
    );

    // Minor pause between batches to avoid spam flags or rate limits
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  return {
    total: recipients.length,
    sent,
    failed,
    errors,
  };
}
