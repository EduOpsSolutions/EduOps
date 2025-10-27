import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

class DocumentModel {
  // Helper method to get user by ID
  static async getUserById(userId) {
    return await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
        email: true,
      }
    });
  }

  // Document Templates CRUD
  
  static async createDocumentTemplate(data) {
    return await prisma.document_template.create({
      data: {
        documentName: data.documentName,
        description: data.description,
        privacy: data.privacy || 'public',
        requestBasis: data.requestBasis || true,
        downloadable: data.downloadable || false,
        price: data.price || 'free',
        amount: data.price === 'paid' ? parseFloat(data.amount) : null,
        uploadFile: data.uploadFile || null
      }
    });
  }

  static async getAllDocumentTemplates(includeHidden = false) {
    const where = includeHidden ? {} : { isActive: true, deletedAt: null };
    return await prisma.document_template.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getDocumentTemplateById(id) {
    return await prisma.document_template.findUnique({
      where: { id }
    });
  }

  static async updateDocumentTemplate(id, data) {
    return await prisma.document_template.update({
      where: { id },
      data: {
        ...data,
        amount: data.price === 'paid' ? parseFloat(data.amount) : null,
        updatedAt: new Date()
      }
    });
  }

  static async deleteDocumentTemplate(id) {
    return await prisma.document_template.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  static async hideDocumentTemplate(id, isActive) {
    return await prisma.document_template.update({
      where: { id },
      data: { isActive }
    });
  }

  // Document Requests CRUD

  static async createDocumentRequest(data) {
    try {
      console.log('DocumentModel: Creating request with data:', data);
      
      // Validate that the document template exists
      const documentExists = await prisma.document_template.findUnique({
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

      const result = await prisma.document_request.create({
        data: {
          userId: data.studentId,
          documentId: data.documentId,
          status: data.status || 'in_process',
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          mode: data.mode || 'pickup',
          address: data.address,
          city: data.city,
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
    return await prisma.document_request.findMany({
      include: {
        document: true,
        user: {
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
    return await prisma.document_request.findUnique({
      where: { id },
      include: {
        document: true,
        user: {
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
    return await prisma.document_request.findMany({
      where: { userId: studentId },
      include: {
        document: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async updateDocumentRequestStatus(id, status, remarks) {
    return await prisma.document_request.update({
      where: { id },
      data: { 
        status,
        remarks,
        updatedAt: new Date() 
      }
    });
  }

  static async deleteDocumentRequest(id) {
    return await prisma.document_request.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }

  // Document Validations CRUD

  static async createDocumentValidation(data) {
    return await prisma.document_validation.create({
      data: {
        fileSignature: data.fileSignature,
        documentName: data.documentName,
        userId: data.userId,
      }
    });
  }

  static async getAllDocumentValidations() {
    return await prisma.document_validation.findMany({
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
    return await prisma.document_validation.findUnique({
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
    return await prisma.document_validation.delete({
      where: { id }
    });
  }

  // Helper methods for filtering and searching

  static async searchDocumentTemplates(filters = {}) {
    const where = {
      deletedAt: null,
      ...(filters.includeHidden ? {} : { isActive: true }),
      ...(filters.documentName && {
        OR: [
          { documentName: { contains: filters.documentName } },
          { description: { contains: filters.documentName } }
        ]
      }),
      ...(filters.privacy && { privacy: filters.privacy }),
      ...(filters.price && { price: filters.price })
    };

    return await prisma.document_template.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  static async searchDocumentRequests(filters = {}) {
    const where = {
      ...(filters.studentName && {
        user: {
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
      ...(filters.status && { status: filters.status }),
      ...(filters.userId && { userId: filters.userId })
    };

    return await prisma.document_request.findMany({
      where,
      include: {
        document: true,
        user: {
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

    return await prisma.document_validation.findMany({
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

  // Role-based document access
  static async getDocumentsByRole(userRole, includeHidden = false) {
    const privacyFilter = {
      admin: {}, // Admins can see all
      teacher: {
        privacy: {
          in: ['public', 'teacher']
        }
      },
      student: {
        privacy: {
          in: ['public', 'student']
        }
      }
    };

    const baseWhere = {
      deletedAt: null,
      ...privacyFilter[userRole] || privacyFilter.student
    };

    if (!includeHidden) {
      baseWhere.isActive = true;
    }

    return await prisma.document_template.findMany({
      where: baseWhere,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Enhanced search with role-based filtering
  static async searchDocumentTemplatesWithRole(filters = {}, userRole) {
    const privacyFilter = {
      admin: {}, // Admins can see all
      teacher: {
        privacy: {
          in: ['public', 'teacher']
        }
      },
      student: {
        privacy: {
          in: ['public', 'student']
        }
      }
    };

    const where = {
      deletedAt: null,
      ...privacyFilter[userRole] || privacyFilter.student,
      ...(filters.includeHidden && userRole === 'admin' ? {} : { isActive: true }),
      ...(filters.documentName && {
        OR: [
          { documentName: { contains: filters.documentName, mode: 'insensitive' } },
          { description: { contains: filters.documentName, mode: 'insensitive' } }
        ]
      }),
      ...(filters.privacy && { privacy: filters.privacy }),
      ...(filters.price && { price: filters.price })
    };

    return await prisma.document_template.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });
  }

  // Audit logging
  static async logDocumentOperation(operation, documentId, userId, details = {}) {
    try {
      // You can implement this with a separate audit_logs table
      console.log(`Document Operation Log:`, {
        operation,
        documentId,
        userId,
        timestamp: new Date(),
        details
      });
      
      // Optional: Save to database audit table
      // await prisma.audit_logs.create({
      //   data: {
      //     operation,
      //     entityType: 'document',
      //     entityId: documentId,
      //     userId,
      //     details: JSON.stringify(details),
      //   }
      // });
    } catch (error) {
      console.error('Failed to log document operation:', error);
    }
  }
}

export default DocumentModel;