# Payment Logging Implementation

## Overview

This document describes the comprehensive security logging implementation for payment operations in the EduOps platform. All payment-related events are now tracked with detailed audit trails.

## Features Implemented

### 1. Payment Link Creation Logging

**Location:** `api/services/payment_service.js` - `sendPaymentLinkViaEmail` function

#### Success Logging

When a payment link is successfully created and sent:

```javascript
logSecurityEvent(
  'Payment link created and sent',
  userId || 'GUEST',
  MODULE_TYPES.PAYMENTS,
  `Payment link created: Transaction ID [...] for User (email)...`
);
```

**Logged Information:**

- Transaction ID
- User name (first and last)
- Email address
- Payment amount
- Fee type
- Description

#### Email Failure Logging

When email sending fails but payment record was created:

```javascript
logSecurityEvent(
  'Payment link email failed',
  userId || 'GUEST',
  MODULE_TYPES.PAYMENTS,
  `Failed to send payment link email for Transaction ID [...] to email...`
);
```

**Logged Information:**

- Transaction ID
- Email address
- Payment amount

#### Creation Failure Logging

When payment link creation completely fails:

```javascript
logSecurityEvent(
  'Payment link creation failed',
  userId || 'GUEST',
  MODULE_TYPES.PAYMENTS,
  `Error creating payment link for User (email). Amount: ..., Error: ...`
);
```

**Logged Information:**

- User name
- Email address
- Payment amount
- Error message

### 2. Payment Success Logging

**Location:** `api/services/paymongo_service.js` - `processWebhookEvent` function

When a payment is successfully completed (status changes to 'paid'):

```javascript
logSecurityEvent(
  'Payment successful',
  user.userId || 'GUEST',
  MODULE_TYPES.PAYMENTS,
  `Payment completed: Transaction ID [...] for User (email)...`
);
```

**Logged Information:**

- Transaction ID
- User name (or "Guest" for guest payments)
- Email address
- Payment amount
- Payment method (Credit Card, GCash, PayMaya, etc.)
- Fee type
- Reference number

### 3. Payment Failure Logging

**Location:** `api/services/paymongo_service.js` - `processWebhookEvent` function

When a payment fails (status changes to 'failed'):

```javascript
logSecurityEvent(
  'Payment failed',
  user.userId || 'GUEST',
  MODULE_TYPES.PAYMENTS,
  `Payment failed: Transaction ID [...] for User (email)...`
);
```

**Logged Information:**

- Transaction ID
- User name (or "Guest" for guest payments)
- Email address
- Payment amount
- Reference number

## Files Modified

1. **api/services/payment_service.js**

   - Added imports: `logSecurityEvent`, `MODULE_TYPES`
   - Added logging in `sendPaymentLinkViaEmail` function (lines 549-594)
   - Logs: payment link creation success, email failure, and complete failure

2. **api/services/paymongo_service.js**
   - Added imports: `logSecurityEvent`, `MODULE_TYPES`
   - Added logging in `processWebhookEvent` function (lines 393-420)
   - Logs: payment success and payment failure

## Log Entry Examples

### Payment Link Created

```
Title: Payment link created and sent
User ID: student001 (or GUEST)
Module: PAYMENTS
Content: Payment link created: Transaction ID [PAY-20251031-ABC12] for Juan Dela Cruz (juan@email.com). Amount: ₱5000.00, Fee Type: tuition_fee, Description: Language Course Payment
Timestamp: 2025-10-31 14:30:00
```

### Payment Successful

```
Title: Payment successful
User ID: student001 (or GUEST)
Module: PAYMENTS
Content: Payment completed: Transaction ID [PAY-20251031-ABC12] for Juan Dela Cruz (juan@email.com). Amount: ₱5000.00, Payment Method: GCash, Fee Type: tuition_fee, Reference: pay_xyz123abc
Timestamp: 2025-10-31 14:35:00
```

### Payment Failed

```
Title: Payment failed
User ID: student001 (or GUEST)
Module: PAYMENTS
Content: Payment failed: Transaction ID [PAY-20251031-DEF45] for Maria Santos (maria@email.com). Amount: ₱3000.00, Reference: pay_abc456xyz
Timestamp: 2025-10-31 15:00:00
```

### Payment Link Creation Failed

```
Title: Payment link creation failed
User ID: GUEST
Module: PAYMENTS
Content: Error creating payment link for Pedro Garcia (pedro@email.com). Amount: ₱2500.00, Error: SMTP connection timeout
Timestamp: 2025-10-31 16:00:00
```

## Event Types Logged

| Event Type                    | Trigger                                         | Status     |
| ----------------------------- | ----------------------------------------------- | ---------- |
| Payment link created and sent | Payment link successfully created and emailed   | ✅ Success |
| Payment link email failed     | Payment record created but email failed to send | ⚠️ Warning |
| Payment link creation failed  | Complete failure in payment link creation       | ❌ Error   |
| Payment successful            | Payment completed via webhook                   | ✅ Success |
| Payment failed                | Payment failed via webhook                      | ❌ Error   |

## Security Audit Trail

All payment events are logged to the security logs table with:

- **User ID**: Who initiated or is associated with the payment
- **Module Type**: PAYMENTS
- **Timestamp**: Automatic timestamp
- **Event Details**: Comprehensive information about the transaction

### Guest Payments

For payments made by users who are not logged in:

- User ID is set to "GUEST"
- Email and name are still captured from payment form
- Full transaction details are logged

## Querying Payment Logs

### Get All Payment Logs

```sql
SELECT * FROM security_logs
WHERE moduleType = 'PAYMENTS'
ORDER BY createdAt DESC;
```

### Get Successful Payments

```sql
SELECT * FROM security_logs
WHERE moduleType = 'PAYMENTS'
AND title = 'Payment successful'
ORDER BY createdAt DESC;
```

### Get Failed Payments

```sql
SELECT * FROM security_logs
WHERE moduleType = 'PAYMENTS'
AND (title = 'Payment failed' OR title LIKE '%failed%')
ORDER BY createdAt DESC;
```

### Get User's Payment History

```sql
SELECT * FROM security_logs
WHERE moduleType = 'PAYMENTS'
AND userId = 'student001'
ORDER BY createdAt DESC;
```

### Get Payment by Transaction ID

```sql
SELECT * FROM security_logs
WHERE moduleType = 'PAYMENTS'
AND content LIKE '%PAY-20251031-ABC12%'
ORDER BY createdAt DESC;
```

## Monitoring & Alerts

### Key Metrics to Monitor

1. **Payment Link Creation Rate**

   - Track successful vs failed link creation
   - Alert if failure rate > 10%

2. **Payment Success Rate**

   - Track successful vs failed payments
   - Alert if success rate < 90%

3. **Email Delivery Rate**

   - Track payment link email delivery
   - Alert if delivery failure rate > 5%

4. **Response Time**
   - Monitor time between link creation and payment completion
   - Alert if average time > 24 hours

### Sample Monitoring Query

```sql
-- Payment statistics for today
SELECT
  title as event_type,
  COUNT(*) as count,
  DATE(createdAt) as date
FROM security_logs
WHERE moduleType = 'PAYMENTS'
AND DATE(createdAt) = CURDATE()
GROUP BY title, DATE(createdAt);
```

## Integration with Existing Systems

### Security Logs Table

Logs are stored in the existing `security_logs` table with schema:

```prisma
model security_logs {
  id         String   @id @default(uuid())
  title      String
  userId     String
  moduleType String
  content    String   @db.Text
  createdAt  DateTime @default(now())
}
```

### Module Types

Payment logs use the existing `MODULE_TYPES.PAYMENTS` constant from:
`api/constants/module_types.js`

## Benefits

1. **Complete Audit Trail**: Every payment action is logged
2. **Fraud Detection**: Unusual patterns can be identified
3. **Customer Support**: Easy to track payment issues
4. **Compliance**: Meet audit and regulatory requirements
5. **Analytics**: Payment success/failure trends
6. **Troubleshooting**: Detailed error information for debugging

## Best Practices

1. **Never Log Sensitive Data**: Card numbers, CVVs, passwords are never logged
2. **Use Transaction IDs**: Always reference transaction IDs for correlation
3. **Guest Privacy**: Guest payments use "GUEST" user ID but still log email
4. **Error Details**: Always include error messages for failed operations
5. **Consistent Format**: All logs follow the same format for easy parsing

## Future Enhancements

1. **Real-time Alerts**: Send notifications for failed payments
2. **Dashboard**: Visual analytics of payment logs
3. **Anomaly Detection**: ML-based fraud detection
4. **Export Functionality**: Export payment logs to CSV/PDF
5. **Webhook Retry Logging**: Log webhook retry attempts
6. **Payment Refund Logging**: Track refund operations

## Testing Checklist

- [ ] Payment link creation logs correctly
- [ ] Payment link email failure logs correctly
- [ ] Payment link creation failure logs correctly
- [ ] Successful payment logs correctly with all details
- [ ] Failed payment logs correctly
- [ ] Guest payments log with GUEST user ID
- [ ] Registered user payments log with correct user ID
- [ ] All payment methods are logged (GCash, Card, etc.)
- [ ] Transaction IDs are consistent across all logs
- [ ] Amounts are formatted correctly (₱X,XXX.XX)
- [ ] Email addresses are logged
- [ ] Timestamps are accurate

## Troubleshooting

### Logs Not Appearing

**Issue**: Payment events are not showing in security logs

**Possible Causes:**

1. Logger function not properly imported
2. Database connection issues
3. Incorrect MODULE_TYPES constant

**Solutions:**

1. Check imports in payment service files
2. Verify database connectivity
3. Ensure `MODULE_TYPES.PAYMENTS` exists in constants

### Incomplete Log Data

**Issue**: Some fields are missing in logs

**Possible Causes:**

1. User data not available (guest payment)
2. Payment object incomplete
3. Email not captured

**Solutions:**

1. Check for null/undefined values before logging
2. Use fallback values (e.g., "GUEST", "N/A")
3. Verify payment form captures all required fields

### Duplicate Logs

**Issue**: Same event logged multiple times

**Possible Causes:**

1. Webhook retry mechanism
2. Multiple webhook events for same payment
3. Error in webhook processing

**Solutions:**

1. Add transaction ID check before logging
2. Implement idempotency in webhook handler
3. Review webhook event types

## Support

For issues or questions about payment logging:

- **Documentation**: This file
- **Security Logs**: Check `security_logs` table in database
- **Email**: eduops.a@gmail.com

---

**Implementation Date:** October 31, 2025  
**Version:** 1.0.0  
**Author:** EduOps Development Team

**Related Documentation:**

- Payment System Documentation
- Security Logging Guide
- PayMongo Integration Guide
