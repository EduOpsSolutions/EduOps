import pkg from "@prisma/client";
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

// Get all logs with filtering and pagination
export const getLogs = async (req, res) => {
  try {
    const {
      type,
      moduleType,
      userId,
      dateStart,
      dateEnd,
      page = 1,
      limit = 50,
    } = req.query;

    let whereClause = {};

    whereClause.deletedAt = null;

    // Apply filters
    // Handle multiple types (comma-separated)
    if (type) {
      if (type.includes(",")) {
        whereClause.type = { in: type.split(",").map((t) => t.trim()) };
      } else {
        whereClause.type = type;
      }
    }
    if (moduleType) whereClause.moduleType = moduleType;
    if (userId) whereClause.userId = userId;

    // Handle date filters
    if (dateStart && dateEnd) {
      whereClause.createdAt = {
        gte: new Date(dateStart),
        lte: new Date(dateEnd),
      };
    } else if (dateStart) {
      whereClause.createdAt = {
        gte: new Date(dateStart),
      };
    } else if (dateEnd) {
      whereClause.createdAt = {
        lte: new Date(dateEnd),
      };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Get total count for pagination
    const totalCount = await prisma.logs.count({
      where: whereClause,
    });

    // Fetch logs with user information
    const logs = await prisma.logs.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        content: true,
        reqBody: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
        userId: true,
        moduleType: true,
        type: true,
        user: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        id: "asc",
      },
      skip,
      take,
    });

    const maxPage = Math.ceil(totalCount / take);

    res.json({
      error: false,
      data: logs,
      count: logs.length || 0,
      total: totalCount,
      page: parseInt(page),
      max_page: maxPage,
      limit: take,
    });
  } catch (err) {
    console.error("Get logs error:", err);
    res.status(500).json({
      error: true,
      message: "Failed to get logs",
    });
  }
};

// Get a single log by ID
export const getLogById = async (req, res) => {
  try {
    const { id } = req.params;

    const log = await prisma.logs.findFirst({
      where: {
        id: parseInt(id),
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!log) {
      return res.status(404).json({
        error: true,
        message: "Log not found",
      });
    }

    res.json({
      error: false,
      data: log,
    });
  } catch (err) {
    console.error("Get log by ID error:", err);
    res.status(500).json({
      error: true,
      message: "Failed to get log",
    });
  }
};

// Update a log (admin only - for corrections or updates)
export const updateLog = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, moduleType } = req.body;

    // Check if log exists
    const existingLog = await prisma.logs.findFirst({
      where: {
        id: parseInt(id),
        deletedAt: null,
      },
    });

    if (!existingLog) {
      return res.status(404).json({
        error: true,
        message: "Log not found",
      });
    }

    // Build update data object (only include provided fields)
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (type !== undefined) updateData.type = type;
    if (moduleType !== undefined) updateData.moduleType = moduleType;

    // Validate that at least one field is being updated
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        error: true,
        message: "No fields to update",
      });
    }

    const updatedLog = await prisma.logs.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
      },
    });

    res.json({
      error: false,
      data: updatedLog,
      message: "Log updated successfully",
    });
  } catch (err) {
    console.error("Update log error:", err);
    res.status(500).json({
      error: true,
      message: "Failed to update log",
    });
  }
};

// Soft delete a log (admin only)
export const deleteLog = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if log exists
    const existingLog = await prisma.logs.findFirst({
      where: {
        id: parseInt(id),
        deletedAt: null,
      },
    });

    if (!existingLog) {
      return res.status(404).json({
        error: true,
        message: "Log not found",
      });
    }

    await prisma.logs.update({
      where: { id: parseInt(id) },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({
      error: false,
      message: "Log deleted successfully",
    });
  } catch (err) {
    console.error("Delete log error:", err);
    res.status(500).json({
      error: true,
      message: "Failed to delete log",
    });
  }
};

// Bulk soft delete logs (admin only)
export const bulkDeleteLogs = async (req, res) => {
  try {
    const { ids } = req.body;

    // Validate input
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        error: true,
        message: "Invalid or empty IDs array",
      });
    }

    // Convert string IDs to integers
    const logIds = ids.map((id) => parseInt(id)).filter((id) => !isNaN(id));

    if (logIds.length === 0) {
      return res.status(400).json({
        error: true,
        message: "No valid IDs provided",
      });
    }

    const result = await prisma.logs.updateMany({
      where: {
        id: { in: logIds },
        deletedAt: null,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    res.json({
      error: false,
      message: `${result.count} log(s) deleted successfully`,
      deletedCount: result.count,
    });
  } catch (err) {
    console.error("Bulk delete logs error:", err);
    res.status(500).json({
      error: true,
      message: "Failed to delete logs",
    });
  }
};

// Utility function to create a log (called internally by the system, not exposed as API endpoint)
export const createLog = async (logData) => {
  try {
    const log = await prisma.logs.create({
      data: {
        title: logData.title || "No title",
        content: logData.content || "No content",
        reqBody: logData.reqBody || "No request body",
        userId: logData.userId || null,
        moduleType: logData.moduleType || "UNCATEGORIZED",
        type: logData.type || "user_activity",
      },
    });
    return { success: true, log };
  } catch (err) {
    console.error("Create log error:", err);
    return { success: false, error: err.message };
  }
};
