import { Router } from "express";
import * as unitsService from "../services/units.service.js";

const router = Router();

// GET /api/units — List all active videotron units (public)
router.get("/", async (req, res) => {
    try {
        const { search, city, type } = req.query as Record<string, string>;
        const units = await unitsService.getActiveUnits({ search, city, type });
        res.json({ data: units });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch units" });
    }
});

// GET /api/units/:id — Get unit detail (public)
router.get("/:id", async (req, res) => {
    try {
        const unit = await unitsService.getUnitById(req.params.id);
        if (!unit) {
            res.status(404).json({ error: "Unit not found" });
            return;
        }
        res.json({ data: unit });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch unit" });
    }
});

// GET /api/units/:id/availability — Get date availability for a unit (public)
router.get("/:id/availability", async (req, res) => {
    try {
        const { month, year } = req.query as Record<string, string>;
        if (!month || !year) {
            res.status(400).json({ error: "month and year query params required" });
            return;
        }
        const bookedDates = await unitsService.getUnitAvailability(
            req.params.id,
            parseInt(month),
            parseInt(year)
        );
        res.json({ data: { bookedDates } });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch availability" });
    }
});

export default router;
