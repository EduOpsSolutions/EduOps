import { createTransport } from "nodemailer";

export const sendEmail = async (to, subject, text, html, bcc = undefined, attachments = undefined) => {
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
  if (attachments) console.log('Attachments:', attachments.map(a => a.filename));

  try {
    const mailOptions = {
      from: process.env.MAIL_USER,
      to,
      subject,
      text,
      html,
    };
    if (bcc) mailOptions.bcc = bcc;
    if (attachments) mailOptions.attachments = attachments;
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
  let filesHtml = '';
  if (post.files && Array.isArray(post.files) && post.files.length > 0) {
    filesHtml = `
      <div style="margin-top: 24px;">
        <h3 style="color: #890E07; margin-bottom: 8px;">Attachments:</h3>
        <ul style="padding-left: 20px;">
          ${post.files.map(file => `<li><a href="${file.url}" style="color: #007bff; text-decoration: underline;" target="_blank">${file.fileName}</a></li>`).join('')}
        </ul>
      </div>
    `;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 32px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); overflow: hidden;">
        <div style="background: #890E07; color: #fff; padding: 24px 32px;">
          <h1 style="margin: 0; font-size: 2rem;">EduOps Announcement</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #890E07; margin-top: 0;">${post.title}</h2>
          <p style="font-size: 1.1rem; color: #333; line-height: 1.6;">${post.content}</p>
          ${filesHtml}
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

  // Map post.files to nodemailer attachments if present
  let attachments = undefined;
  if (post.files && Array.isArray(post.files) && post.files.length > 0) {
    attachments = post.files.map(file => ({
      filename: file.fileName,
      path: file.url,
      contentType: file.fileType,
    }));
  }

  console.log('[sendPostEmail] Recipients:', recipients);
  if (attachments) console.log('[sendPostEmail] Attachments:', attachments.map(a => a.filename));
  return sendEmail('', subject, '', html, recipients, attachments);
};