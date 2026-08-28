import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create transporter using environment credentials (e.g. Gmail App Password)
const createTransporter = () => {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  }

  // If no credentials configured, return null to use mock / console simulation
  return null;
};

/**
 * Sends a 6-digit email verification code to the specified address.
 * @param {string} toEmail - Recipient email address
 * @param {string} code - 6-digit verification OTP
 * @returns {Promise<{success: boolean, messageId?: string, isSimulated?: boolean}>}
 */
export const sendVerificationEmail = async (toEmail, code) => {
  const transporter = createTransporter();

  const textBody = `Your PlaySphere verification code is: ${code}. Valid for 10 minutes.`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #090A0D; color: #F5F0E6; margin: 0; padding: 24px; }
          .container { max-width: 520px; margin: 0 auto; background-color: #161920; border: 1px solid rgba(212, 175, 55, 0.25); border-radius: 24px; padding: 36px; box-shadow: 0 12px 30px rgba(0,0,0,0.6); }
          .header { text-align: center; margin-bottom: 24px; }
          .brand { font-size: 24px; font-weight: 900; color: #D4AF37; letter-spacing: 2px; }
          .title { font-size: 18px; font-weight: 800; color: #F5F0E6; margin-top: 8px; }
          .subtitle { font-size: 13px; color: #9B9691; margin-top: 4px; line-height: 1.5; }
          .code-box { background: linear-gradient(135deg, #090A0D, #1A1D24); border: 2px dashed #D4AF37; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
          .code { font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #F0B90B; font-family: monospace; }
          .expiry { font-size: 11px; color: #D4AF37; font-weight: 600; margin-top: 8px; }
          .footer { text-align: center; font-size: 11px; color: #9B9691; margin-top: 24px; border-top: 1px solid #2A2D35; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">🏆 PLAYSPHERE</div>
            <div class="title">Verify Your Athlete Email</div>
            <div class="subtitle">Enter the 6-digit confirmation code below to activate your PlaySphere sports passport.</div>
          </div>
          <div class="code-box">
            <div class="code">${code}</div>
            <div class="expiry">⏱️ Valid for 10 minutes only</div>
          </div>
          <p style="font-size: 12px; color: #9B9691; line-height: 1.5;">If you did not request this registration, please ignore this email or reach out to PlaySphere support.</p>
          <div class="footer">
            PlaySphere Community Sports Platform • Tamil Nadu, India
          </div>
        </div>
      </body>
    </html>
  `;

  // Prominent terminal logging for instant local testing & development
  console.log(`\n╔══════════════════════════════════════════════════════════════════════╗`);
  console.log(`║ 🔑 PLAYSPHERE EMAIL VERIFICATION CODE (DEV / LOCAL TESTING)           ║`);
  console.log(`╠══════════════════════════════════════════════════════════════════════╣`);
  console.log(`║ To Recipient:  ${toEmail.padEnd(52, " ")} ║`);
  console.log(`║ -------------------------------------------------------------------- ║`);
  console.log(`║ 👉 6-DIGIT OTP:   [ ${code} ]                                        ║`);
  console.log(`║ ⏱️  Validity:      10 Minutes                                         ║`);
  console.log(`╚══════════════════════════════════════════════════════════════════════╝\n`);

  if (!transporter) {
    return { success: true, isSimulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"PlaySphere Sports" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Your PlaySphere verification code is: ${code}`,
      text: textBody,
      html: htmlBody,
    });

    console.log(`[Email] Verification email dispatched successfully (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId, isSimulated: false };
  } catch (error) {
    console.warn(`[Email] Failed to deliver real email via SMTP (${error.message}). Code logged to console above.`);
    return { success: true, isSimulated: true, error: error.message };
  }
};

/**
 * Sends a real team invitation email to an athlete.
 * @param {string} toEmail - Recipient email address
 * @param {string} inviterName - Captain / inviter's name
 * @param {string} teamName - Team / squad name
 * @param {string} sport - Sport type (e.g. Cricket, Football)
 * @param {boolean} isNewUser - Whether the recipient is a new user who needs to sign up
 * @returns {Promise<{success: boolean, messageId?: string, isSimulated?: boolean, error?: string}>}
 */
export const sendTeamInviteEmail = async (
  toEmail,
  inviterName,
  teamName,
  sport,
  isNewUser = false
) => {
  const transporter = createTransporter();
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const actionLink = isNewUser
    ? `${frontendUrl}/signup?email=${encodeURIComponent(toEmail)}`
    : `${frontendUrl}/invites`;

  const subject = `${inviterName} invited you to join ${teamName} on PlaySphere!`;
  const textBody = isNewUser
    ? `${inviterName} has invited you to join their ${sport} team '${teamName}' on PlaySphere. Sign up on PlaySphere to accept this invite: ${actionLink}`
    : `${inviterName} has invited you to join their ${sport} team '${teamName}' on PlaySphere. Log in to accept or decline: ${actionLink}`;

  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #090A0D; color: #F5F0E6; margin: 0; padding: 24px; }
          .container { max-width: 540px; margin: 0 auto; background-color: #161920; border: 1px solid rgba(212, 175, 55, 0.3); border-radius: 24px; padding: 36px; box-shadow: 0 16px 36px rgba(0,0,0,0.7); }
          .header { text-align: center; margin-bottom: 24px; }
          .brand { font-size: 26px; font-weight: 900; color: #D4AF37; letter-spacing: 2px; }
          .badge { display: inline-block; padding: 6px 14px; background: rgba(212, 175, 55, 0.15); border: 1px solid rgba(212, 175, 55, 0.4); border-radius: 20px; color: #F0B90B; font-size: 11px; font-weight: 800; text-transform: uppercase; margin-top: 10px; }
          .title { font-size: 20px; font-weight: 800; color: #F5F0E6; margin-top: 14px; }
          .card-box { background: linear-gradient(135deg, #0F1115, #1A1D24); border: 1px solid #2A2D35; border-radius: 18px; padding: 24px; margin: 24px 0; text-align: center; }
          .team-name { font-size: 24px; font-weight: 900; color: #F0B90B; margin-bottom: 4px; }
          .sport-pill { font-size: 12px; font-weight: 700; color: #D4AF37; text-transform: uppercase; letter-spacing: 1px; }
          .inviter-text { font-size: 14px; color: #F5F0E6; margin-top: 12px; line-height: 1.6; }
          .btn-container { text-align: center; margin: 28px 0 16px; }
          .cta-btn { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #D4AF37, #F0B90B); color: #090A0D; text-decoration: none; font-size: 14px; font-weight: 900; border-radius: 14px; box-shadow: 0 6px 20px rgba(212, 175, 55, 0.35); text-transform: uppercase; letter-spacing: 0.5px; }
          .note { font-size: 12px; color: #9B9691; text-align: center; margin-top: 14px; line-height: 1.5; }
          .footer { text-align: center; font-size: 11px; color: #656C7D; margin-top: 28px; border-top: 1px solid #2A2D35; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="brand">🏆 PLAYSPHERE</div>
            <div class="badge">⚔️ Official Squad Invitation</div>
            <div class="title">Team Invitation</div>
          </div>

          <div class="card-box">
            <div class="team-name">${teamName}</div>
            <div class="sport-pill">⚡ ${sport} Squad</div>
            <p class="inviter-text">
              ${inviterName} has invited you to join their ${sport} team '<strong>${teamName}</strong>' on PlaySphere. Log in to accept or decline.
            </p>
          </div>

          <div class="btn-container">
            <a href="${actionLink}" class="cta-btn">
              ${isNewUser ? "Sign Up & Join Squad →" : "View My Invites →"}
            </a>
          </div>

          <p class="note">
            ${
              isNewUser
                ? "You don't have an account yet. Sign up on PlaySphere to accept this invitation."
                : "Log in to your PlaySphere account and visit your <strong>My Invites</strong> page to accept or decline."
            }
          </p>

          <div class="footer">
            PlaySphere Community Sports Platform • Tamil Nadu, India<br>
            Direct Link: <a href="${actionLink}" style="color: #D4AF37;">${actionLink}</a>
          </div>
        </div>
      </body>
    </html>
  `;

  // Prominent terminal logging for instant local testing & development
  console.log(`\n╔══════════════════════════════════════════════════════════════════════╗`);
  console.log(`║ 📩 PLAYSPHERE TEAM INVITATION EMAIL DISPATCH (DEV & PROD)             ║`);
  console.log(`╠══════════════════════════════════════════════════════════════════════╣`);
  console.log(`║ Recipient:     ${toEmail.padEnd(52, " ")} ║`);
  console.log(`║ Inviter:       ${inviterName.padEnd(52, " ")} ║`);
  console.log(`║ Squad:         ${teamName.padEnd(52, " ")} ║`);
  console.log(`║ Sport:         ${sport.padEnd(52, " ")} ║`);
  console.log(`║ User Type:     ${(isNewUser ? "New User (Sign up required)" : "Registered User").padEnd(52, " ")} ║`);
  console.log(`║ Action Link:   ${actionLink.padEnd(52, " ")} ║`);
  console.log(`╚══════════════════════════════════════════════════════════════════════╝\n`);

  if (!transporter) {
    return { success: true, isSimulated: true };
  }

  try {
    const info = await transporter.sendMail({
      from: `"PlaySphere Sports" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });

    console.log(`[Email] Team invite email dispatched successfully to ${toEmail} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId, isSimulated: false };
  } catch (error) {
    console.warn(`[Email] Failed to deliver invite email via SMTP to ${toEmail} (${error.message}). Logged to console.`);
    return { success: false, isSimulated: true, error: error.message };
  }
};

export default { sendVerificationEmail, sendTeamInviteEmail };
