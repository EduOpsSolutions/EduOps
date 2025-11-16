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
    const academicPeriod = await prisma.academic_period.update({
      where: { id: req.params.id },
      data: req.body,
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
    const academicPeriod = await prisma.academic_period.update({
      where: { id: req.params.id },
      data: { isEnrollmentClosed: true },
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
