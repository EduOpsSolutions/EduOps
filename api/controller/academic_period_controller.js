import * as AcademicPeriod from "../model/academic_period.js";

export const getAcademicPeriods = async (req, res) => {
    try {
        const academicPeriods = await AcademicPeriod.getAllAcademicPeriods();
        res.json(academicPeriods);
    } catch (err) {
        console.error("Error fetching academic periods:", err);
        res.status(500).json({ error: "Failed to fetch academic periods" });
    }
};

export const getAcademicPeriod = async (req, res) => {
    try {
        const academicPeriod = await AcademicPeriod.getAcademicPeriodById(
            req.params.id
        );
        if (!academicPeriod)
            return res.status(404).json({ error: "Academic Period Not found" });
        res.json(academicPeriod);
    } catch (err) {
        console.error("Error fetching academic period:", err);
        res.status(500).json({ error: "Failed to fetch academic period" });
    }
};

export const createAcademicPeriod = async (req, res) => {
    try {
        const data = { ...req.body };
        const academicPeriod = await AcademicPeriod.createAcademicPeriod(data);
        res.status(201).json(academicPeriod);
    } catch (err) {
        console.error("Error creating academic period:", err);
        res.status(500).json({ error: "Failed to create academic period" });
    }
};

export const updateAcademicPeriod = async (req, res) => {
    try {
        const academicPeriod = await AcademicPeriod.updateAcademicPeriod(
            req.params.id,
            req.body
        );
        res.json(academicPeriod);
    } catch (err) {
        console.error("Error updating academic period:", err);
        res.status(500).json({ error: "Failed to update academic period" });
    }
};

export const deleteAcademicPeriod = async (req, res) => {
    try {
        const academicPeriod = await AcademicPeriod.deleteAcademicPeriod(
            req.params.id
        );
        res.json({ message: "Academic Period deleted", academicPeriod });
    } catch (err) {
        console.error("Error deleting academic period:", err);
        res.status(500).json({ error: "Failed to delete academic period" });
    }
};

export const getActiveAcademicPeriod = async (req, res) => {
    try {
        const academicPeriod = await AcademicPeriod.getActiveAcademicPeriod();
        if (!academicPeriod)
            return res.status(404).json({ error: "No active academic period found" });
        res.json(academicPeriod);
    } catch (err) {
        console.error("Error fetching active academic period:", err);
        res.status(500).json({ error: "Failed to fetch active academic period" });
    }
};

export const endEnrollment = async (req, res) => {
    try {
        const academicPeriod = await AcademicPeriod.endEnrollmentForPeriod(
            req.params.id
        );
        if (!academicPeriod)
            return res.status(404).json({ error: "Academic Period not found" });
        res.json({
            message: "Enrollment ended successfully",
            academicPeriod,
        });
    } catch (err) {
        console.error("Error ending enrollment:", err);
        res.status(500).json({ error: "Failed to end enrollment" });
    }
};
