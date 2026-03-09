import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import * as ordersService from "../services/orders.service.js";
import { getPaginationParams, createPaginatedResult } from "../utils/pagination.js";

const router = Router();

// All order routes require authentication
router.use(requireAuth);

// POST /api/orders — Create new order
router.post("/", async (req, res) => {
    try {
        const { unitId, dates, materialFileUrl, materialDriveLink, paymentProofUrl, voucherCode } = req.body;

        if (!unitId || !dates || !Array.isArray(dates) || dates.length === 0) {
            res.status(400).json({ error: "unitId and dates[] are required" });
            return;
        }

        const order = await ordersService.createOrder({
            userId: req.user!.id,
            unitId,
            dates,
            materialFileUrl,
            materialDriveLink,
            paymentProofUrl,
            voucherCode,
        });

        res.status(201).json({ data: order });
    } catch (error: any) {
        res.status(400).json({ error: error.message || "Failed to create order" });
    }
});

// GET /api/orders — List user's orders
router.get("/", async (req, res) => {
    try {
        const { status, search } = req.query as Record<string, string>;
        const { page, limit, offset } = getPaginationParams(req.query);

        const result = await ordersService.getUserOrders(req.user!.id, {
            status,
            search,
            limit,
            offset,
        });

        res.json(createPaginatedResult(result.data, result.total, page, limit));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// GET /api/orders/:id — Get order detail
router.get("/:id", async (req, res) => {
    try {
        const order = await ordersService.getOrderDetail(
            req.params.id,
            req.user!.id
        );
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json({ data: order });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order" });
    }
});

// PATCH /api/orders/:id/payment-proof — Upload payment proof
router.patch("/:id/payment-proof", async (req, res) => {
    try {
        const { fileUrl } = req.body;
        if (!fileUrl) {
            res.status(400).json({ error: "fileUrl is required" });
            return;
        }

        const order = await ordersService.uploadPaymentProof(
            req.params.id,
            req.user!.id,
            fileUrl
        );

        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        res.json({ data: order });
    } catch (error) {
        res.status(500).json({ error: "Failed to upload payment proof" });
    }
});

// POST /api/orders/:id/apply-voucher — Apply voucher code
router.post("/:id/apply-voucher", async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) {
            res.status(400).json({ error: "code is required" });
            return;
        }

        const order = await ordersService.applyVoucher(req.params.id, code);
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        res.json({ data: order });
    } catch (error) {
        res.status(500).json({ error: "Failed to apply voucher" });
    }
});

export default router;
