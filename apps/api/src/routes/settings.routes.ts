import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import * as settingsService from "../services/settings.service.js";

const router = Router();

// ─── Public (for checkout page) ──────────────────────────────────────────────

// GET /api/settings/bank — Get active bank accounts
router.get("/bank", async (req, res) => {
    try {
        const banks = await settingsService.getActiveBankSettings();
        res.json({ data: banks });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bank settings" });
    }
});

// ─── Admin ───────────────────────────────────────────────────────────────────

// GET /api/settings/admin/bank — Get all bank accounts (admin)
router.get("/admin/bank", requireAuth, requireAdmin, async (req, res) => {
    try {
        const banks = await settingsService.getAllBankSettings();
        res.json({ data: banks });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch bank settings" });
    }
});

// POST /api/settings/admin/bank — Create bank setting
router.post("/admin/bank", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { bankName, accountNumber, accountHolder } = req.body;
        if (!bankName || !accountNumber || !accountHolder) {
            res
                .status(400)
                .json({ error: "bankName, accountNumber, accountHolder are required" });
            return;
        }
        const setting = await settingsService.createBankSetting({
            bankName,
            accountNumber,
            accountHolder,
        });
        res.status(201).json({ data: setting });
    } catch (error) {
        res.status(500).json({ error: "Failed to create bank setting" });
    }
});

// PUT /api/settings/admin/bank/:id — Update bank setting
router.put("/admin/bank/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const setting = await settingsService.updateBankSetting(
            req.params.id as string,
            req.body
        );
        if (!setting) {
            res.status(404).json({ error: "Bank setting not found" });
            return;
        }
        res.json({ data: setting });
    } catch (error) {
        res.status(500).json({ error: "Failed to update bank setting" });
    }
});

// DELETE /api/settings/admin/bank/:id — Delete bank setting
router.delete(
    "/admin/bank/:id",
    requireAuth,
    requireAdmin,
    async (req, res) => {
        try {
            const setting = await settingsService.deleteBankSetting(req.params.id as string);
            if (!setting) {
                res.status(404).json({ error: "Bank setting not found" });
                return;
            }
            res.json({ data: setting, message: "Bank setting deleted" });
        } catch (error) {
            res.status(500).json({ error: "Failed to delete bank setting" });
        }
    }
);

export default router;
