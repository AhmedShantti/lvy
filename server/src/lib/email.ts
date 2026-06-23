// Lightweight Resend client (no SDK dependency — uses the REST API via fetch).
const RESEND_API_KEY = process.env.RESEND_API_KEY;
// Must be a verified domain in Resend, or "onboarding@resend.dev" for testing
// (the test sender only delivers to your own Resend account email).
const MAIL_FROM = process.env.MAIL_FROM ?? "LVY <onboarding@resend.dev>";

export async function sendEmail(opts: { to: string; subject: string; html: string }) {
  if (!RESEND_API_KEY) {
    console.warn(
      `[email] RESEND_API_KEY not set — email NOT sent to ${opts.to}. Subject: "${opts.subject}"`
    );
    return { skipped: true as const };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: MAIL_FROM, to: opts.to, subject: opts.subject, html: opts.html }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Resend send failed (${res.status}): ${detail.slice(0, 300)}`);
  }
  return res.json();
}

function verificationEmailHtml(name: string, url: string) {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#F6F1EA; padding:40px 0;">
    <div style="max-width:480px; margin:0 auto; background:#fff; border:1px solid #e7e0d6;">
      <div style="background:#1C1B19; padding:28px 32px;">
        <p style="margin:0; color:#F6F1EA; font-size:24px; letter-spacing:2px;">lvy</p>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 12px; font-size:22px; color:#1C1B19;">Confirm your email</h1>
        <p style="margin:0 0 20px; color:#5b5650; font-size:15px; line-height:1.6;">
          Hi ${name || "there"}, welcome to LVY. Please confirm this email address to activate your account.
        </p>
        <a href="${url}" style="display:inline-block; background:#83382E; color:#fff; text-decoration:none; padding:14px 28px; font-size:14px; letter-spacing:1px; text-transform:uppercase;">
          Verify email
        </a>
        <p style="margin:24px 0 0; color:#8B847C; font-size:13px; line-height:1.6;">
          This link expires in 24 hours. If the button doesn't work, paste this URL into your browser:<br />
          <a href="${url}" style="color:#83382E; word-break:break-all;">${url}</a>
        </p>
        <p style="margin:20px 0 0; color:#b3aca3; font-size:12px;">
          If you didn't create an LVY account, you can safely ignore this email.
        </p>
      </div>
    </div>
  </div>`;
}

export async function sendVerificationEmail(to: string, name: string, url: string) {
  return sendEmail({
    to,
    subject: "Verify your LVY account",
    html: verificationEmailHtml(name, url),
  });
}

function passwordResetEmailHtml(name: string, url: string) {
  return `
  <div style="font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#F6F1EA; padding:40px 0;">
    <div style="max-width:480px; margin:0 auto; background:#fff; border:1px solid #e7e0d6;">
      <div style="background:#1C1B19; padding:28px 32px;">
        <p style="margin:0; color:#F6F1EA; font-size:24px; letter-spacing:2px;">lvy</p>
      </div>
      <div style="padding:32px;">
        <h1 style="margin:0 0 12px; font-size:22px; color:#1C1B19;">Reset your password</h1>
        <p style="margin:0 0 20px; color:#5b5650; font-size:15px; line-height:1.6;">
          Hi ${name || "there"}, we received a request to reset your LVY password. Click below to choose a new one.
        </p>
        <a href="${url}" style="display:inline-block; background:#83382E; color:#fff; text-decoration:none; padding:14px 28px; font-size:14px; letter-spacing:1px; text-transform:uppercase;">
          Reset password
        </a>
        <p style="margin:24px 0 0; color:#8B847C; font-size:13px; line-height:1.6;">
          This link expires in 1 hour. If the button doesn't work, paste this URL into your browser:<br />
          <a href="${url}" style="color:#83382E; word-break:break-all;">${url}</a>
        </p>
        <p style="margin:20px 0 0; color:#b3aca3; font-size:12px;">
          If you didn't request this, you can safely ignore this email — your password won't change.
        </p>
      </div>
    </div>
  </div>`;
}

export async function sendPasswordResetEmail(to: string, name: string, url: string) {
  return sendEmail({
    to,
    subject: "Reset your LVY password",
    html: passwordResetEmailHtml(name, url),
  });
}
