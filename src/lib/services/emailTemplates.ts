import { SITE_NAME } from "@/lib/constants";
import { SITE_URL } from "@/lib/seo";

export interface EmailTemplateOptions {
  subject: string;
  bodyContent: string;
  studentName: string;
  preheader?: string;
  categoryBadge?: string;
  ctaText?: string;
  ctaUrl?: string;
  siteUrl?: string;
}

/**
 * Converts HTML body into crisp, clean, human-readable plain text.
 * Crucial for spam filter pass-through (ensuring multipart/alternative compliance).
 */
export function htmlToPlainText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<h[1-6][^>]*>/gi, "\n\n")
    .replace(/<\/h[1-6]>/gi, "\n")
    .replace(/<hr\s*[\/]?>/gi, "\n---\n")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Builds a 100% responsive, high-deliverability HTML email template.
 * Specially engineered for:
 * 1. Flawless mobile & desktop rendering across Gmail, Apple Mail, and Outlook.
 * 2. High inbox placement (Anti-Spam compliance with preheader padding, valid table layout, and proper footer).
 * 3. Executive clean typography and readable spacing.
 */
export function buildEmailTemplate({
  subject,
  bodyContent,
  studentName,
  preheader,
  categoryBadge = "Official Notification",
  ctaText = "Open Student Portal",
  ctaUrl,
  siteUrl = SITE_URL,
}: EmailTemplateOptions): string {
  const targetCtaUrl = ctaUrl || `${siteUrl}/student`;
  const cleanStudentName = studentName?.trim() || "Student";

  // Derive crisp preheader snippet if not provided
  const derivedPreheader =
    preheader ||
    htmlToPlainText(bodyContent).slice(0, 110).replace(/\s+/g, " ") + "...";

  // Format paragraphs if plain text was passed
  const formattedBody = bodyContent.includes("<p>")
    ? bodyContent
    : bodyContent
        .split("\n\n")
        .map(
          (para) =>
            `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.65; color: #334155;">${para
              .replace(/\n/g, "<br/>")
              .trim()}</p>`
        )
        .join("");

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="en" style="color-scheme: light; supported-color-schemes: light;">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
    
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .email-card { border-radius: 0 !important; border-left: none !important; border-right: none !important; }
      .mobile-padding { padding: 24px 20px !important; }
      .mobile-header-padding { padding: 24px 20px !important; }
      .mobile-heading { font-size: 20px !important; line-height: 26px !important; }
      .mobile-btn { display: block !important; width: 100% !important; text-align: center !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  
  <!-- Anti-Spam Hidden Preheader with Whitespace Padding -->
  <div style="display: none; font-size: 1px; color: #f8fafc; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${escapeHtml(derivedPreheader)}
    &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy; &#847; &zwnj; &nbsp; &#8199; &shy;
  </div>

  <!-- Outer Background Table -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f8fafc; table-layout: fixed;">
    <tr>
      <td align="center" style="padding: 24px 12px 40px 12px;">
        
        <!-- Main Email Container (Max 580px for optimal readability) -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 580px; margin: 0 auto;" class="email-container">
          
          <!-- Brand Accent Bar -->
          <tr>
            <td height="4" style="background: linear-gradient(90deg, #0284c7 0%, #38bdf8 50%, #0369a1 100%); border-top-left-radius: 12px; border-top-right-radius: 12px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>

          <!-- Main White Card -->
          <tr>
            <td style="background-color: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0, 0, 0, 0.04);" class="email-card">
              
              <!-- Header Section -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 32px 36px 24px 36px; border-bottom: 1px solid #f1f5f9; background-color: #ffffff;" class="mobile-header-padding">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td>
                          <!-- Academy Name Badge -->
                          <div style="font-size: 11px; font-weight: 800; letter-spacing: 1.2px; text-transform: uppercase; color: #0284c7; margin-bottom: 6px;">
                            ${SITE_NAME}
                          </div>
                          <!-- Category Badge -->
                          <div style="display: inline-block; background-color: #f0f9ff; border: 1px solid #bae6fd; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; color: #0369a1;">
                            ${escapeHtml(categoryBadge)}
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Body Content Area -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                <tr>
                  <td style="padding: 32px 36px 36px 36px;" class="mobile-padding">
                    
                    <!-- Salutation -->
                    <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 18px; line-height: 1.4;">
                      Assalam-o-Alaikum ${escapeHtml(cleanStudentName)},
                    </div>

                    <!-- Injected Content Body -->
                    <div style="font-size: 15px; color: #334155; line-height: 1.65; word-break: break-word;">
                      ${formattedBody}
                    </div>

                    <!-- Bulletproof CTA Button -->
                    ${
                      ctaText
                        ? `
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 32px auto 8px auto;">
                      <tr>
                        <td align="center" bgcolor="#0284c7" style="border-radius: 8px; box-shadow: 0 3px 8px rgba(2, 132, 199, 0.25);">
                          <a href="${escapeHtml(targetCtaUrl)}" target="_blank" style="display: inline-block; padding: 13px 28px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.2px;" class="mobile-btn">
                            ${escapeHtml(ctaText)} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>`
                        : ""
                    }

                    <!-- Support Signature -->
                    <div style="margin-top: 32px; padding-top: 20px; border-top: 1px solid #f1f5f9; font-size: 13px; color: #64748b; line-height: 1.5;">
                      Warm regards,<br />
                      <strong style="color: #0f172a;">${SITE_NAME} Team</strong><br />
                      <span style="font-size: 12px; color: #94a3b8;">Empowering Practical Tech & AI Education</span>
                    </div>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Anti-Spam Compliant Footer -->
          <tr>
            <td style="padding: 24px 20px 8px 20px; text-align: center;">
              
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                You are receiving this official update because you have an active student account on <strong>${SITE_NAME}</strong>.
              </p>

              <p style="margin: 0 0 12px 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                Need help or have questions? Email us directly at <a href="mailto:autoaiacademy261@gmail.com" style="color: #0284c7; text-decoration: none; font-weight: 600;">autoaiacademy261@gmail.com</a>
              </p>

              <p style="margin: 0; font-size: 11px; color: #cbd5e1;">
                &copy; ${new Date().getFullYear()} ${SITE_NAME} &bull; All Rights Reserved
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

function escapeHtml(text: string): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
