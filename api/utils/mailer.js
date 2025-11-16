import { createTransport } from 'nodemailer';

export const sendEmail = async (
  to,
  subject,
  text,
  html,
  bcc = undefined,
  attachments = undefined
) => {
  const transporter = createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // use STARTTLS
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASSWORD,
    },
    connectionTimeout: 60000, // 60 seconds
    greetingTimeout: 30000,   // 30 seconds
    socketTimeout: 60000,     // 60 seconds
    tls: {
      rejectUnauthorized: false,
      ciphers: 'SSLv3'
    }
  });

  console.log('[sendEmail] Sending email...');
  console.log('To:', to);
  if (bcc) console.log('BCC:', bcc);
  console.log('Subject:', subject);
  if (attachments)
    console.log(
      'Attachments:',
      attachments.map((a) => a.filename)
    );

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
          ${post.files
            .map(
              (file) =>
                `<li><a href="${file.url}" style="color: #007bff; text-decoration: underline;" target="_blank">${file.fileName}</a></li>`
            )
            .join('')}
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
          <p style="font-size: 1.1rem; color: #333; line-height: 1.6;">${
            post.content
          }</p>
          ${filesHtml}
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #555; font-size: 1rem;">
            <strong>Posted by:</strong> ${post.user?.firstName || ''} ${
    post.user?.lastName || ''
  }
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
    attachments = post.files.map((file) => ({
      filename: file.fileName,
      path: file.url,
      contentType: file.fileType,
    }));
  }

  console.log('[sendPostEmail] Recipients:', recipients);
  if (attachments)
    console.log(
      '[sendPostEmail] Attachments:',
      attachments.map((a) => a.filename)
    );
  return sendEmail('', subject, '', html, recipients, attachments);
};

export const sendAccountCreationEmail = async (user, generatedPassword) => {
  const subject = 'Your EduOps Account Has Been Created';
  const html = `
    <div style="font-family: Arial, sans-serif; background: #f7f7f7; padding: 32px;">
      <div style="max-width: 600px; margin: auto; background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.07); overflow: hidden;">
        <div style="background: #890E07; color: #fff; padding: 24px 32px;">
          <h1 style="margin: 0; font-size: 2rem;">Welcome to Sprach Institut!</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #890E07; margin-top: 0;">Your Account Has Been Created</h2>
          <p style="font-size: 1.1rem; color: #333; line-height: 1.6;">
            Hello ${user.firstName} ${user.lastName},
          </p>
          <p style="font-size: 1rem; color: #333; line-height: 1.6;">
            Your EduOps account has been successfully created. Below are your account details:
          </p>
          <div style="background: #f9f9f9; border-left: 4px solid #890E07; padding: 16px; margin: 24px 0;">
            <p style="margin: 8px 0; font-size: 0.95rem; color: #333;">
              <strong>User ID:</strong> ${user.userId}
            </p>
            <p style="margin: 8px 0; font-size: 0.95rem; color: #333;">
              <strong>Email:</strong> ${user.email}
            </p>
            <p style="margin: 8px 0; font-size: 0.95rem; color: #333;">
              <strong>Temporary Password:</strong> <code style="background: #fff; padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; font-weight: bold; color: #890E07;">${generatedPassword}</code>
            </p>
          </div>
          <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 16px; margin: 24px 0;">
            <p style="margin: 0; font-size: 0.95rem; color: #856404;">
              <strong>⚠️ Important:</strong> For security reasons, you will be required to change your password on your first login.
            </p>
          </div>
          <p style="font-size: 1rem; color: #333; line-height: 1.6; margin-top: 24px;">
            Please keep this information secure and do not share your password with anyone.
          </p>
          <hr style="margin: 32px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #555; font-size: 0.9rem;">
            If you did not request this account, please contact the administrator immediately.
          </p>
        </div>
        <div style="background: #f1f1f1; color: #888; text-align: center; padding: 16px 0; font-size: 0.9rem;">
          &copy; ${new Date().getFullYear()} EduOps. All rights reserved.
        </div>
      </div>
    </div>
  `;

  const text = `
Welcome to EduOps!

Your account has been created successfully.

Account Details:
- User ID: ${user.userId}
- Email: ${user.email}
- Temporary Password: ${generatedPassword}

IMPORTANT: You will be required to change your password on your first login.

Please keep this information secure and do not share your password with anyone.

If you did not request this account, please contact the administrator immediately.
  `;

  return sendEmail(user.email, subject, text, html);
};
