import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import * as vouchersService from "../services/vouchers.service.js";

const router = Router();

// ─── Public: Validate voucher ────────────────────────────────────────────────

// POST /api/vouchers/validate — Validate a voucher code
router.post("/validate", requireAuth, async (req, res) => {
    try {
        const { code, orderAmount } = req.body;
        if (!code || !orderAmount) {
            res.status(400).json({ error: "code and orderAmount are required" });
            return;
        }
        const result = await vouchersService.validateVoucher(code, Number(orderAmount));
        res.json({ data: result });
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Voucher tidak valid" });
    }
});

// ─── Admin: CRUD ─────────────────────────────────────────────────────────────

// GET /api/vouchers/admin — List all vouchers (admin)
router.get("/admin", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { search, status } = req.query as Record<string, string>;
        const result = await vouchersService.getAllVouchers({ search, status });
        res.json({ data: result.data, total: result.total });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch vouchers" });
    }
});

// POST /api/vouchers/admin — Create voucher (admin)
router.post("/admin", requireAuth, requireAdmin, async (req, res) => {
    try {
        const { code, discountAmount, discountType, usageLimit, validFrom, validUntil } = req.body;
        if (!code || !discountAmount) {
            res.status(400).json({ error: "code and discountAmount are required" });
            return;
        }
        const voucher = await vouchersService.createVoucher({
            code,
            discountAmount: Number(discountAmount),
            discountType: discountType || "fixed",
            usageLimit: usageLimit ? Number(usageLimit) : 0,
            validFrom,
            validUntil,
        });
        res.status(201).json({ data: voucher });
    } catch (error: any) {
        if (error.code === '23505') {
            res.status(400).json({ error: "Kode voucher sudah ada." });
            return;
        }
        res.status(500).json({ error: "Failed to create voucher" });
    }
});

// PATCH /api/vouchers/admin/:id/toggle — Toggle voucher active status (admin)
router.patch("/admin/:id/toggle", requireAuth, requireAdmin, async (req, res) => {
    try {
        const voucher = await vouchersService.toggleVoucherStatus(req.params.id as string);
        if (!voucher) {
            res.status(404).json({ error: "Voucher not found" });
            return;
        }
        res.json({ data: voucher });
    } catch (error) {
        res.status(500).json({ error: "Failed to toggle voucher" });
    }
});

// DELETE /api/vouchers/admin/:id — Delete voucher (admin)
router.delete("/admin/:id", requireAuth, requireAdmin, async (req, res) => {
    try {
        const voucher = await vouchersService.deleteVoucher(req.params.id as string);
        if (!voucher) {
            res.status(404).json({ error: "Voucher not found" });
            return;
        }
        res.json({ data: voucher, message: "Voucher deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete voucher" });
    }
});

export default router;
