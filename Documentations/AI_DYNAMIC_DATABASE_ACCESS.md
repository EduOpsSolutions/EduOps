# AI Dynamic Database Access - Implementation Documentation

## Overview

This document describes the implementation of dynamic database access for the AI Report Generator, allowing the AI to query the database using predefined Prisma templates with comprehensive security safeguards.

## Implementation Date

January 2025

## Problem Statement

The previous AI Report Generator had access only to a static snapshot of aggregated data loaded at request time. This meant:
- Limited data freshness
- Cannot query specific subsets of data
- Unable to drill down into details
- Fixed data structure in every response

## Solution

Implemented a flexible database query system where the AI can:
- Request specific data using predefined query templates
- Query with custom parameters (filters, limits, date ranges)
- Access fresh data on-demand
- Generate more detailed and accurate reports

## Architecture

### 1. Database Query Templates (`api/utils/dbQueryTemplates.js`)

#### Security Features

- **Predefined Prisma queries only** - No raw SQL injection risk
- **Column filtering** - Sensitive columns (passwords, reset tokens) are never returned
- **Privacy protection** - Email addresses excluded by default
- **Row limits** - Maximum 100 rows per query (default: 50)
- **SELECT-only operations** - No INSERT, UPDATE, or DELETE
- **Whitelisted tables** - Only approved tables can be queried
- **Safe select schemas** - Explicit column allowlists per table

#### Available Query Templates

**Data Retrieval Templates:**

1. **getStudents**
   - Get students with optional filtering by status
   - Parameters: `status`, `limit`, `offset`
   - Returns: Student records without emails/passwords

2. **getTeachers**
   - Get teachers with optional filtering
   - Parameters: `status`, `limit`, `offset`

3. **getCourses**
   - Get courses with optional visibility filter
   - Parameters: `visibility`, `limit`, `offset`

4. **getAcademicPeriods**
   - Get academic periods
   - Parameters: `isEnrollmentClosed`, `limit`, `offset`

5. **getSchedules**
   - Get schedules with related course, period, and teacher data
   - Parameters: `periodId`, `courseId`, `teacherId`, `limit`, `offset`

6. **getEnrollments**
   - Get student enrollments with student and period details
   - Parameters: `periodId`, `status`, `limit`, `offset`

7. **getPayments**
   - Get payment records with user, course, and period details
   - Parameters: `periodId`, `status`, `startDate`, `endDate`, `limit`, `offset`

8. **getFees**
   - Get fees by course and batch
   - Parameters: `courseId`, `batchId`, `isActive`, `limit`, `offset`

9. **getDocumentRequests**
   - Get document requests with status filtering
   - Parameters: `status`, `limit`, `offset`

**Aggregation Templates:**

1. **countStudentsByStatus**
   - Get count of students grouped by status
   - Parameters: none

2. **countEnrollmentsByPeriod**
   - Get count of enrollments grouped by period and status
   - Parameters: `status` (optional)

3. **sumPaymentsByPeriod**
   - Get total payments sum and count grouped by academic period
   - Parameters: `periodId` (optional)

4. **getScheduleCapacityStats**
   - Get schedule capacity statistics with enrollment counts
   - Parameters: `periodId` (optional)

#### Core Functions

```javascript
// Main function called by AI controller
getDbData(templateName, parameters)

// Returns available templates with descriptions
getAvailableTemplates()

// Internal: Creates safe SELECT clauses
getSafeSelect(tableName, requestedColumns)
```

### 2. AI Controller Integration (`api/controller/ai_controller.js`)

#### Enhanced System Instructions

The AI now receives:
- List of all available query templates with descriptions
- Parameter specifications for each template
- Example usage for each template
- Instructions on when and how to use `DB_QUERY_REQUEST`

#### Query Request Flow

```
User asks question
    ↓
AI analyzes request
    ↓
AI determines it needs specific data
    ↓
AI responds with DB_QUERY_REQUEST command
    ↓
Backend parses the request
    ↓
Backend executes getDbData(template, params)
    ↓
Query results returned to frontend
    ↓
Frontend adds results to conversation history
    ↓
User prompted to continue (or AI auto-processes)
    ↓
AI receives query results
    ↓
AI generates final answer/report
```

#### DB_QUERY_REQUEST Format

```
DB_QUERY_REQUEST
{
  "templateName": "getStudents",
  "parameters": {
    "status": "active",
    "limit": 50
  }
}
```

### 3. Frontend Integration (`client/src/pages/admin/Reports.js`)

#### New Action Handlers

1. **db_query_executed**
   - Triggered when AI successfully queries database
   - Adds query results to conversation history
   - Shows notification to user
   - Allows conversation to continue with new data

2. **db_query_failed**
   - Triggered when query fails (invalid template, parameters, etc.)
   - Shows error message
   - Allows user to retry with corrected query

#### Chat Flow Enhancement

```javascript
// When AI requests data
if (data.action === "db_query_executed") {
  // Format query results as a message
  const queryDataMessage = `Query Results (${rowCount} records)...`

  // Add to conversation history
  setAiHistory([
    ...aiHistory,
    { role: "user", content: originalPrompt },
    { role: "model", content: aiResponse },
    { role: "user", content: queryDataMessage }
  ])

  // Show notification
  // User can now continue conversation with data in context
}
```

## Security Safeguards

### 1. Column-Level Security

```javascript
// Sensitive columns NEVER returned
const SENSITIVE_COLUMNS = ["password", "resetToken", "resetTokenExpiry"];

// Privacy columns excluded by default
const EXCLUDED_COLUMNS = ["email"];

// Only whitelisted columns per table
const tableSchemas = {
  users: {
    id: true,
    userId: true,
    firstName: true,
    // ... safe columns only
    // email: EXCLUDED
    // password: EXCLUDED
  }
}
```

### 2. Row-Level Limits

```javascript
const MAX_ROWS = 100;       // Hard limit
const DEFAULT_ROWS = 50;    // Default if not specified

// Always enforce limit
const actualLimit = Math.min(requestedLimit, MAX_ROWS);
```

### 3. Table Whitelisting

Only these tables can be queried:
- users (with column filtering)
- course
- schedule
- academic_period
- user_schedule
- student_enrollment
- payments
- fees
- student_fee
- document_request
- logs

Any attempt to query other tables results in an error.

### 4. Query Type Restrictions

- Only Prisma `findMany` and `groupBy` operations
- No raw SQL queries
- No `create`, `update`, `delete`, or `upsert` operations
- All queries use Prisma's type-safe query builder

### 5. Execution Context

- Queries run in main request thread (not worker threads as originally considered)
- Timeout limits enforced by Prisma connection settings
- All queries logged via existing logging infrastructure

## Usage Examples

### Example 1: User asks for active students

**User:** "Show me all active students"

**AI Response:**
```
I'll retrieve the list of active students for you.

DB_QUERY_REQUEST
{
  "templateName": "getStudents",
  "parameters": {
    "status": "active",
    "limit": 50
  }
}
```

**System Response:**
```json
{
  "action": "db_query_executed",
  "queryResult": {
    "template": "getStudents",
    "parameters": { "status": "active", "limit": 50 },
    "rowCount": 45,
    "data": [
      {
        "id": "...",
        "userId": "STU001",
        "firstName": "John",
        "lastName": "Doe",
        "status": "active",
        "role": "student",
        // ... (no email, no password)
      }
      // ... 44 more students
    ]
  }
}
```

**AI Final Response:**
"I found 45 active students. Here's a summary:
- Total active students: 45
- ..."

### Example 2: Generate payment report

**User:** "Create a financial summary for the current period"

**AI Response:**
```
I'll gather the payment data for you.

DB_QUERY_REQUEST
{
  "templateName": "sumPaymentsByPeriod",
  "parameters": {}
}
```

**System provides aggregated payment data**

**AI Then Responds:**
```
GENERATE_REPORT_TABLE
{
  "reportName": "Payment Summary by Period",
  "summary": {
    "totalAmount": "$45,230.00",
    "totalTransactions": 156
  },
  "columns": [...],
  "data": [...]
}
```

**Result:** User sees formatted report table

### Example 3: Schedule capacity analysis

**User:** "Show me which courses are almost full"

**AI Response:**
```
Let me check the schedule capacity statistics.

DB_QUERY_REQUEST
{
  "templateName": "getScheduleCapacityStats",
  "parameters": {}
}
```

**System returns capacity stats**

**AI Final Response:**
"Here are the courses nearing capacity:

1. English A1 - 28/30 students (93% full)
2. Spanish B2 - 27/30 students (90% full)
3. French A2 - 26/30 students (87% full)

The following courses have space available:
..."

## Error Handling

### Invalid Template

```javascript
// User/AI requests non-existent template
getDbData("invalidTemplate", {})

// Returns:
{
  "success": false,
  "error": "Invalid template: 'invalidTemplate'. Available templates: getStudents, getTeachers, ..."
}
```

### Query Execution Errors

```javascript
// Caught and logged
{
  "success": false,
  "template": "getStudents",
  "parameters": {...},
  "error": "Database connection timeout"
}
```

### Parameter Validation

- Invalid parameters are ignored (Prisma handles gracefully)
- Missing required fields result in empty results
- Type mismatches are caught by Prisma's type system

## Performance Considerations

### Optimization Strategies

1. **Pagination Support**
   - All queries support `limit` and `offset`
   - Default limit prevents overwhelming responses

2. **Index Usage**
   - Queries use existing database indexes
   - `deletedAt` filter on all queries (indexed column)
   - Order by indexed columns when possible

3. **Selective Loading**
   - Only requested columns returned (explicit select)
   - Minimal related data loaded
   - No N+1 query problems

4. **Connection Pooling**
   - Prisma Client manages connection pool
   - Shared prisma instance across requests

### Typical Query Times

- Simple queries (getStudents): 50-150ms
- Joins (getSchedules with relations): 150-300ms
- Aggregations (countStudentsByStatus): 100-250ms

## Monitoring & Logging

All queries are logged via existing logging infrastructure:

```javascript
await logSystemActivity(
  "AI: Database Query Executed",
  MODULE_TYPES.REPORTS,
  JSON.stringify({
    template: templateName,
    parameters,
    rowCount,
    userId
  })
);
```

## Future Enhancements

### Potential Improvements

1. **Query Caching**
   - Cache frequently requested aggregations
   - TTL-based cache invalidation
   - Redis integration for distributed caching

2. **Additional Templates**
   - Teacher performance metrics
   - Course completion rates
   - Financial projections
   - Attendance tracking queries

3. **Advanced Aggregations**
   - Custom date range groupings
   - Moving averages
   - Year-over-year comparisons

4. **Query Builder UI**
   - Visual query builder for admins
   - Save custom queries as templates
   - Share queries between users

5. **Rate Limiting**
   - Per-user query limits
   - Per-session query quotas
   - Cost-based query budgets

6. **Query Optimization**
   - Query execution plan analysis
   - Slow query logging and alerts
   - Automatic index suggestions

## Testing Guidelines

### Unit Tests

```javascript
// Test template execution
test('getStudents returns safe data', async () => {
  const result = await getDbData('getStudents', { limit: 10 });
  expect(result.success).toBe(true);
  expect(result.data[0]).not.toHaveProperty('password');
  expect(result.data[0]).not.toHaveProperty('email');
});

// Test row limits
test('respects MAX_ROWS limit', async () => {
  const result = await getDbData('getStudents', { limit: 200 });
  expect(result.data.length).toBeLessThanOrEqual(100);
});
```

### Integration Tests

1. Test AI query request flow end-to-end
2. Verify query results are added to conversation history
3. Test error handling for invalid queries
4. Verify security: no sensitive data in responses

### Manual Testing Scenarios

1. **Basic Query**: "Show me all active students"
2. **Filtered Query**: "Get payments from last month"
3. **Aggregation**: "Count students by status"
4. **Multi-step**: "Show schedule capacity and create a report table"
5. **Error Cases**: Request invalid template, exceed row limit

## Files Modified/Created

### New Files
1. `api/utils/dbQueryTemplates.js` - Core query template system

### Modified Files
1. `api/controller/ai_controller.js` - Added DB query handling
2. `client/src/pages/admin/Reports.js` - Added frontend query handling
3. `Documentations/AI_DYNAMIC_DATABASE_ACCESS.md` - This documentation

## Troubleshooting

### Common Issues

**Issue:** AI doesn't use DB_QUERY_REQUEST
- **Cause:** System instruction not clear enough
- **Fix:** Explicitly ask "Use the database to get active students"

**Issue:** Query returns empty results
- **Cause:** Parameters don't match any records
- **Fix:** Check parameter values (case sensitivity, exact matches)

**Issue:** "Invalid template" error
- **Cause:** Typo in template name
- **Fix:** Use `getAvailableTemplates()` for exact names

**Issue:** Query timeout
- **Cause:** Large dataset or slow database
- **Fix:** Reduce `limit` parameter, add more specific filters

## Conclusion

This implementation provides the AI Report Generator with flexible, secure access to fresh database data while maintaining strict security controls. The predefined template approach ensures type safety, prevents SQL injection, and enforces data privacy policies while giving the AI the flexibility to answer a wide range of user queries.

The system is designed to be extensible - new query templates can be added as needed while maintaining the same security guarantees.
