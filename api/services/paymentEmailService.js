import { sendEmail } from "../utils/mailer.js";

/* Sends payment link email to user */
export const sendPaymentLinkEmail = async (
    email,
    checkoutUrl,
    paymentDetails,
    user
) => {
    try {
        const emailSent = await sendEmail(
            email,
            `Payment Link - Sprach Institut Cebu Inc.`,
            "",
            `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Link</title>
                <style>
                    body {
                        font-family: 'Open Sans', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        margin: 0;
                        padding: 20px;
                        background-color: #FFFDF2;
                    }
                    .container {
                        max-width: 700px;
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
                    .header p {
                        margin: 10px 0 0 0;
                        opacity: 0.9;
                        font-size: 16px;
                    }
                    .content {
                        padding: 30px;
                    }
                    .greeting {
                        font-size: 18px;
                        color: #333;
                        margin-bottom: 20px;
                    }
                    .payment-details {
                        background-color: #f8f9fa;
                        border-left: 4px solid #DE0000;
                        padding: 20px;
                        margin: 20px 0;
                        border-radius: 5px;
                    }
                    .payment-details h3 {
                        margin-top: 0;
                        color: #DE0000;
                        font-size: 18px;
                    }
                    .payment-button {
                        display: inline-block;
                        background-color: #DE0000;
                        color: white;
                        padding: 15px 30px;
                        text-decoration: none;
                        border-radius: 5px;
                        font-weight: bold;
                        font-size: 16px;
                        margin: 20px 0;
                        text-align: center;
                    }
                    .footer {
                        background-color: #f8f9fa;
                        padding: 20px;
                        text-align: center;
                        color: #666;
                        font-size: 14px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Payment Link</h1>
                        <p>Sprach Institut Cebu Inc.</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">
                            Hello ${user.firstName} ${user.lastName},
                        </div>
                        
                        <p>We have generated a secure payment link for you. Please click the button below to proceed with your payment.</p>
                        
                        <div class="payment-details">
                            <h3>Payment Details</h3>
                            <p><strong>Amount:</strong> ₱${paymentDetails.amount.toFixed(
                2
            )}</p>
                            <p><strong>Description:</strong> ${paymentDetails.description
            }</p>
                            ${paymentDetails.remarks
                ? `<p><strong>Remarks:</strong> ${paymentDetails.remarks}</p>`
                : ""
            }
                        </div>
                        
                        <div style="text-align: center;">
                            <a href="${checkoutUrl}" class="payment-button">
                                Proceed to Payment
                            </a>
                        </div>
                        
                        <p><strong>Important Notes:</strong></p>
                        <ul>
                            <li>This payment link is secure and encrypted</li>
                            <li>You can pay using various payment methods including credit/debit cards, GCash, and online banking</li>
                            <li>If you experience any issues, please contact our support team</li>
                        </ul>
                        
                        <p>If you cannot click the button above, please copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; background-color: #f8f9fa; padding: 10px; border-radius: 5px;">${checkoutUrl}</p>
                    </div>
                    
                    <div class="footer">
                        <p>This is an automated message from Sprach Institut Cebu Inc.</p>
                        <p>If you did not request this payment link, please contact us immediately.</p>
                    </div>
                </div>
            </body>
            </html>
            `
        );

        return emailSent;
    } catch (error) {
        console.error("Error sending payment link email:", error);
        return false;
    }
};

export default {
    sendPaymentLinkEmail,
};
