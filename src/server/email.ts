import { Resend } from "resend";
import { recordEmailEvent } from "@/server/store";
import type { EmailEventType } from "@/server/types";

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(apiKey);
  }

  return resendClient;
}

export async function sendEmailOrLog(input: {
  studioId: string;
  projectId?: string;
  to: string;
  subject: string;
  html: string;
  type: EmailEventType;
}) {
  const resend = getResendClient();
  const from = process.env.EMAIL_FROM || "ProofAlbum <proofs@example.com>";
  const html = renderEmailShell({
    subject: input.subject,
    content: input.html,
  });

  if (resend) {
    try {
      await resend.emails.send({
        from,
        to: input.to,
        subject: input.subject,
        html,
      });
    } catch {
      await resend.emails.send({
        from,
        to: input.to,
        subject: input.subject,
        html,
      });
    }
  }

  await recordEmailEvent({
    studioId: input.studioId,
    projectId: input.projectId,
    to: input.to,
    subject: input.subject,
    type: input.type,
  });
}

function renderEmailShell(input: { subject: string; content: string }) {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f4f4f5;font-family:Inter,Arial,sans-serif;color:#18181b;">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(input.subject)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;border-bottom:1px solid #e4e4e7;">
                <strong style="font-size:16px;">ProofAlbum</strong>
              </td>
            </tr>
            <tr>
              <td style="padding:24px;font-size:15px;line-height:1.6;">
                ${input.content}
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;border-top:1px solid #e4e4e7;color:#71717a;font-size:12px;">
                You are receiving this because a studio shared an album proof with this address.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
