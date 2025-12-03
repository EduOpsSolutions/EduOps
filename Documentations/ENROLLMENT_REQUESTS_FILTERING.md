# Enrollment Requests Filtering Feature - Implementation Summary

## Overview

Enhanced the Enrollment Requests admin page with comprehensive filtering capabilities. Admins can now filter enrollment requests by search query (names/emails), date ranges, academic periods, and courses. All filters are optional and work together to provide flexible data filtering.

**Date**: 2025-11-21

## Changes Made

### 1. New Filter State Variables

**File**: `/client/src/pages/admin/EnrollmentRequests.js` (Lines 22-28)

Added new state variables to manage filter values:

```javascript
// Filter state
const [dateFrom, setDateFrom] = useState('');
const [dateTo, setDateTo] = useState('');
const [selectedAcademicPeriod, setSelectedAcademicPeriod] = useState('');
const [selectedCourse, setSelectedCourse] = useState('');
const [allAcademicPeriods, setAllAcademicPeriods] = useState([]);
const [availableCourses, setAvailableCourses] = useState([]);
```

**State Variables**:
- `dateFrom` - Start date for date range filter
- `dateTo` - End date for date range filter
- `selectedAcademicPeriod` - Selected academic period ID
- `selectedCourse` - Selected course name
- `allAcademicPeriods` - Array of all academic periods for dropdown
- `availableCourses` - Array of all courses for dropdown

### 2. Enhanced Data Fetching

**File**: `/client/src/pages/admin/EnrollmentRequests.js`

#### Updated useEffect Hooks (Lines 48-55)

Separated data fetching into two phases:

```javascript
// Initial fetch: Load periods and courses once on mount
useEffect(() => {
  fetchActivePeriods();
  fetchCourses();
}, []);

// Filter-triggered fetch: Reload enrollment requests when filters change
useEffect(() => {
  fetchEnrollmentRequests();
}, [currentPage, itemsPerPage, selectedAcademicPeriod, selectedCourse, dateFrom, dateTo]);
```

**Benefits**:
- Courses and periods load once at initialization
- Enrollment requests automatically refetch when any filter changes
- Improved performance by avoiding redundant data fetches

#### New fetchCourses Function (Lines 160-173)

```javascript
const fetchCourses = async () => {
  try {
    const response = await axiosInstance.get('/courses', {
      headers: {
        Authorization: `Bearer ${getCookieItem('token')}`,
      },
    });
    if (response.data && Array.isArray(response.data)) {
      setAvailableCourses(response.data);
    }
  } catch (error) {
    console.error('Error fetching courses:', error);
  }
};
```

**Purpose**: Fetches all available courses for the course filter dropdown.

#### Updated fetchActivePeriods Function (Lines 110-158)

Added `setAllAcademicPeriods(allPeriods)` to store all periods for the filter dropdown (Line 144).

### 3. Enhanced API Call with Filter Parameters

**File**: `/client/src/pages/admin/EnrollmentRequests.js` (Lines 57-79)

Modified `fetchEnrollmentRequests()` to conditionally include filter parameters:

```javascript
const fetchEnrollmentRequests = async () => {
  try {
    setLoading(true);
    setError('');

    const params = {
      search: searchTerm,
      page: currentPage,
      limit: itemsPerPage,
    };

    // Add filters only if they have values
    if (selectedAcademicPeriod) params.academicPeriodId = selectedAcademicPeriod;
    if (selectedCourse) params.course = selectedCourse;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;

    const response = await axiosInstance.get('/enrollment/requests', {
      params,
      headers: {
        Authorization: `Bearer ${getCookieItem('token')}`,
      },
    });
    // ... response handling
  }
};
```

**API Parameters**:
- `search` - Search term for names/emails (always sent)
- `page` - Current page number (always sent)
- `limit` - Items per page (always sent)
- `academicPeriodId` - Filter by academic period ID (optional)
- `course` - Filter by course name (optional)
- `dateFrom` - Filter by start date in ISO format (optional)
- `dateTo` - Filter by end date in ISO format (optional)

### 4. Always-Visible Filter UI

**File**: `/client/src/pages/admin/EnrollmentRequests.js` (Lines 387-504)

Created a comprehensive filter panel that's always visible above the enrollment requests table.

#### Filter Panel Structure

```jsx
<div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 mb-4">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">Filters</h3>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* 5 filter inputs here */}
  </div>

  <div className="flex gap-2 mt-4">
    {/* Action buttons here */}
  </div>
</div>
```

#### Filter Inputs

**1. Search Name/Email** (Lines 393-410)
```jsx
<input
  type="text"
  placeholder="Enter name or email"
  value={searchTerm}
  onChange={handleSearchChange}
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-md..."
/>
```
- Single field searches both names and emails
- Supports Enter key to trigger search
- Real-time value updates

**2. Academic Period Dropdown** (Lines 412-432)
```jsx
<select
  value={selectedAcademicPeriod}
  onChange={(e) => {
    setSelectedAcademicPeriod(e.target.value);
    setCurrentPage(1);
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-md..."
>
  <option value="">Any Academic Period</option>
  {allAcademicPeriods.map((period) => (
    <option key={period.id} value={period.id}>
      {period.batchName} ({period.calculatedStatus})
    </option>
  ))}
</select>
```
- Default: "Any Academic Period" (shows all)
- Displays batch name with status (Ongoing, Ended, etc.)
- Auto-resets to page 1 when changed

**3. Course Dropdown** (Lines 434-454)
```jsx
<select
  value={selectedCourse}
  onChange={(e) => {
    setSelectedCourse(e.target.value);
    setCurrentPage(1);
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-md..."
>
  <option value="">Any Course</option>
  {availableCourses.map((course) => (
    <option key={course.id} value={course.courseName}>
      {course.courseName}
    </option>
  ))}
</select>
```
- Default: "Any Course" (shows all)
- Displays all available courses
- Auto-resets to page 1 when changed

**4. Date From** (Lines 456-470)
```jsx
<input
  type="date"
  value={dateFrom}
  onChange={(e) => {
    setDateFrom(e.target.value);
    setCurrentPage(1);
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-md..."
/>
```
- Date picker for start of date range
- Auto-resets to page 1 when changed

**5. Date To** (Lines 472-486)
```jsx
<input
  type="date"
  value={dateTo}
  onChange={(e) => {
    setDateTo(e.target.value);
    setCurrentPage(1);
  }}
  className="w-full px-3 py-2 border border-gray-300 rounded-md..."
/>
```
- Date picker for end of date range
- Auto-resets to page 1 when changed

#### Action Buttons (Lines 489-503)

**Apply Filters Button**:
```jsx
<button
  onClick={handleSearch}
  className="px-4 py-2 bg-dark-red text-white rounded-md hover:bg-red-800..."
>
  Apply Filters
</button>
```
- Triggers `handleSearch()` to fetch filtered data
- Red button (primary action)

**Clear Filters Button**:
```jsx
<button
  onClick={handleClearFilters}
  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300..."
>
  Clear Filters
</button>
```
- Resets all filters to default values
- Gray button (secondary action)

### 5. Clear Filters Function

**File**: `/client/src/pages/admin/EnrollmentRequests.js` (Lines 110-117)

```javascript
const handleClearFilters = () => {
  setSearchTerm('');
  setDateFrom('');
  setDateTo('');
  setSelectedAcademicPeriod('');
  setSelectedCourse('');
  setCurrentPage(1);
};
```

**Purpose**: Resets all filter values to their defaults and returns to page 1.

## UI/UX Features

### Responsive Grid Layout

```css
grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
```

**Breakpoints**:
- Mobile: 1 column (stacked filters)
- Tablet (640px+): 2 columns
- Desktop (1024px+): 4 columns

### Visual Design

- **Background**: Light gray (`bg-gray-50`)
- **Border**: 2px solid gray (`border-2 border-gray-200`)
- **Spacing**: Consistent padding and gaps
- **Focus States**: Red ring on focus (`focus:ring-2 focus:ring-dark-red`)
- **Hover States**: Darker backgrounds on button hover

### Accessibility

- Labels for all inputs (`text-sm font-medium text-gray-700`)
- Placeholders for text inputs
- Clear default options ("Any Academic Period", "Any Course")
- Keyboard support (Enter key triggers search)

## Data Flow

### 1. Component Initialization

```
Component mounts
  → useEffect (empty deps) runs
  → fetchActivePeriods() → setAllAcademicPeriods()
  → fetchCourses() → setAvailableCourses()
  → useEffect (filter deps) runs
  → fetchEnrollmentRequests() with initial empty filters
```

### 2. User Applies Filters

```
User changes filter value
  → State updates (e.g., setSelectedAcademicPeriod('xyz'))
  → setCurrentPage(1)
  → useEffect (filter deps) detects change
  → fetchEnrollmentRequests() with new filter values
  → API call: GET /enrollment/requests?academicPeriodId=xyz&page=1&limit=10
  → Response updates table data
```

### 3. User Clears Filters

```
User clicks "Clear Filters"
  → handleClearFilters()
  → All filter states reset to ''
  → setCurrentPage(1)
  → useEffect (filter deps) detects changes
  → fetchEnrollmentRequests() with empty filters (shows all)
  → Table reloads with unfiltered data
```

## Backend API Requirements

The backend endpoint `/enrollment/requests` must support these query parameters:

### Required Parameters
- `page` - Page number (integer)
- `limit` - Items per page (integer)

### Optional Filter Parameters
- `search` - Search term for names and emails (string)
  - Should search: `firstName`, `lastName`, `preferredEmail`, `altEmail`
- `academicPeriodId` - Filter by academic period (string/UUID)
  - Should match: `periodId` field in enrollment_request table
- `course` - Filter by course name (string)
  - Should match: `coursesToEnroll` field in enrollment_request table
- `dateFrom` - Start date for date range (ISO date string: YYYY-MM-DD)
  - Should filter: `createdAt >= dateFrom`
- `dateTo` - End date for date range (ISO date string: YYYY-MM-DD)
  - Should filter: `createdAt <= dateTo`

### Example API Call

```http
GET /enrollment/requests?
  search=john
  &academicPeriodId=abc123
  &course=Computer Science
  &dateFrom=2025-01-01
  &dateTo=2025-12-31
  &page=1
  &limit=10
```

### Expected Response Format

```json
{
  "error": false,
  "data": [
    {
      "id": "...",
      "enrollmentId": "...",
      "firstName": "...",
      "lastName": "...",
      "preferredEmail": "...",
      "contactNumber": "...",
      "coursesToEnroll": "...",
      "enrollmentStatus": "...",
      "createdAt": "...",
      // ... other fields
    }
  ],
  "total": 50,
  "totalPages": 5
}
```

## Testing Recommendations

### Functional Testing

1. **Individual Filters**:
   - Test each filter independently
   - Verify correct data is returned
   - Check that pagination resets to page 1

2. **Combined Filters**:
   - Test multiple filters together
   - Verify filters work in combination (AND logic)
   - Check edge cases (no results found)

3. **Clear Filters**:
   - Apply filters, then click "Clear Filters"
   - Verify all filter values reset
   - Confirm table shows unfiltered data

4. **Search Functionality**:
   - Test search with Enter key
   - Test search with "Apply Filters" button
   - Verify partial name/email matching works

5. **Date Range**:
   - Test with only dateFrom
   - Test with only dateTo
   - Test with both dateFrom and dateTo
   - Test invalid date ranges (from > to)

### UI/UX Testing

1. **Responsive Design**:
   - Test on mobile (320px width)
   - Test on tablet (768px width)
   - Test on desktop (1440px width)
   - Verify grid layout adapts properly

2. **Loading States**:
   - Verify spinner shows while fetching data
   - Ensure filters remain accessible during loading

3. **Error Handling**:
   - Test with network errors
   - Verify error messages display correctly
   - Check that filters remain functional after errors

### Performance Testing

1. **Large Datasets**:
   - Test with 100+ enrollment requests
   - Verify filtering remains responsive
   - Check pagination works correctly

2. **Multiple Rapid Changes**:
   - Quickly change multiple filters
   - Verify only final state triggers API call (debouncing not implemented)

## Known Limitations

1. **No Debouncing**: Filter changes immediately trigger API calls. For high-frequency changes, consider implementing debouncing.

2. **Backend Dependency**: Filters will only work if the backend API supports the new query parameters. Frontend implementation is complete, but backend updates are required.

3. **Date Range Validation**: No client-side validation ensures `dateFrom` ≤ `dateTo`. Invalid ranges will be sent to backend as-is.

4. **Course Name Matching**: Course filter uses course name (string) instead of course ID, which may cause issues if course names aren't unique or contain special characters.

## Future Enhancements

### Potential Improvements

1. **Filter Presets**: Save and load common filter combinations
2. **URL Query Parameters**: Persist filters in URL for bookmarking and sharing
3. **Advanced Search**: Add enrollment status filter, course level filter
4. **Export Filtered Data**: Download CSV/Excel of filtered results
5. **Filter Indicator Badges**: Show active filter count in UI
6. **Date Range Shortcuts**: "Last 7 days", "Last 30 days", "This month" buttons
7. **Auto-Search**: Automatically apply filters on change (remove "Apply Filters" button)
8. **Filter History**: Remember last used filters in localStorage

## Migration Notes

### For Developers

- The search field was moved from a standalone component (`SearchField`) to a native HTML input within the filter panel
- The old search field location has been replaced with the new filter panel
- No database schema changes required
- No existing API endpoints are broken (only new optional parameters added)

### For Backend Developers

Implement these API parameter handlers in `/api/controller/enrollment_controller.js`:

```javascript
// Example Prisma query with filters
const getEnrollmentRequests = async (req, res) => {
  const {
    search,
    academicPeriodId,
    course,
    dateFrom,
    dateTo,
    page = 1,
    limit = 10
  } = req.query;

  const where = {};

  // Search filter
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { preferredEmail: { contains: search, mode: 'insensitive' } },
      { altEmail: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Academic period filter
  if (academicPeriodId) {
    where.periodId = academicPeriodId;
  }

  // Course filter
  if (course) {
    where.coursesToEnroll = { contains: course, mode: 'insensitive' };
  }

  // Date range filter
  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) where.createdAt.gte = new Date(dateFrom);
    if (dateTo) where.createdAt.lte = new Date(dateTo);
  }

  const [data, total] = await Promise.all([
    prisma.enrollment_request.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.enrollment_request.count({ where }),
  ]);

  res.json({
    error: false,
    data,
    total,
    totalPages: Math.ceil(total / limit),
  });
};
```

## Summary

This implementation provides a comprehensive filtering system for enrollment requests with:

✅ **5 Filter Options**: Search, academic period, course, date from, date to
✅ **Always Visible UI**: No need to expand/collapse filters
✅ **Responsive Design**: Works on mobile, tablet, and desktop
✅ **Default Behavior**: Shows all enrollment requests (no filters applied)
✅ **Auto-Pagination Reset**: Returns to page 1 when filters change
✅ **Clear Functionality**: One-click reset of all filters
✅ **Flexible Filtering**: All filters are optional and work together

**Next Steps**: Backend API must be updated to support the new query parameters for full functionality.
