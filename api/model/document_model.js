import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class DocumentModel {
  // Document Templates CRUD
  
  static async createDocumentTemplate(data) {
    return await prisma.document_templates.create({
      data: {
        documentName: data.documentName,
        description: data.description,
        privacy: data.privacy || 'public',
        requestBasis: data.requestBasis || true,
        downloadable: data.downloadable || false,
        price: data.price || 'free',
        amount: data.price === 'paid' ? parseFloat(data.amount) : null,
        uploadFile: data.uploadFile,
        isHidden: data.isHidden || false,
      }
    });
  }

  static async getAllDocumentTemplates(includeHidden = false) {
    const where = includeHidden ? {} : { isHidden: false, deletedAt: null };
    return await prisma.document_templates.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getDocumentTemplateById(id) {
    return await prisma.document_templates.findUnique({
      where: { id }
    });
  }

  static async updateDocumentTemplate(id, data) {
    return await prisma.document_templates.update({
      where: { id },
      data: {
        ...data,
        amount: data.price === 'paid' ? parseFloat(data.amount) : null,
        updatedAt: new Date()
      }
    });
  }

  static async deleteDocumentTemplate(id) {
    return await prisma.document_templates.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  static async hideDocumentTemplate(id, isHidden) {
    return await prisma.document_templates.update({
      where: { id },
      data: { isHidden }
    });
  }

  // Document Requests CRUD

  static async createDocumentRequest(data) {
    try {
      console.log('DocumentModel: Creating request with data:', data);
      
      // Validate that the document template exists
      const documentExists = await prisma.document_templates.findUnique({
        where: { id: data.documentId }
      });
      
      if (!documentExists) {
        throw new Error(`Document template with ID ${data.documentId} not found`);
      }

      // Validate that the student exists
      const studentExists = await prisma.users.findUnique({
        where: { id: data.studentId }
      });
      
      if (!studentExists) {
        throw new Error(`Student with ID ${data.studentId} not found`);
      }

      const result = await prisma.document_requests.create({
        data: {
          studentId: data.studentId,
          documentId: data.documentId,
          status: data.status || 'in_process',
          remarks: data.remarks,
          email: data.email,
          phone: data.phone,
          mode: data.mode || 'pickup',
          paymentMethod: data.paymentMethod,
          address: data.address,
          city: data.city,
          state: data.state,
          zipCode: data.zipCode,
          country: data.country,
          purpose: data.purpose,
          additionalNotes: data.additionalNotes,
        }
      });
      
      console.log('DocumentModel: Created request successfully:', result.id);
      return result;
    } catch (error) {
      console.error('DocumentModel: Error creating document request:', error);
      throw error;
    }
  }

  static async getAllDocumentRequests() {
    return await prisma.document_requests.findMany({
      include: {
        document: true,
        student: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getDocumentRequestById(id) {
    return await prisma.document_requests.findUnique({
      where: { id },
      include: {
        document: true,
        student: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
          }
        }
      }
    });
  }

  static async getDocumentRequestsByStudent(studentId) {
    return await prisma.document_requests.findMany({
      where: { studentId },
      include: {
        document: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateDocumentRequestStatus(id, status, remarks) {
    return await prisma.document_requests.update({
      where: { id },
      data: { 
        status, 
        remarks, 
        updatedAt: new Date() 
      }
    });
  }

  static async deleteDocumentRequest(id) {
    return await prisma.document_requests.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  // Document Validations CRUD

  static async createDocumentValidation(data) {
    return await prisma.document_validations.create({
      data: {
        fileSignature: data.fileSignature,
        documentName: data.documentName,
        filePath: data.filePath,
        userId: data.userId,
      }
    });
  }

  static async getAllDocumentValidations() {
    return await prisma.document_validations.findMany({
      include: {
        user: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getDocumentValidationBySignature(fileSignature) {
    return await prisma.document_validations.findUnique({
      where: { fileSignature },
      include: {
        user: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          }
        }
      }
    });
  }

  static async deleteDocumentValidation(id) {
    return await prisma.document_validations.delete({
      where: { id }
    });
  }

  // Helper methods for filtering and searching

  static async searchDocumentTemplates(filters = {}) {
    const where = {
      deletedAt: null,
      ...(filters.includeHidden ? {} : { isHidden: false }),
      ...(filters.documentName && {
        OR: [
          { documentName: { contains: filters.documentName } },
          { description: { contains: filters.documentName } }
        ]
      }),
      ...(filters.privacy && { privacy: filters.privacy }),
      ...(filters.price && { price: filters.price })
    };

    return await prisma.document_templates.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  static async searchDocumentRequests(filters = {}) {
    const where = {
      deletedAt: null,
      ...(filters.studentName && {
        student: {
          OR: [
            { firstName: { contains: filters.studentName } },
            { lastName: { contains: filters.studentName } },
            { middleName: { contains: filters.studentName } }
          ]
        }
      }),
      ...(filters.documentName && {
        document: {
          documentName: { contains: filters.documentName }
        }
      }),
      ...(filters.status && { status: filters.status })
    };

    return await prisma.document_requests.findMany({
      where,
      include: {
        document: true,
        student: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: filters.sortBy === 'ascending' ? 'asc' : 'desc' }
    });
  }

  static async searchDocumentValidations(filters = {}) {
    const where = {
      ...(filters.fileSignature && {
        fileSignature: { contains: filters.fileSignature }
      }),
      ...(filters.documentName && {
        documentName: { contains: filters.documentName }
      })
    };

    return await prisma.document_validations.findMany({
      where,
      include: {
        user: {
          select: {
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default DocumentModel;