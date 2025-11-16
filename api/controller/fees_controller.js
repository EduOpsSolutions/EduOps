import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

export const listCourseBatchPairs = async (req, res) => {
  try {
    // Fetch all course-batch pairs
    const pairs = await prisma.academic_period_courses.findMany({
      include: {
        course: true,
        academicPeriods: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const result = pairs.map((pair) => ({
      id: pair.id,
      courseId: pair.courseId,
      batchId: pair.academicperiodId,
      courseName: pair.course?.name,
      batchName: pair.academicPeriods?.batchName,
      year: pair.academicPeriods?.startAt
        ? new Date(pair.academicPeriods.startAt).getFullYear()
        : null,
    }));

    res.json(result);
  } catch (error) {
    console.error("Error fetching course-batch pairs:", error);
    res
      .status(500)
      .json({ error: "An error occurred while fetching course-batch pairs." });
  }
};

// List Fees
export const listFees = async (req, res) => {
  const { courseId, batchId } = req.query;
  try {
    const fees = await prisma.fees.findMany({
      where: {
        courseId: courseId,
        batchId: batchId,
      },
    });
    res.json(fees);
  } catch (error) {
    console.error("Error fetching fees:", error);
    res.status(500).json({ error: "An error occurred while fetching fees." });
  }
};

// Add Fees
export const addFee = async (req, res) => {
  try {
    const fee = await prisma.fees.create({ data: req.body });
    res.json(fee);
  } catch (error) {
    console.error("Error adding fee:", error);
    res.status(500).json({ error: "An error occurred while adding the fee." });
  }
};

// Edit
export const updateFee = async (req, res) => {
  const { id } = req.params;
  const { name, price, dueDate } = req.body;
  try {
    const fee = await prisma.fees.update({
      where: { id },
      data: {
        name,
        price,
        dueDate,
      },
    });
    res.json(fee);
  } catch (error) {
    console.error("Error updating fee:", error);
    res
      .status(500)
      .json({ error: "An error occurred while updating the fee." });
  }
};

// Delete Fee
export const deleteFee = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.fees.delete({
      where: { id },
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting fee:", error);
    res
      .status(500)
      .json({ error: "An error occurred while deleting the fee." });
  }
};

export default {
  listCourseBatchPairs,
  listFees,
  addFee,
  updateFee,
  deleteFee,
};
