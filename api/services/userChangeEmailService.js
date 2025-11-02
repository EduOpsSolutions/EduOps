import { sendEmail } from '../utils/mailer.js';

/* Sends email notification to old email address when email is changed */
export const sendEmailChangeNotification = async (
  oldEmail,
  newEmail,
  userName,
  changedBy
) => {
  try {
    const emailSent = await sendEmail(
      oldEmail,
      `Email Address Change Notification - EduOps`,
      '',
      `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Email Change Notification</title>
                <style>
                    body {
                        font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        margin: 0;
                        padding: 20px;
                        background-color: #FFFDF2;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        border-radius: 10px;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        overflow: hidden;
                    }
                    .header {
                        background-color: #DE0000;
                        color: white;
                        padding: 30px 20px;
                        text-align: center;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 28px;
                        font-weight: 300;
                    }
                    .content {
                        padding: 30px;
                        color: #333;
                    }
                    .alert-box {
                        background-color: #FFF3CD;
                        border-left: 4px solid #FFC107;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .info-box {
                        background-color: #E7F3FF;
                        border-left: 4px solid #2196F3;
                        padding: 15px;
                        margin: 20px 0;
                        border-radius: 4px;
                    }
                    .email-info {
                        background-color: #f8f9fa;
                        padding: 15px;
                        border-radius: 4px;
                        margin: 15px 0;
                    }
                    .email-info strong {
                        color: #DE0000;
                    }
                    .footer {
                        background-color: #f8f9fa;
                        padding: 20px;
                        text-align: center;
                        font-size: 12px;
                        color: #666;
                        border-top: 1px solid #e0e0e0;
                    }
                    .contact-info {
                        margin-top: 20px;
                        padding: 15px;
                        background-color: #f8f9fa;
                        border-radius: 4px;
                    }
                    .contact-info a {
                        color: #DE0000;
                        text-decoration: none;
                        font-weight: bold;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 Email Address Changed</h1>
                    </div>
                    <div class="content">
                        <p>Hello <strong>${userName}</strong>,</p>
                        
                        <div class="alert-box">
                            <strong>⚠️ Important Security Notice</strong>
                            <p style="margin: 10px 0 0 0;">Your account email address has been changed by an administrator.</p>
                        </div>

                        <div class="email-info">
                            <p style="margin: 5px 0;"><strong>Previous Email:</strong> ${oldEmail}</p>
                            <p style="margin: 5px 0;"><strong>New Email:</strong> ${newEmail}</p>
                            <p style="margin: 5px 0;"><strong>Changed By:</strong> ${changedBy}</p>
                            <p style="margin: 5px 0;"><strong>Date & Time:</strong> ${new Date().toLocaleString(
                              'en-US',
                              {
                                dateStyle: 'full',
                                timeStyle: 'long',
                              }
                            )}</p>
                        </div>

                        <div class="info-box">
                            <p style="margin: 0;"><strong>📧 What This Means:</strong></p>
                            <ul style="margin: 10px 0;">
                                <li>Your account login email has been updated to the new address</li>
                                <li>Future communications will be sent to your new email</li>
                                <li>You will need to use the new email address to log in</li>
                            </ul>
                        </div>

                        <div class="alert-box" style="background-color: #FFEBEE; border-left-color: #F44336;">
                            <p style="margin: 0;"><strong>⚠️ Did NOT request this change?</strong></p>
                            <p style="margin: 10px 0 0 0;">If you did not request or authorize this email change, please contact us immediately for security reasons.</p>
                        </div>

                        <div class="contact-info">
                            <p style="margin: 0;"><strong>Need Help?</strong></p>
                            <p style="margin: 10px 0 0 0;">Contact EduOps Support: <a href="mailto:eduops.a@gmail.com">eduops.a@gmail.com</a></p>
                        </div>

                        <p style="margin-top: 30px;">
                            Thank you for your attention to this matter.
                        </p>
                        <p>
                            Best regards,<br>
                            <strong>EduOps Team</strong>
                        </p>
                    </div>
                    <div class="footer">
                        <p>This is an automated security notification from EduOps Platform.</p>
                        <p>© ${new Date().getFullYear()} EduOps. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            `
    );

    return emailSent;
  } catch (error) {
    console.error('Error sending email change notification:', error);
    throw error;
  }
};
