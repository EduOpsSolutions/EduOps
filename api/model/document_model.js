import pkg from "@prisma/client";
const { PrismaClient } = pkg;
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
      },
    });
  }

  // Document Templates CRUD

  static async createDocumentTemplate(data) {
    return await prisma.document_template.create({
      data: {
        documentName: data.documentName,
        description: data.description,
        privacy: data.privacy || "public",
        requestBasis:
          data.requestBasis !== undefined ? Boolean(data.requestBasis) : true,
        downloadable:
          data.downloadable !== undefined ? Boolean(data.downloadable) : false,
        price: data.price || "free",
        amount: data.price === "paid" ? parseFloat(data.amount) : 0,
        uploadFile: data.uploadFile || null,
      },
    });
  }

  static async getAllDocumentTemplates(includeHidden = false) {
    const where = includeHidden ? {} : { isActive: true, deletedAt: null };
    return await prisma.document_template.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  static async getDocumentTemplateById(id) {
    return await prisma.document_template.findUnique({
      where: { id },
    });
  }

  static async updateDocumentTemplate(id, data) {
    const updateData = { ...data };

    // Ensure boolean fields are properly converted
    if (updateData.requestBasis !== undefined) {
      updateData.requestBasis = Boolean(updateData.requestBasis);
    }
    if (updateData.downloadable !== undefined) {
      updateData.downloadable = Boolean(updateData.downloadable);
    }

    // Handle amount properly
    if (updateData.price === "paid" && updateData.amount) {
      updateData.amount = parseFloat(updateData.amount);
    } else if (updateData.price === "free") {
      updateData.amount = 0;
    }

    updateData.updatedAt = new Date();

    return await prisma.document_template.update({
      where: { id },
      data: updateData,
    });
  }

  static async deleteDocumentTemplate(id) {
    return await prisma.document_template.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  static async hideDocumentTemplate(id, isActive) {
    return await prisma.document_template.update({
      where: { id },
      data: { isActive },
    });
  }

  // Document Requests CRUD

  static async createDocumentRequest(data) {
    try {
      const documentExists = await prisma.document_template.findUnique({
        where: { id: data.documentId },
      });

      if (!documentExists) {
        throw new Error(
          `Document template with ID ${data.documentId} not found`
        );
      }

      const studentExists = await prisma.users.findUnique({
        where: { id: data.studentId },
      });

      if (!studentExists) {
        throw new Error(`Student with ID ${data.studentId} not found`);
      }

      // Auto-verify cash payments
      const paymentStatus =
        data.paymentMethod === "cash" ? "verified" : "pending";

      const result = await prisma.document_request.create({
        data: {
          userId: data.studentId,
          documentId: data.documentId,
          status: data.status || "in_process",
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          mode: data.mode || "pickup",
          paymentMethod: data.paymentMethod,
          address: data.address,
          city: data.city,
          purpose: data.purpose,
          additionalNotes: data.additionalNotes,
          paymentStatus: paymentStatus,
          paymentAmount:
            documentExists.price === "paid" ? documentExists.amount : 0,
        },
      });

      return result;
    } catch (error) {
      console.error("DocumentModel: Error creating document request:", error);
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
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
          },
        },
      },
    });
  }

  static async getDocumentRequestsByStudent(studentId) {
    return await prisma.document_request.findMany({
      where: { userId: studentId },
      include: {
        document: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async updateDocumentRequestStatus(
    id,
    status,
    remarks,
    paymentId = null
  ) {
    const updateData = {
      status,
      remarks,
      updatedAt: new Date(),
    };

    // Only update paymentId if it's provided (not null or undefined)
    if (paymentId !== null && paymentId !== undefined) {
      updateData.paymentId = paymentId;
    }

    return await prisma.document_request.update({
      where: { id },
      data: updateData,
    });
  }

  static async updateDocumentRequestProofOfPayment(id, proofOfPayment) {
    return await prisma.document_request.update({
      where: { id },
      data: {
        proofOfPayment,
        updatedAt: new Date(),
      },
    });
  }

  static async updateDocumentRequestPayment(id, paymentData) {
    return await prisma.document_request.update({
      where: { id },
      data: {
        ...paymentData,
        updatedAt: new Date(),
      },
      include: {
        document: true,
        user: true,
      },
    });
  }

  static async updateDocumentRequestCompletedDocument(id, completedDocument) {
    return await prisma.document_request.update({
      where: { id },
      data: {
        fulfilledDocumentUrl: completedDocument,
        updatedAt: new Date(),
      },
      include: {
        document: true,
        user: true,
      },
    });
  }

  static async deleteDocumentRequest(id) {
    return await prisma.document_request.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Document Validations CRUD

  static async createDocumentValidation(data) {
    return await prisma.document_validation.create({
      data: {
        fileSignature: data.fileSignature,
        documentName: data.documentName,
        documentId: data.documentId || null,
        filePath: data.filePath || null,
        userId: data.userId,
      },
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
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
          },
        },
      },
    });
  }

  static async deleteDocumentValidation(id) {
    return await prisma.document_validation.delete({
      where: { id },
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
          { description: { contains: filters.documentName } },
        ],
      }),
      ...(filters.privacy && { privacy: filters.privacy }),
      ...(filters.price && { price: filters.price }),
    };

    return await prisma.document_template.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  static async searchDocumentRequests(filters = {}) {
    const where = {
      ...(filters.studentName && {
        user: {
          OR: [
            { firstName: { contains: filters.studentName } },
            { lastName: { contains: filters.studentName } },
            { middleName: { contains: filters.studentName } },
          ],
        },
      }),
      ...(filters.documentName && {
        document: {
          documentName: { contains: filters.documentName },
        },
      }),
      ...(filters.status && { status: filters.status }),
      ...(filters.userId && { userId: filters.userId }),
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
          },
        },
      },
      orderBy: { createdAt: filters.sortBy === "ascending" ? "asc" : "desc" },
    });
  }

  static async searchDocumentValidations(filters = {}) {
    const where = {
      ...(filters.fileSignature && {
        fileSignature: { contains: filters.fileSignature },
      }),
      ...(filters.documentName && {
        documentName: { contains: filters.documentName },
      }),
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
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // Role-based document access
  static async getDocumentsByRole(userRole, includeHidden = false) {
    const privacyFilter = {
      admin: {}, // Admins can see all
      teacher: {
        privacy: {
          in: ["public", "teacher"],
        },
      },
      student: {
        privacy: {
          in: ["public", "student"],
        },
      },
    };

    const baseWhere = {
      deletedAt: null,
      ...(privacyFilter[userRole] || privacyFilter.student),
    };

    if (!includeHidden) {
      baseWhere.isActive = true;
    }

    return await prisma.document_template.findMany({
      where: baseWhere,
      orderBy: { createdAt: "desc" },
    });
  }

  // Enhanced search with role-based filtering
  static async searchDocumentTemplatesWithRole(filters = {}, userRole) {
    const privacyFilter = {
      admin: {}, // Admins can see all
      teacher: {
        privacy: {
          in: ["public", "teacher"],
        },
      },
      student: {
        privacy: {
          in: ["public", "student"],
        },
      },
    };

    const where = {
      deletedAt: null,
      ...(privacyFilter[userRole] || privacyFilter.student),
      ...(filters.includeHidden && userRole === "admin"
        ? {}
        : { isActive: true }),
      ...(filters.documentName && {
        OR: [
          {
            documentName: {
              contains: filters.documentName,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: filters.documentName,
              mode: "insensitive",
            },
          },
        ],
      }),
      ...(filters.privacy && { privacy: filters.privacy }),
      ...(filters.price && { price: filters.price }),
    };

    return await prisma.document_template.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
  }

  static async logDocumentOperation(
    operation,
    documentId,
    userId,
    details = {}
  ) {
    try {
      // Optional: Implement with a separate audit_logs table
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
      console.error("Failed to log document operation:", error);
    }
  }

  // Get transaction by ID
  static async getTransactionById(transactionId) {
    return await prisma.payments.findUnique({
      where: { transactionId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  // Attach transaction to document request
  static async attachTransactionToRequest(requestId, transactionId) {
    // Verify transaction belongs to the same user as the request
    const request = await prisma.document_request.findUnique({
      where: { id: requestId },
      include: { document: true },
    });

    const transaction = await prisma.payments.findUnique({
      where: { transactionId },
    });

    if (!request || !transaction) {
      throw new Error("Request or transaction not found");
    }

    if (request.userId !== transaction.userId) {
      throw new Error("Transaction does not belong to the request user");
    }

    // Check if transaction is for document fee and paid
    if (transaction.feeType !== "document_fee") {
      throw new Error("Transaction is not for document fee");
    }

    if (transaction.status !== "paid") {
      throw new Error("Transaction is not paid yet");
    }

    // Update request with transaction and set payment status to verified
    return await prisma.document_request.update({
      where: { id: requestId },
      data: {
        paymentId: transactionId,
        paymentStatus: "verified",
        paymentAmount: transaction.amount,
        updatedAt: new Date(),
      },
      include: {
        document: true,
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  // Auto-verify cash payment
  static async autoVerifyCashPayment(requestId) {
    return await prisma.document_request.update({
      where: { id: requestId },
      data: {
        paymentStatus: "verified",
        updatedAt: new Date(),
      },
      include: {
        document: true,
        user: {
          select: {
            id: true,
            firstName: true,
            middleName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }
}

export default DocumentModel;
