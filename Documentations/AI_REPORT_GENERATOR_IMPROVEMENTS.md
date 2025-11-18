# AI Report Generator - Dynamic Database Access

## Quick Overview

The AI Report Generator has been enhanced with **flexible, on-demand database access** through predefined Prisma query templates. The AI can now dynamically request specific data to answer user questions and generate more accurate, detailed reports.

## What's New?

### Before
- AI had access to only a static snapshot of aggregated data
- Limited to predefined data structure
- Could not query specific subsets
- Could not drill down into details

### After
- AI can request fresh data on-demand using `DB_QUERY_REQUEST`
- 13 predefined query templates available
- Can filter by status, period, date ranges, and more
- Full security safeguards prevent unauthorized access

## Key Features

### 🔒 Security-First Design
- **No sensitive data exposure**: Passwords, reset tokens, emails excluded
- **Row limits**: Max 100 rows per query (default 50)
- **Whitelisted tables only**: Only approved tables accessible
- **Predefined queries only**: No SQL injection risk
- **SELECT-only**: No data modification possible

### 📊 Available Query Templates

**Data Retrieval (9 templates):**
1. `getStudents` - Get students with status filtering
2. `getTeachers` - Get teachers
3. `getCourses` - Get courses
4. `getAcademicPeriods` - Get academic periods
5. `getSchedules` - Get schedules with related data
6. `getEnrollments` - Get enrollments by period
7. `getPayments` - Get payment records
8. `getFees` - Get fees by course/batch
9. `getDocumentRequests` - Get document requests

**Aggregations (4 templates):**
1. `countStudentsByStatus` - Count students grouped by status
2. `countEnrollmentsByPeriod` - Count enrollments by period
3. `sumPaymentsByPeriod` - Sum payments by period
4. `getScheduleCapacityStats` - Get capacity statistics

### 🎯 How It Works

```
User: "Show me all active students"
    ↓
AI: Recognizes need for fresh data
    ↓
AI: Sends DB_QUERY_REQUEST with template "getStudents"
    ↓
Backend: Executes safe Prisma query
    ↓
Backend: Returns filtered data (no emails/passwords)
    ↓
Frontend: Adds data to conversation
    ↓
AI: Processes data and answers question
```

## Example Usage

### Example 1: List Active Students
**User:** "Show me all active students"

**AI automatically queries:**
```json
{
  "templateName": "getStudents",
  "parameters": { "status": "active", "limit": 50 }
}
```

**Result:** AI shows list of 45 active students (without sensitive data)

### Example 2: Financial Report
**User:** "Create a payment summary for this quarter"

**AI queries payment data, then generates:**
- Formatted table
- Summary statistics
- Period-over-period comparison

### Example 3: Capacity Analysis
**User:** "Which courses are almost full?"

**AI queries schedule capacity stats, then responds:**
"Courses nearing capacity:
1. English A1 - 28/30 (93% full)
2. Spanish B2 - 27/30 (90% full)
..."

## Files Created/Modified

### New Files
- `api/utils/dbQueryTemplates.js` - Query template system (520 lines)

### Modified Files
- `api/controller/ai_controller.js` - Added query handling
- `client/src/pages/admin/Reports.js` - Frontend integration

### Documentation
- `Documentations/AI_DYNAMIC_DATABASE_ACCESS.md` - Full technical docs
- `Documentations/AI_REPORT_GENERATOR_IMPROVEMENTS.md` - This file

## Configuration

### Row Limits
```javascript
// In api/utils/dbQueryTemplates.js
const MAX_ROWS = 100;        // Hard maximum
const DEFAULT_ROWS = 50;     // Default limit
```

### Sensitive Columns
```javascript
const SENSITIVE_COLUMNS = ["password", "resetToken", "resetTokenExpiry"];
const EXCLUDED_COLUMNS = ["email"];
```

## Try It Out!

Open the AI Report Generator and try these prompts:

1. **"Show me all active students"** - Tests basic data retrieval
2. **"Get payment statistics for the last month"** - Tests date filtering
3. **"Which schedules have the most enrollment?"** - Tests aggregation
4. **"Create a course enrollment report table"** - Tests full report generation
5. **"How many students are enrolled vs inactive?"** - Tests counting

## Benefits

✅ **More Accurate Reports** - AI uses fresh, specific data
✅ **Better User Experience** - Natural language queries
✅ **Security Maintained** - No sensitive data exposure
✅ **Flexible Analysis** - AI can drill down as needed
✅ **Scalable** - Easy to add new query templates

## Future Enhancements

- [ ] Query result caching for performance
- [ ] Additional templates for advanced analytics
- [ ] Visual query builder for admins
- [ ] Rate limiting per user/session
- [ ] Custom query template creation UI

## Technical Details

For full technical documentation including:
- Architecture diagrams
- Security safeguards
- Error handling
- Performance considerations
- Testing guidelines

See: `Documentations/AI_DYNAMIC_DATABASE_ACCESS.md`

## Questions?

This implementation provides a flexible, secure way for the AI to access educational data while maintaining strict privacy and security controls. The predefined template approach ensures type safety and prevents unauthorized access while giving users a powerful, natural language interface to their data.
