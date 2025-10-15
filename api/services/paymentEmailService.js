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

/* Sends payment receipt/invoice email to user after successful payment */
export const sendPaymentReceiptEmail = async (
    email,
    paymentDetails,
    user
) => {
    try {
        // Format date
        const formatDate = (date) => {
            return new Date(date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        };

        // Format currency
        const formatCurrency = (amount) => {
            return new Intl.NumberFormat('en-PH', {
                style: 'currency',
                currency: 'PHP',
                minimumFractionDigits: 2
            }).format(amount);
        };

        // Format fee type to user-friendly labels
        const formatFeeType = (feeType) => {
            if (!feeType) return 'Payment';
            
            const feeTypeLabels = {
                'tuition_fee': 'Tuition Fee',
                'enrollment_fee': 'Enrollment Fee',
                'miscellaneous_fee': 'Miscellaneous Fee',
                'down_payment': 'Down Payment',
                'full_payment': 'Full Payment',
                'installment_payment': 'Installment Payment',
                'late_fee': 'Late Fee',
                'library_fee': 'Library Fee',
                'laboratory_fee': 'Laboratory Fee',
                'computer_fee': 'Computer Fee',
                'athletic_fee': 'Athletic Fee',
                'medical_fee': 'Medical Fee',
                'graduation_fee': 'Graduation Fee',
                'transcript_fee': 'Transcript Fee',
                'id_fee': 'ID Fee',
                'uniform_fee': 'Uniform Fee',
                'book_fee': 'Book Fee',
                'exam_fee': 'Exam Fee',
                'certification_fee': 'Certification Fee',
                'registration_fee': 'Registration Fee'
            };
            
            return feeTypeLabels[feeType.toLowerCase()] || feeType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        };

        const emailSent = await sendEmail(
            email,
            `Payment Receipt - Sprach Institut Cebu Inc.`,
            "",
            `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Payment Receipt</title>
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
                    .message {
                        color: #555;
                        margin-bottom: 30px;
                        font-size: 16px;
                        line-height: 1.7;
                    }
                    .info-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 20px 0;
                        background-color: #fff;
                        border-radius: 8px;
                        overflow: hidden;
                        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    }
                    .section-header {
                        background-color: #f8f9fa;
                        color: #495057;
                        font-weight: 600;
                        padding: 15px;
                        text-align: left;
                        border-bottom: 2px solid #e9ecef;
                        font-size: 16px;
                    }
                    .info-table tr:nth-child(even) {
                        background-color: #f8f9fa;
                    }
                    .info-table td {
                        padding: 12px 15px;
                        border-bottom: 1px solid #e9ecef;
                        vertical-align: top;
                    }
                    .info-table td:first-child {
                        font-weight: 600;
                        color: #495057;
                        width: 35%;
                        background-color: #f1f3f4;
                    }
                    .info-table td:last-child {
                        color: #333;
                    }
                    .footer {
                        background-color: #f8f9fa;
                        padding: 25px;
                        text-align: center;
                        color: #6c757d;
                        font-size: 14px;
                        border-top: 1px solid #e9ecef;
                    }
                    .receipt-id {
                        background-color: #890E07;
                        color: white;
                        padding: 15px;
                        text-align: center;
                        margin: 20px 0;
                        border-radius: 8px;
                        font-size: 18px;
                        font-weight: 600;
                    }
                    .next-steps {
                        background-color: #ffe6e6;
                        border-left: 4px solid #DE0000;
                        padding: 20px;
                        margin: 25px 0;
                        border-radius: 0 8px 8px 0;
                    }
                    .next-steps h3 {
                        margin: 0 0 10px 0;
                        color: #890E07;
                        font-size: 18px;
                    }
                    .next-steps p {
                        margin: 0;
                        color: #555;
                        line-height: 1.6;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Payment Receipt</h1>
                        <p>Sprach Institut Cebu Inc.</p>
                    </div>
                    
                    <div class="content">
                        <div class="greeting">Greetings!</div>
                        
                        <div class="message">
                            Thank you for your payment. Here's a copy of your receipt.
                            Please save this receipt for your records and future reference.
                        </div>

                        <div class="receipt-id">
                            Receipt No: <strong>${paymentDetails.transactionId}</strong>
                        </div>

                        <table class="info-table">
                            <tr class="section-header">
                                <td colspan="2">Transaction Details</td>
                            </tr>
                            <tr>
                                <td>Transaction ID</td>
                                <td>${paymentDetails.transactionId}</td>
                            </tr>
                            ${paymentDetails.referenceNumber ? `
                            <tr>
                                <td>Reference Number</td>
                                <td>${paymentDetails.referenceNumber}</td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td>Payment Method</td>
                                <td>${paymentDetails.paymentMethod}</td>
                            </tr>
                            <tr>
                                <td>Amount Paid</td>
                                <td><strong>${formatCurrency(paymentDetails.amount)}</strong></td>
                            </tr>
                            <tr>
                                <td>Payment Date</td>
                                <td>${formatDate(paymentDetails.paidAt || paymentDetails.createdAt)}</td>
                            </tr>
                            <tr>
                                <td>Status</td>
                                <td><strong style="color: #28a745;">PAID</strong></td>
                            </tr>
                        </table>

                        <table class="info-table">
                            <tr class="section-header">
                                <td colspan="2">Payment Information</td>
                            </tr>
                            <tr>
                                <td>Student Name</td>
                                <td>${user.studentName || 'N/A'}</td>
                            </tr>
                            ${user.student_id ? `
                            <tr>
                                <td>Student ID</td>
                                <td>${user.student_id}</td>
                            </tr>
                            ` : ''}
                            ${paymentDetails.remarks ? `
                            <tr>
                                <td>Description</td>
                                <td>${paymentDetails.remarks}</td>
                            </tr>
                            ` : ''}
                            <tr>
                                <td>Currency</td>
                                <td>${paymentDetails.currency || 'PHP'}</td>
                            </tr>
                        </table>

                        

                        <div class="next-steps">
                            <h3>Important Notes</h3>
                            <p>
                                • This is an official receipt and proof of payment from Sprach Institut Cebu Inc.<br>
                                • For any inquiries about this transaction, contact our finance office.<br>
                                • Reference this transaction ID: <strong>${paymentDetails.transactionId}</strong><br>
                            </p>
                        </div>
                    </div>
                    
                    <div class="footer">
                        <p><strong>Sprach Institut Cebu Inc.</strong></p>
                        <p>Thank you for your payment. We appreciate your continued trust in our institution.</p>
                        <p><em>This is an automated message. Please do not reply to this email.</em></p>
                    </div>
                </div>
            </body>
            </html>
            `
        );

        return emailSent;
    } catch (error) {
        console.error("Error sending payment receipt email:", error);
        return false;
    }
};

export default {
    sendPaymentLinkEmail,
    sendPaymentReceiptEmail,
};
