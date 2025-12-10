import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// Get all academic periods
export const getAcademicPeriods = async (req, res) => {
  try {
    const academicPeriods = await prisma.academic_period.findMany({
      where: { deletedAt: null },
    });
    const now = new Date();
    const withStatus = academicPeriods.map((period) => ({
      ...period,
      batchStatus:
        now < period.startAt
          ? "upcoming"
          : now > period.endAt
          ? "ended"
          : "ongoing",
      enrollmentStatus: period.isEnrollmentClosed
        ? "closed"
        : now < period.enrollmentOpenAt
        ? "upcoming"
        : now > period.enrollmentCloseAt
        ? "ended"
        : "open",
    }));
    res.json(withStatus);
  } catch (err) {
    console.error("Error fetching academic periods:", err);
    res.status(500).json({ error: "Failed to fetch academic periods" });
  }
};

// Get a single academic period by ID
export const getAcademicPeriod = async (req, res) => {
  try {
    const period = await prisma.academic_period.findUnique({
      where: { id: req.params.id },
    });
    if (!period)
      return res.status(404).json({ error: "Academic Period Not found" });
    const now = new Date();
    res.json({
      ...period,
      batchStatus:
        now < period.startAt
          ? "upcoming"
          : now > period.endAt
          ? "ended"
          : "ongoing",
      enrollmentStatus: period.isEnrollmentClosed
        ? "closed"
        : now < period.enrollmentOpenAt
        ? "upcoming"
        : now > period.enrollmentCloseAt
        ? "ended"
        : "open",
    });
  } catch (err) {
    console.error("Error fetching academic period:", err);
    res.status(500).json({ error: "Failed to fetch academic period" });
  }
};

export const createAcademicPeriod = async (req, res) => {
  try {
    const data = { ...req.body };
    // Check for overlapping open enrollment window (not closed)
    const overlapping = await prisma.academic_period.findFirst({
      where: {
        deletedAt: null,
        isEnrollmentClosed: false,
        // Overlapping logic: new.open <= existing.close && new.close >= existing.open
        enrollmentOpenAt: { lte: new Date(data.enrollmentCloseAt) },
        enrollmentCloseAt: { gte: new Date(data.enrollmentOpenAt) },
      },
    });
    if (overlapping) {
      return res.status(400).json({
        error:
          "There is already an ongoing or overlapping enrollment window. Only one open enrollment period is allowed at a time.",
      });
    }
    const academicPeriod = await prisma.academic_period.create({ data });
    res.status(201).json(academicPeriod);
  } catch (err) {
    console.error("Error creating academic period:", err);
    res.status(500).json({ error: "Failed to create academic period" });
  }
};

export const updateAcademicPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // 1. Fetch current period to compare with requested changes
    const currentPeriod = await prisma.academic_period.findUnique({
      where: { id },
    });

    if (!currentPeriod) {
      return res.status(404).json({ error: "Academic period not found" });
    }

    // 2. Check for locked field violations when enrollment is closed
    if (currentPeriod.isEnrollmentClosed) {
      // Check if enrollmentOpenAt is being changed
      if (updateData.enrollmentOpenAt &&
          new Date(updateData.enrollmentOpenAt).getTime() !== new Date(currentPeriod.enrollmentOpenAt).getTime()) {
        return res.status(403).json({
          error: "Enrollment open date cannot be modified after enrollment has been closed",
          field: "enrollmentOpenAt",
          reason: "enrollment_closed"
        });
      }

      // Check if enrollmentCloseAt is being changed
      if (updateData.enrollmentCloseAt &&
          new Date(updateData.enrollmentCloseAt).getTime() !== new Date(currentPeriod.enrollmentCloseAt).getTime()) {
        return res.status(403).json({
          error: "Enrollment close date cannot be modified after enrollment has been closed",
          field: "enrollmentCloseAt",
          reason: "enrollment_closed"
        });
      }

      // Check if startAt is being changed
      if (updateData.startAt &&
          new Date(updateData.startAt).getTime() !== new Date(currentPeriod.startAt).getTime()) {
        return res.status(403).json({
          error: "Academic period start date cannot be modified after enrollment has been closed",
          field: "startAt",
          reason: "enrollment_closed"
        });
      }
    }

    // 3. Validate date constraints
    const now = new Date();
    const enrollmentCloseAt = updateData.enrollmentCloseAt ? new Date(updateData.enrollmentCloseAt) : new Date(currentPeriod.enrollmentCloseAt);
    const enrollmentOpenAt = updateData.enrollmentOpenAt ? new Date(updateData.enrollmentOpenAt) : new Date(currentPeriod.enrollmentOpenAt);
    const startAt = updateData.startAt ? new Date(updateData.startAt) : new Date(currentPeriod.startAt);
    const endAt = updateData.endAt ? new Date(updateData.endAt) : new Date(currentPeriod.endAt);

    // Check enrollmentCloseAt is not in the past
    if (updateData.enrollmentCloseAt && enrollmentCloseAt < now) {
      return res.status(400).json({
        error: "Enrollment close date cannot be in the past",
        field: "enrollmentCloseAt",
        reason: "past_date"
      });
    }

    // Check enrollmentOpenAt <= startAt
    if (enrollmentOpenAt > startAt) {
      return res.status(400).json({
        error: "Enrollment open date must be on or before the academic period start date",
        field: "enrollmentOpenAt",
        reason: "invalid_date_order"
      });
    }

    // Check endAt > startAt
    if (endAt <= startAt) {
      return res.status(400).json({
        error: "Academic period end date must be after start date",
        field: "endAt",
        reason: "invalid_date_order"
      });
    }

    // Check enrollmentCloseAt > enrollmentOpenAt
    if (enrollmentCloseAt <= enrollmentOpenAt) {
      return res.status(400).json({
        error: "Enrollment close date must be after enrollment open date",
        field: "enrollmentCloseAt",
        reason: "invalid_date_order"
      });
    }

    // 4. Check for overlapping enrollment windows (only if enrollment dates are being changed)
    if (updateData.enrollmentOpenAt || updateData.enrollmentCloseAt) {
      const overlapping = await prisma.academic_period.findFirst({
        where: {
          id: { not: id }, // Exclude current period
          deletedAt: null,
          isEnrollmentClosed: false,
          // Overlapping logic: new.open <= existing.close && new.close >= existing.open
          enrollmentOpenAt: { lte: enrollmentCloseAt },
          enrollmentCloseAt: { gte: enrollmentOpenAt },
        },
      });

      if (overlapping) {
        return res.status(400).json({
          error: "This enrollment window overlaps with another open enrollment period. Only one open enrollment period is allowed at a time.",
          field: "enrollmentDates",
          reason: "overlapping_enrollment"
        });
      }
    }

    // 5. Perform the update
    const academicPeriod = await prisma.academic_period.update({
      where: { id },
      data: updateData,
    });

    res.json(academicPeriod);
  } catch (err) {
    console.error("Error updating academic period:", err);
    res.status(500).json({ error: "Failed to update academic period" });
  }
};

export const deleteAcademicPeriod = async (req, res) => {
  try {
    const academicPeriod = await prisma.academic_period.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ message: "Academic Period deleted", academicPeriod });
  } catch (err) {
    console.error("Error deleting academic period:", err);
    res.status(500).json({ error: "Failed to delete academic period" });
  }
};

// Get active academic period
export const getActiveAcademicPeriod = async (req, res) => {
  try {
    const now = new Date();
    const period = await prisma.academic_period.findFirst({
      where: {
        deletedAt: null,
        startAt: { lte: now },
        endAt: { gte: now },
      },
      orderBy: { startAt: "asc" },
    });
    if (!period)
      return res.status(404).json({ error: "No active academic period found" });
    res.json({
      ...period,
      batchStatus:
        now < period.startAt
          ? "upcoming"
          : now > period.endAt
          ? "ended"
          : "ongoing",
      enrollmentStatus: period.isEnrollmentClosed
        ? "closed"
        : now < period.enrollmentOpenAt
        ? "upcoming"
        : now > period.enrollmentCloseAt
        ? "ended"
        : "open",
    });
  } catch (err) {
    console.error("Error fetching active academic period:", err);
    res.status(500).json({ error: "Failed to fetch active academic period" });
  }
};

export const endEnrollment = async (req, res) => {
  try {
    const now = new Date();
    const academicPeriod = await prisma.academic_period.update({
      where: { id: req.params.id },
      data: {
        isEnrollmentClosed: true,
        enrollmentCloseAt: now
      },
    });
    res.json({
      message: "Enrollment ended successfully",
      academicPeriod,
    });
  } catch (err) {
    console.error("Error ending enrollment:", err);
    res.status(500).json({ error: "Failed to end enrollment" });
  }
};
