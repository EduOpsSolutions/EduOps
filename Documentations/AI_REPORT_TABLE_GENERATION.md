# AI Report Table Generation Integration

## Overview

This document describes the integration of the `GENERATE_REPORT_TABLE` action into the AI Report Generator, allowing the AI to automatically generate structured report tables from JSON summaries similar to the 4th report style (Course Enrollment Statistics).

## Implementation Date

October 16, 2025

## Changes Made

### 1. Backend - AI Controller (`api/controller/ai_controller.js`)

#### System Instruction Enhancement

Updated the `generateAIReport` function's system instruction to include:

- **New Special Action**: `GENERATE_REPORT_TABLE`
- **Response Format**: The AI can now respond with a structured JSON containing:
  - `reportName`: Name of the report
  - `summary`: Key-value pairs for summary metrics
  - `columns`: Array of column definitions with:
    - `field`: Field name in the data
    - `header`: Display name for the column
    - `type`: Data type (`text`, `number`, `date`, `percentage`, `currency`)
  - `data`: Array of data objects

#### Response Parsing Logic

Added detection and parsing for the `GENERATE_REPORT_TABLE` command:

- Extracts the JSON structure from the AI response
- Returns a structured response with:
  - `action: 'generate_report_table'`
  - `reportData`: Formatted report data with columns and summary
  - Clean text response without the JSON command

#### Example AI Response Format

```
"Here is a Course Enrollment Statistics report based on the current data."

GENERATE_REPORT_TABLE
{
  "reportName": "Course Enrollment Statistics",
  "summary": {
    "totalSections": 5,
    "totalEnrolledStudents": 120,
    "averageEnrollmentPerSection": "24.00"
  },
  "columns": [
    {"field": "courseName", "header": "Course Name", "type": "text"},
    {"field": "enrolledStudents", "header": "Enrolled Students", "type": "number"},
    {"field": "capacity", "header": "Capacity", "type": "number"},
    {"field": "occupancyRate", "header": "Occupancy Rate", "type": "percentage"}
  ],
  "data": [
    {"courseName": "English A1", "enrolledStudents": 25, "capacity": 30, "occupancyRate": "83.33%"}
  ]
}
```

### 2. Frontend - Reports Page (`client/src/pages/admin/Reports.js`)

#### AI Report Handler Enhancement

Updated `handleAIReportGenerate` function to:

- Detect when the AI returns `action: 'generate_report_table'`
- Navigate to the report summary page with the structured data
- Pass the report data with custom columns and formatting

#### Updated Example Prompts

Added new example prompts in the AI modal:

- "Generate a course enrollment statistics table"
- "Create a report showing enrollment by period"

#### State Management

- Removed unused `aiResponse` state variable
- Maintained `aiHistory` for chat continuity

### 3. Frontend - Report Summary Page (`client/src/pages/admin/ReportSummary.js`)

#### Custom Column Support

Enhanced `renderTableData` function to:

- Check for AI-generated column definitions in `reportData.columns`
- Use custom column headers when provided
- Apply column-specific formatting based on type

#### Column Type Formatting

Added `renderFormattedCell` function with support for:

- **Currency**: Formats numbers as USD currency
- **Percentage**: Displays percentage values
- **Number**: Formats numbers with thousands separators
- **Date**: Displays dates in localized format
- **Text**: Default rendering with nested object support

## Usage

### User Workflow

1. User opens the AI Report Generator modal
2. User asks a question like "Generate a course enrollment statistics table"
3. AI processes the request and responds with the `GENERATE_REPORT_TABLE` command
4. Frontend automatically navigates to the Report Summary page
5. Report displays with:
   - Custom column headers
   - Proper data formatting based on column types
   - Summary metrics at the top
   - Download options (CSV, JSON)

### Example Prompts

Users can ask for reports like:

- "Create a table showing enrollment statistics by course"
- "Generate a report of student enrollments for this period"
- "Show me course capacity and enrollment numbers"
- "Build a financial summary table"

## Benefits

1. **Dynamic Report Generation**: AI can create custom reports based on natural language requests
2. **Structured Data**: Reports follow a consistent format similar to existing report templates
3. **Flexible Formatting**: Column types ensure proper data display (currency, percentages, dates, etc.)
4. **User-Friendly**: No need to know report IDs or parameters - just ask in natural language
5. **Reusable Components**: Uses existing ReportSummary component with enhanced capabilities

## Security Considerations

- AI only has access to aggregated, non-sensitive data
- Email addresses and passwords are never accessible
- Same security model as the existing AI scheduling assistant

## Future Enhancements

Potential improvements:

- Add chart/graph generation alongside tables
- Support for grouping and aggregation in tables
- Export to additional formats (PDF, Excel)
- Save AI-generated reports as templates
- Real-time data filtering and sorting

## Files Modified

1. `api/controller/ai_controller.js` - Added GENERATE_REPORT_TABLE action
2. `api/routes/v1/ai_routes.js` - No changes (already has route)
3. `client/src/pages/admin/Reports.js` - Updated AI handler
4. `client/src/pages/admin/ReportSummary.js` - Added column formatting support

## Testing Recommendations

1. Test various report generation prompts
2. Verify column type formatting (currency, percentage, date, number)
3. Test CSV and JSON downloads with AI-generated reports
4. Verify summary metrics display correctly
5. Test with different data volumes
6. Ensure error handling for malformed AI responses
