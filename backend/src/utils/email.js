/** Mock email service - replace with SendGrid/SES in production */
export async function sendEmail({ to, subject, html }) {
  if (process.env.NODE_ENV !== "production") {
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(html);
  }
  return { success: true, messageId: `mock-${Date.now()}` };
}

export function verificationEmailHtml(token) {
  return `<p>Verify your email. Token: <strong>${token}</strong></p><p>Or visit: ${process.env.CLIENT_URL}/verify-email?token=${token}</p>`;
}

export function resetPasswordEmailHtml(token) {
  return `<p>Reset your password. Token: <strong>${token}</strong></p><p>Or visit: ${process.env.CLIENT_URL}/reset-password?token=${token}</p>`;
}
