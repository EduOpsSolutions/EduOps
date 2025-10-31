import { createTransport } from "nodemailer";

export const sendEmail = async (to, subject, text, html, bcc = undefined) => {
  const transporter = createTransport({
    service: "gmail",
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
  });

  console.log('[sendEmail] Sending email...');
  console.log('To:', to);
  if (bcc) console.log('BCC:', bcc);
  console.log('Subject:', subject);

  try {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject,
      text,
      html,
    };
    if (bcc) mailOptions.bcc = bcc;
    const info = await transporter.sendMail(mailOptions);
    console.log('[sendEmail] Email sent:', info.response);
    return true;
  } catch (error) {
    console.log('[sendEmail] Error sending email:', error);
    return false;
  }
};

export const sendPostEmail = async (post, recipients) => {
  const subject = `New Announcement: ${post.title}`;
  const html = `
    <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 32px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); overflow: hidden;">
        <div style="background: #890E07; color: #fff; padding: 24px 32px;">
          <h1 style="margin: 0; font-size: 2rem;">EduOps Announcement</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #890E07; margin-top: 0;">${post.title}</h2>
          <p style="font-size: 1.1rem; color: #333; line-height: 1.6;">${post.content}</p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #555; font-size: 1rem;">
            <strong>Posted by:</strong> ${post.user?.firstName || ''} ${post.user?.lastName || ''}
          </p>
        </div>
        <div style="background: #f1f1f1; color: #888; text-align: center; padding: 16px 0; font-size: 0.9rem;">
          &copy; ${new Date().getFullYear()} EduOps. All rights reserved.
        </div>
      </div>
    </div>
  `;

  console.log('[sendPostEmail] Recipients:', recipients);
  return sendEmail('', subject, '', html, recipients);
};