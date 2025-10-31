# Document Management Module - Implementation Documentation

## Table of Contents
1. [Overview](#overview)
2. [Features](#features)
3. [User Roles & Access Control](#user-roles--access-control)
4. [Document Configuration Options](#document-configuration-options)
5. [User Workflows](#user-workflows)
6. [Testing Guide](#testing-guide)
7. [Technical Implementation](#technical-implementation)
8. [API Endpoints](#api-endpoints)
9. [Database Schema](#database-schema)

---

## Overview

The Document Management Module is a comprehensive system that allows administrators to manage official documents, students and teachers to access and request documents based on their roles, and track document requests through their lifecycle.

### Key Capabilities
- **Role-based document access** (Admin, Teacher, Student)
- **Flexible document availability** (Downloadable, Request-based, or Both)
- **Document privacy controls** (Public, Teacher-only, Student-only)
- **Request tracking system** with status updates
- **File upload and storage** via Firebase Storage
- **Payment integration** for paid documents

---

## Features

### Admin Features
1. **Create Document Templates**
   - Upload document files (PDF, DOC, DOCX, JPG, JPEG, PNG)
   - Set document properties (name, description, privacy, pricing)
   - Configure availability options (downloadable, request-based)
   
2. **Manage Documents**
   - View all documents
   - Edit document details
   - Delete documents (soft delete)
   - Hide/show documents

3. **Process Document Requests**
   - View all document requests
   - Update request status (In Process, In Transit, Delivered, Failed, Fulfilled)
   - Add remarks to requests
   - Search and filter requests

### Student Features
1. **Browse Documents**
   - View public and student-only documents
   - Search documents by name
   - See document pricing and availability

2. **Access Documents**
   - Download available documents directly
   - Submit requests for request-based documents
   - Track submitted requests

3. **Request Management**
   - Fill out request form with contact details
   - Specify delivery mode (Pickup/Delivery)
   - Add purpose and additional notes
   - View request history and status

### Teacher Features
1. **Browse Documents**
   - View public and teacher-only documents
   - Search documents by name

2. **Access Documents**
   - Download available documents
   - Submit document requests
   - Track request status

---

## User Roles & Access Control

### Privacy Levels

| Privacy Setting | Admin | Teacher | Student |
|----------------|-------|---------|---------|
| **Public** | ✅ View | ✅ View | ✅ View |
| **Teacher Only** | ✅ View | ✅ View | ❌ Hidden |
| **Student Only** | ✅ View | ❌ Hidden | ✅ View |

### Access Permissions

**Admin:**
- Full CRUD operations on all documents
- View and manage all requests
- Access to all privacy levels

**Teacher:**
- Read-only access to Public and Teacher-only documents
- Can download and request documents
- Cannot create or modify document templates

**Student:**
- Read-only access to Public and Student-only documents
- Can download and request documents
- Cannot create or modify document templates

---

## Document Configuration Options

When creating or editing a document, administrators can configure the following:

### 1. Basic Information
- **Document Name** (Required): Display name of the document
- **Description** (Optional): Additional information about the document

### 2. Privacy Setting (Required)
Choose who can see this document:
- **Public**: Visible to everyone (admin, teacher, student)
- **Teacher's Only**: Visible only to admins and teachers
- **Student's Only**: Visible only to admins and students

### 3. Availability Options (Checkboxes)

#### Request Basis
- **Checked**: Document requires a formal request to obtain
- **Unchecked**: No request needed
- When enabled, shows a "Request" button for users

#### Downloadable
- **Checked**: Document can be downloaded directly
- **Unchecked**: Cannot be downloaded directly
- Requires an uploaded file to work
- When enabled, shows a "Download" button for users

**Important Combinations:**

| Request Basis | Downloadable | Result |
|--------------|--------------|---------|
| ✅ Checked | ✅ Checked | Both "Download" and "Request" buttons appear |
| ✅ Checked | ❌ Unchecked | Only "Request" button appears |
| ❌ Unchecked | ✅ Checked | Only "Download" button appears |
| ❌ Unchecked | ❌ Unchecked | "Not Available" message appears |

### 4. Pricing

#### Free Documents
- Select "Free" radio button
- No payment required
- Amount field is hidden

#### Paid Documents
- Select "Paid" radio button
- Enter amount in Philippine Peso (₱)
- Amount must be greater than 0
- Students must pay before document is released

### 5. File Upload (Optional)
- Upload a file for the document
- Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG
- Maximum size: 100MB
- Stored in Firebase Storage
- Required if "Downloadable" is enabled

---

## User Workflows

### Admin Workflow: Creating a Document

1. **Navigate to Documents Page**
   - Go to Admin Dashboard → Documents

2. **Click "Add Document" Button**
   - Modal opens with document form

3. **Fill in Document Details**
   ```
   Document Name: Certificate of Enrollment
   Description: Official certificate showing student enrollment status
   Privacy: Student's Only
   Request Basis: ✅ Checked
   Downloadable: ❌ Unchecked
   Price: Free
   Upload file: [Select file]
   ```

4. **Submit**
   - Click "Submit" button
   - Success notification appears
   - Document appears in the list

### Student Workflow: Requesting a Document

1. **Navigate to Documents Page**
   - Go to Student Dashboard → Documents

2. **Browse Available Documents**
   - See list of public and student-only documents
   - Use search to find specific documents

3. **Request a Document**
   - Click "Request" button on desired document
   - Fill out request form:
     ```
     Email: student@example.com
     Phone: 09123456789
     Delivery Mode: Pickup / Delivery
     Address: (if Delivery selected)
     City: (if Delivery selected)
     Purpose: For job application
     Additional Notes: Urgent - needed by next week
     ```

4. **Submit Request**
   - Click "Submit" button
   - Confirmation modal appears
   - Request is recorded

5. **Track Request**
   - Click "See Requests" button
   - View all submitted requests
   - Check status: In Process → In Transit → Delivered → Fulfilled

### Admin Workflow: Processing Requests

1. **Navigate to Document Requests Page**
   - Go to Admin Dashboard → Document Requests

2. **View All Requests**
   - See table with: Date, Name, Document, Status, Remarks
   - Use search filters:
     - Filter by student name
     - Filter by document name
     - Filter by status
     - Sort by date

3. **Update Request Status**
   - Click "Update" button on a request
   - Change status dropdown:
     - **In Process**: Admin is preparing the document
     - **In Transit**: Document is being delivered
     - **Delivered**: Document has been delivered
     - **Failed**: Request could not be completed
     - **Fulfilled**: Request completed successfully
   - Add remarks (optional)
   - Click "Submit"

4. **View Request Details**
   - Click on any row to view full details
   - See student information, delivery details, purpose

---

## Testing Guide

### Test Case 1: Create a Free Downloadable Document

**Setup:**
1. Login as Admin
2. Navigate to Documents page
3. Click "Add Document"

**Test Data:**
```
Document Name: Student Handbook 2025
Description: Official student handbook for academic year 2025
Privacy: Public
Request Basis: ❌ Unchecked
Downloadable: ✅ Checked
Price: Free
File: student_handbook.pdf (upload a PDF file)
```

**Expected Result:**
- Document is created successfully
- Document appears in the documents list
- Students and teachers can see and download it
- No "Request" button appears (only "Download")

### Test Case 2: Create a Paid Request-Only Document

**Setup:**
1. Login as Admin
2. Navigate to Documents page
3. Click "Add Document"

**Test Data:**
```
Document Name: Transcript of Records
Description: Official transcript of all courses completed
Privacy: Student's Only
Request Basis: ✅ Checked
Downloadable: ❌ Unchecked
Price: Paid
Amount: 150.00
File: (no file needed)
```

**Expected Result:**
- Document is created successfully
- Only students can see this document (not teachers)
- Amount shows as ₱150.00
- Only "Request" button appears (no "Download")

### Test Case 3: Submit a Document Request (Student)

**Setup:**
1. Login as Student
2. Navigate to Documents page
3. Find a request-basis document

**Test Data:**
```
Email: juan.delacruz@student.edu
Phone: 09171234567
Delivery Mode: Delivery
Address: 123 Main Street, Barangay San Jose
City: Manila
Purpose: Required for scholarship application
Additional Notes: Please include English translation
```

**Expected Result:**
- Request is submitted successfully
- Request appears in "See Requests" list
- Status shows "In Process"
- Admin can see the request in Document Requests page

### Test Case 4: Process a Request (Admin)

**Setup:**
1. Login as Admin
2. Navigate to Document Requests page
3. Find a pending request

**Test Actions:**
1. Click "Update" on the request
2. Change status to "In Transit"
3. Add remark: "Document sent via LBC on [date]"
4. Click Submit

**Expected Result:**
- Status updates successfully
- Student can see updated status in their "See Requests" view
- Remark is visible in request details

### Test Case 5: Privacy Controls

**Test 5a: Teacher-Only Document**
```
Create document with:
Privacy: Teacher's Only
```
**Expected:**
- ✅ Visible to Admin
- ✅ Visible to Teacher
- ❌ NOT visible to Student

**Test 5b: Student-Only Document**
```
Create document with:
Privacy: Student's Only
```
**Expected:**
- ✅ Visible to Admin
- ❌ NOT visible to Teacher
- ✅ Visible to Student

**Test 5c: Public Document**
```
Create document with:
Privacy: Public
```
**Expected:**
- ✅ Visible to Admin
- ✅ Visible to Teacher
- ✅ Visible to Student

### Test Case 6: Edit Document

**Setup:**
1. Login as Admin
2. Click "Edit" on an existing document

**Test Actions:**
1. Change Request Basis from ✅ to ❌
2. Change Downloadable from ❌ to ✅
3. Upload a new file
4. Click Submit

**Expected Result:**
- Changes save successfully
- "Download" button now appears (was request-only before)
- New file is accessible
- Previous file is replaced

### Test Case 7: Search and Filter

**Test 7a: Search Documents (Student)**
1. Navigate to student Documents page
2. Type "Certificate" in search box
3. Click search icon

**Expected:** Only documents with "Certificate" in the name appear

**Test 7b: Filter Requests (Admin)**
1. Navigate to Document Requests page
2. Use filters:
   - Name: "Juan"
   - Document: "Transcript"
   - Status: "In Process"
   - Sort: "Newest First"

**Expected:** Only matching requests appear in the table

### Test Case 8: Download Functionality

**Setup:**
1. Create a downloadable document with uploaded file
2. Login as Student/Teacher

**Test Actions:**
1. Navigate to Documents page
2. Find the downloadable document
3. Click "Download" button

**Expected Result:**
- File downloads or opens in new tab
- Original filename is preserved
- File content is correct

### Test Case 9: Request Status Lifecycle

**Follow a complete request from creation to fulfillment:**

1. **Student**: Submit request → Status: "In Process"
2. **Admin**: Update to "In Transit" → Add remark: "Processing"
3. **Student**: View request → See "In Transit" status
4. **Admin**: Update to "Delivered" → Add remark: "Ready for pickup"
5. **Student**: View request → See "Delivered" status
6. **Admin**: Update to "Fulfilled" → Add remark: "Picked up on [date]"
7. **Student**: View request → See "Fulfilled" status

**Expected:** All status changes are reflected immediately for all users

---

## Technical Implementation

### Technology Stack

**Backend:**
- Node.js with Express.js
- Prisma ORM with MySQL database
- Firebase Storage for file uploads
- JWT authentication
- Multer for file handling

**Frontend:**
- React 19.1.0
- Zustand for state management
- TailwindCSS for styling
- SweetAlert2 for notifications
- Flowbite React components

### File Structure

```
api/
├── controller/
│   └── document_controller.js       # Request handlers
├── model/
│   └── document_model.js            # Database operations
├── middleware/
│   ├── authValidator.js             # Authentication
│   ├── documentValidator.js         # Request validation
│   └── multerMiddleware.js          # File upload
├── routes/
│   └── v1/
│       └── documents.js             # API routes
└── utils/
    └── fileStorage.js               # Firebase storage helper

client/
├── src/
│   ├── pages/
│   │   ├── admin/
│   │   │   ├── Documents.js         # Admin documents page
│   │   │   └── DocumentRequests.js  # Admin requests page
│   │   ├── student/
│   │   │   └── Documents.js         # Student documents page
│   │   └── teacher/
│   │       └── Documents.js         # Teacher documents page
│   ├── components/
│   │   ├── modals/documents/
│   │   │   ├── AddNewDocumentModal.js
│   │   │   ├── EditDocumentModal.js
│   │   │   ├── RequestDocumentModal.js
│   │   │   ├── UpdateRequestModal.js
│   │   │   ├── ViewRequestDetailsModal.js
│   │   │   └── DocumentRequestsModal.js
│   │   ├── form/
│   │   │   └── DocumentForm.js      # Reusable form component
│   │   └── buttons/
│   │       ├── DownloadButton.js
│   │       └── RequestButton.js
│   ├── stores/
│   │   ├── manageDocumentsStore.js  # Document management state
│   │   └── documentRequestStore.js  # Request management state
│   └── utils/
│       └── documentApi.js           # API client
```

### Data Flow

#### Creating a Document (Admin)
```
1. User fills form → AddNewDocumentModal
2. Form submission → manageDocumentsStore.handleAddDocumentSubmit()
3. Create FormData → documentApi.helpers.createFormData()
4. API call → documentApi.templates.create()
5. Backend → POST /api/v1/documents/templates
6. Controller → createDocumentTemplate()
7. Upload file → Firebase Storage
8. Save to DB → DocumentModel.createDocumentTemplate()
9. Response → Frontend
10. Update UI → Fetch updated documents list
```

#### Submitting a Request (Student)
```
1. User clicks "Request" → RequestDocumentModal opens
2. Fill form with contact details
3. Form submission → documentRequestStore.createDocumentRequest()
4. API call → documentApi.requests.create()
5. Backend → POST /api/v1/documents/requests
6. Controller → createDocumentRequest()
7. Save to DB → DocumentModel.createDocumentRequest()
8. Response → Frontend
9. Show confirmation → RequestSentModal
10. Update requests list
```

### State Management

**manageDocumentsStore (Zustand):**
```javascript
{
  documents: [],              // All document templates
  loading: false,
  error: null,
  showAddDocumentModal: false,
  showEditDocumentModal: false,
  selectedDocument: null,
  
  // Actions
  fetchDocuments(),
  handleAddDocumentSubmit(),
  handleEditDocumentSubmit(),
  handleDeleteDocument(),
  handleToggleVisibility()
}
```

**documentRequestStore (Zustand):**
```javascript
{
  requests: [],               // All document requests
  selectedRequest: null,
  updateModal: false,
  viewDetailsModal: false,
  loading: false,
  error: null,
  
  // Actions
  fetchDocumentRequests(),
  createDocumentRequest(),
  handleSubmitStatusUpdate(),
  viewRequestDetails()
}
```

---

## API Endpoints

### Document Templates

#### Create Document Template
```http
POST /api/v1/documents/templates
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body (FormData):
- documentName: string (required)
- description: string
- privacy: "public" | "teacher_only" | "student_only" (required)
- requestBasis: boolean
- downloadable: boolean
- price: "free" | "paid"
- amount: number (required if price="paid")
- file: File (optional)

Response:
{
  "error": false,
  "data": { /* document object */ },
  "message": "Document template created successfully"
}
```

#### Get All Document Templates
```http
GET /api/v1/documents/templates?includeHidden=false
Authorization: Bearer <token>

Response:
{
  "error": false,
  "data": [ /* array of documents */ ],
  "message": "Documents retrieved successfully"
}
```

#### Get Document by ID
```http
GET /api/v1/documents/templates/:id
Authorization: Bearer <token>

Response:
{
  "error": false,
  "data": { /* document object */ },
  "message": "Document retrieved successfully"
}
```

#### Update Document Template
```http
PUT /api/v1/documents/templates/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: Same as Create

Response:
{
  "error": false,
  "data": { /* updated document */ },
  "message": "Document updated successfully"
}
```

#### Delete Document Template
```http
DELETE /api/v1/documents/templates/:id
Authorization: Bearer <token>

Response:
{
  "error": false,
  "message": "Document deleted successfully"
}
```

#### Toggle Document Visibility
```http
PATCH /api/v1/documents/templates/:id/visibility
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "isActive": boolean
}

Response:
{
  "error": false,
  "data": { /* updated document */ },
  "message": "Document visibility updated"
}
```

### Document Requests

#### Create Document Request
```http
POST /api/v1/documents/requests
Authorization: Bearer <token> (optional for non-logged-in users)
Content-Type: application/json

Body:
{
  "documentId": "string (required)",
  "email": "string (required)",
  "firstName": "string",
  "lastName": "string",
  "phone": "string",
  "mode": "pickup" | "delivery",
  "address": "string (required if mode=delivery)",
  "city": "string (required if mode=delivery)",
  "purpose": "string",
  "additionalNotes": "string"
}

Response:
{
  "error": false,
  "data": { /* request object */ },
  "message": "Document request created successfully"
}
```

#### Get All Document Requests
```http
GET /api/v1/documents/requests
Authorization: Bearer <token>

Response:
{
  "error": false,
  "data": [ /* array of requests with user and document details */ ],
  "message": "Document requests retrieved successfully"
}
```

#### Get Requests by Student
```http
GET /api/v1/documents/requests/student/:studentId
Authorization: Bearer <token>

Response:
{
  "error": false,
  "data": [ /* array of student's requests */ ],
  "message": "Student requests retrieved successfully"
}
```

#### Update Request Status
```http
PATCH /api/v1/documents/requests/:id/status
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "status": "in_process" | "in_transit" | "delivered" | "failed" | "fulfilled",
  "remarks": "string (optional)"
}

Response:
{
  "error": false,
  "data": { /* updated request */ },
  "message": "Request status updated successfully"
}
```

---

## Database Schema

### document_template
```prisma
model document_template {
  id           String            @id @default(cuid())
  documentName String
  description  String?           @db.Text
  privacy      DocumentPrivacy   @default(public)
  requestBasis Boolean           @default(false)
  downloadable Boolean           @default(true)
  price        DocumentPriceType @default(free)
  amount       Decimal           @default(0) @db.Decimal(10, 2)
  uploadFile   String?           @db.LongText
  isActive     Boolean           @default(true)
  createdAt    DateTime          @default(now())
  updatedAt    DateTime          @updatedAt
  deletedAt    DateTime?

  requests    document_request[]
  validations document_validation[]
}
```

### document_request
```prisma
model document_request {
  id              String                @id @default(cuid())
  documentId      String
  userId          String?
  email           String
  firstName       String?
  lastName        String?
  phone           String?
  mode            DeliveryMode?         @default(pickup)
  address         String?
  city            String?
  purpose         String?               @db.Text
  additionalNotes String?               @db.Text
  status          DocumentRequestStatus @default(in_process)
  remarks         String?               @db.Text
  createdAt       DateTime              @default(now())
  updatedAt       DateTime              @updatedAt

  document document_template @relation(fields: [documentId], references: [id], onDelete: Cascade)
  user     users?            @relation(fields: [userId], references: [id], onDelete: SetNull)
}
```

### Enums
```prisma
enum DocumentPrivacy {
  public
  student_only
  teacher_only
}

enum DocumentPriceType {
  free
  paid
}

enum DocumentRequestStatus {
  in_process
  in_transit
  delivered
  failed
  fulfilled
}

enum DeliveryMode {
  pickup
  delivery
}
```

---

## Troubleshooting

### Issue: Documents not appearing for students/teachers

**Check:**
1. Privacy setting is correct
2. Document `isActive` is true
3. Document `deletedAt` is null
4. User is logged in with correct role

### Issue: Download button not working

**Check:**
1. `downloadable` checkbox is checked
2. File has been uploaded
3. `uploadFile` field is not null
4. Firebase Storage is configured correctly

### Issue: Request button not showing

**Check:**
1. `requestBasis` checkbox is checked
2. Privacy allows the user role to access

### Issue: Checkbox values not saving

**Cause:** This was a bug where the `||` operator treated `false` as falsy

**Fixed:** Changed to use `!== undefined` check instead

### Issue: Object rendering error in React

**Cause:** Trying to render `request.document` (object) instead of `request.documentName` (string)

**Fixed:** Updated all modals to use `request.documentName || request.document?.documentName`

---

## Best Practices

### For Administrators

1. **Document Naming**: Use clear, descriptive names
2. **Privacy Settings**: Carefully choose who should see each document
3. **File Uploads**: Always upload files for downloadable documents
4. **Pricing**: Set realistic amounts for paid documents
5. **Request Processing**: Update status regularly and add informative remarks

### For Development

1. **Error Handling**: Always check for file upload errors
2. **Validation**: Validate all user inputs on both frontend and backend
3. **State Management**: Keep document and request states separate
4. **API Calls**: Handle loading and error states properly
5. **File Size**: Monitor Firebase Storage usage

---

## Future Enhancements

Potential features for future development:

1. **Email Notifications**
   - Notify students when request status changes
   - Send reminders for pending requests

2. **Payment Integration**
   - Online payment for paid documents
   - Payment tracking and receipts

3. **Document Versioning**
   - Keep history of document changes
   - Allow multiple versions of the same document

4. **Bulk Operations**
   - Upload multiple documents at once
   - Bulk status updates for requests

5. **Analytics Dashboard**
   - Most requested documents
   - Request completion rates
   - Revenue tracking for paid documents

6. **Document Templates**
   - Pre-filled request forms
   - Custom fields per document type

7. **Advanced Search**
   - Filter by date range
   - Filter by price range
   - Full-text search in descriptions

---

## Support & Maintenance

### Regular Maintenance Tasks

1. **Weekly:**
   - Review pending requests
   - Check Firebase Storage usage
   - Monitor for errors in logs

2. **Monthly:**
   - Archive fulfilled requests
   - Review inactive documents
   - Update pricing if needed

3. **Quarterly:**
   - Review user access patterns
   - Optimize database queries
   - Update documentation

### Contact

For technical issues or questions about the document management module:
- Check this documentation first
- Review error logs in the browser console
- Contact the development team

---

**Document Version:** 1.0  
**Last Updated:** October 28, 2025  
**Author:** EduOps Development Team
