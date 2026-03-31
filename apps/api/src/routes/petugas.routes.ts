import { Router } from "express";
import { requireAuth, requirePetugas } from "../middleware/auth.js";
import { db } from "../db/index.js";
import {
    orders, videotronUnits, user as userTable, orderDates,
    petugasAssignments, vouchers, broadcastProofs,
} from "../db/schema.js";
import { sql, eq, and, gte, lte, count, sum, inArray, desc } from "drizzle-orm";
import * as ordersService from "../services/orders.service.js";

const router = Router();

router.use(requireAuth, requirePetugas);

// Helper: get assigned unit IDs for a petugas
async function getAssignedUnitIds(userId: string): Promise<string[]> {
    const assignments = await db
        .select({ unitId: petugasAssignments.unitId })
        .from(petugasAssignments)
        .where(eq(petugasAssignments.userId, userId));
    return assignments.map((a) => a.unitId);
}

// GET /api/petugas/dashboard — Dashboard summary (filtered by assigned units)
router.get("/dashboard", async (req, res) => {
    try {
        const unitIds = await getAssignedUnitIds(req.user!.id);
        if (unitIds.length === 0) {
            return res.json({ data: { totalOrders: 0, totalRevenue: 0, activeOrders: 0, units: [] } });
        }

        const [totals] = await db
            .select({
                totalOrders: count(orders.id),
                totalRevenue: sum(orders.totalAmount),
            })
            .from(orders)
            .where(inArray(orders.unitId, unitIds));

        const [active] = await db
            .select({ count: count(orders.id) })
            .from(orders)
            .where(and(
                inArray(orders.unitId, unitIds),
                sql`${orders.status} IN ('pending', 'menunggu_verifikasi', 'sudah_bayar', 'tayang')`,
            ));

        const units = await db
            .select()
            .from(videotronUnits)
            .where(inArray(videotronUnits.id, unitIds));

        res.json({
            data: {
                totalOrders: Number(totals.totalOrders) || 0,
                totalRevenue: Number(totals.totalRevenue) || 0,
                activeOrders: Number(active.count) || 0,
                units,
            },
        });
    } catch (error: any) {
        console.error("Petugas dashboard error:", error);
        res.status(500).json({ error: "Failed to fetch dashboard" });
    }
});

// GET /api/petugas/orders — Orders for assigned units
router.get("/orders", async (req, res) => {
    try {
        const unitIds = await getAssignedUnitIds(req.user!.id);
        if (unitIds.length === 0) return res.json({ data: [] });

        const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
        const offset = (parseInt(page) - 1) * parseInt(limit);

        let conditions: any[] = [inArray(orders.unitId, unitIds)];
        if (status) conditions.push(eq(orders.status, status as any));

        const rows = await db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                status: orders.status,
                totalAmount: orders.totalAmount,
                createdAt: orders.createdAt,
                userName: userTable.name,
                userEmail: userTable.email,
                unitName: videotronUnits.name,
                unitLocation: videotronUnits.location,
                paymentProofUrl: orders.paymentProofUrl,
                voucherCode: orders.voucherCode,
            })
            .from(orders)
            .leftJoin(userTable, eq(orders.userId, userTable.id))
            .leftJoin(videotronUnits, eq(orders.unitId, videotronUnits.id))
            .where(and(...conditions))
            .orderBy(desc(orders.createdAt))
            .limit(parseInt(limit))
            .offset(offset);

        const [countResult] = await db
            .select({ total: count(orders.id) })
            .from(orders)
            .where(and(...conditions));

        res.json({ data: rows, total: Number(countResult.total) || 0 });
    } catch (error: any) {
        console.error("Petugas orders error:", error);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

// GET /api/petugas/orders/:id — Order detail
router.get("/orders/:id", async (req, res) => {
    try {
        const unitIds = await getAssignedUnitIds(req.user!.id);
        const orderId = req.params.id;

        const [order] = await db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                userId: orders.userId,
                unitId: orders.unitId,
                status: orders.status,
                materialFileUrl: orders.materialFileUrl,
                materialDriveLink: orders.materialDriveLink,
                paymentProofUrl: orders.paymentProofUrl,
                voucherCode: orders.voucherCode,
                discountAmount: orders.discountAmount,
                subtotal: orders.subtotal,
                totalAmount: orders.totalAmount,
                adminNotes: orders.adminNotes,
                createdAt: orders.createdAt,
                userName: userTable.name,
                userEmail: userTable.email,
                userPhone: userTable.phone,
                unitName: videotronUnits.name,
                unitLocation: videotronUnits.location,
            })
            .from(orders)
            .leftJoin(userTable, eq(orders.userId, userTable.id))
            .leftJoin(videotronUnits, eq(orders.unitId, videotronUnits.id))
            .where(eq(orders.id, orderId))
            .limit(1);

        if (!order || !unitIds.includes(order.unitId)) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Get order dates
        const dates = await db
            .select()
            .from(orderDates)
            .where(eq(orderDates.orderId, orderId));

        // Get broadcast proofs
        const proofs = await db
            .select()
            .from(broadcastProofs)
            .where(eq(broadcastProofs.orderId, orderId));

        res.json({ data: { ...order, dates, broadcastProofs: proofs } });
    } catch (error: any) {
        console.error("Petugas order detail error:", error);
        res.status(500).json({ error: "Failed to fetch order" });
    }
});

// PATCH /api/petugas/orders/:id/status — Update order status
router.patch("/orders/:id/status", async (req, res) => {
    try {
        const unitIds = await getAssignedUnitIds(req.user!.id);
        const orderId = req.params.id;

        const [orderData] = await db.select({ unitId: orders.unitId }).from(orders).where(eq(orders.id, orderId)).limit(1);
        if (!orderData || !unitIds.includes(orderData.unitId)) {
            return res.status(403).json({ error: "Unauthorized access to this order" });
        }

        const { status } = req.body;
        const validStatuses = [
            "pending",
            "menunggu_verifikasi",
            "ditolak",
            "sudah_bayar",
            "tayang",
            "selesai",
            "dibatalkan",
        ];
        if (!status || !validStatuses.includes(status)) {
            res.status(400).json({
                error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
            });
            return;
        }

        const order = await ordersService.updateOrderStatus(orderId, status);
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        res.json({ data: order });
    } catch (error) {
        console.error("Petugas update status error:", error);
        res.status(500).json({ error: "Failed to update order status" });
    }
});

// POST /api/petugas/orders/:id/invoice — Upload invoice
router.post("/orders/:id/invoice", async (req, res) => {
    try {
        const unitIds = await getAssignedUnitIds(req.user!.id);
        const orderId = req.params.id;

        const [orderData] = await db.select({ unitId: orders.unitId }).from(orders).where(eq(orders.id, orderId)).limit(1);
        if (!orderData || !unitIds.includes(orderData.unitId)) {
            return res.status(403).json({ error: "Unauthorized access to this order" });
        }

        const { fileUrl } = req.body;
        if (!fileUrl) {
            res.status(400).json({ error: "fileUrl is required" });
            return;
        }

        const order = await ordersService.uploadInvoice(orderId, fileUrl);
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }

        res.json({ data: order });
    } catch (error) {
        console.error("Petugas upload invoice error:", error);
        res.status(500).json({ error: "Failed to upload invoice" });
    }
});

// POST /api/petugas/orders/:id/broadcast-proof — Upload broadcast proof image
router.post("/orders/:id/broadcast-proof", async (req, res) => {
    try {
        const unitIds = await getAssignedUnitIds(req.user!.id);
        const orderId = req.params.id;

        const [orderData] = await db.select({ unitId: orders.unitId }).from(orders).where(eq(orders.id, orderId)).limit(1);
        if (!orderData || !unitIds.includes(orderData.unitId)) {
            return res.status(403).json({ error: "Unauthorized access to this order" });
        }

        const { date, timeOfDay, imageUrl } = req.body;
        if (!date || !imageUrl) {
            res.status(400).json({ error: "date and imageUrl are required" });
            return;
        }

        const proof = await ordersService.uploadBroadcastProof({
            orderId: orderId,
            date,
            timeOfDay: timeOfDay || "siang",
            imageUrl,
        });

        res.status(201).json({ data: proof });
    } catch (error) {
        console.error("Petugas upload broadcast proof error:", error);
        res.status(500).json({ error: "Failed to upload broadcast proof" });
    }
});

// GET /api/petugas/reports/summary — Reports summary
router.get("/reports/summary", async (req, res) => {
    try {
        const unitIds = await getAssignedUnitIds(req.user!.id);
        if (unitIds.length === 0) {
            return res.json({ data: { totalOrders: 0, totalRevenue: 0, paidOrders: 0, paidRevenue: 0, pendingOrders: 0 } });
        }

        const { startDate, endDate } = req.query as Record<string, string>;
        let dateFilter: any[] = [inArray(orders.unitId, unitIds)];
        if (startDate) dateFilter.push(gte(orders.createdAt, new Date(startDate)));
        if (endDate) dateFilter.push(lte(orders.createdAt, new Date(endDate)));

        const [totalResult] = await db
            .select({ totalOrders: count(orders.id), totalRevenue: sum(orders.totalAmount) })
            .from(orders)
            .where(and(...dateFilter));

        const [paidResult] = await db
            .select({ count: count(orders.id), revenue: sum(orders.totalAmount) })
            .from(orders)
            .where(and(...dateFilter, sql`${orders.status} IN ('sudah_bayar', 'tayang', 'selesai')`));

        const [pendingResult] = await db
            .select({ count: count(orders.id) })
            .from(orders)
            .where(and(...dateFilter, eq(orders.status, "pending" as any)));

        res.json({
            data: {
                totalOrders: Number(totalResult.totalOrders) || 0,
                totalRevenue: Number(totalResult.totalRevenue) || 0,
                paidOrders: Number(paidResult.count) || 0,
                paidRevenue: Number(paidResult.revenue) || 0,
                pendingOrders: Number(pendingResult.count) || 0,
            },
        });
    } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch report summary" });
    }
});

// GET /api/petugas/reports/export-json — Reports data
router.get("/reports/export-json", async (req, res) => {
    try {
        const unitIds = await getAssignedUnitIds(req.user!.id);
        if (unitIds.length === 0) return res.json({ data: [] });

        const { startDate, endDate } = req.query as Record<string, string>;
        let conditions: any[] = [inArray(orders.unitId, unitIds)];
        if (startDate) conditions.push(gte(orders.createdAt, new Date(startDate)));
        if (endDate) conditions.push(lte(orders.createdAt, new Date(endDate)));

        const rows = await db
            .select({
                orderNumber: orders.orderNumber,
                status: orders.status,
                totalAmount: orders.totalAmount,
                createdAt: orders.createdAt,
                userName: userTable.name,
                unitName: videotronUnits.name,
                voucherCode: orders.voucherCode,
                minDate: sql<string>`(SELECT MIN(date) FROM order_dates WHERE order_id = ${orders.id})`,
                maxDate: sql<string>`(SELECT MAX(date) FROM order_dates WHERE order_id = ${orders.id})`,
            })
            .from(orders)
            .leftJoin(userTable, eq(orders.userId, userTable.id))
            .leftJoin(videotronUnits, eq(orders.unitId, videotronUnits.id))
            .where(and(...conditions))
            .orderBy(orders.createdAt);

        res.json({ data: rows });
    } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch report data" });
    }
});

// ─── Voucher CRUD for Petugas ──────────────────────────────────────────────

// GET /api/petugas/vouchers
router.get("/vouchers", async (req, res) => {
    try {
        const allVouchers = await db.select().from(vouchers).orderBy(desc(vouchers.createdAt));
        res.json({ data: allVouchers });
    } catch (error: any) {
        res.status(500).json({ error: "Failed to fetch vouchers" });
    }
});

// POST /api/petugas/vouchers
router.post("/vouchers", async (req, res) => {
    try {
        const { code, discountAmount, discountType, usageLimit, validFrom, validUntil } = req.body;
        const [created] = await db
            .insert(vouchers)
            .values({
                code: code?.toUpperCase(),
                discountAmount: parseInt(discountAmount) || 0,
                discountType: discountType || "fixed",
                usageLimit: parseInt(usageLimit) || 0,
                validFrom: validFrom ? new Date(validFrom) : null,
                validUntil: validUntil ? new Date(validUntil) : null,
            })
            .returning();
        res.status(201).json({ data: created });
    } catch (error: any) {
        if (error.code === "23505") {
            return res.status(400).json({ error: "Kode voucher sudah ada" });
        }
        res.status(500).json({ error: "Failed to create voucher" });
    }
});

// PATCH /api/petugas/vouchers/:id
router.patch("/vouchers/:id", async (req, res) => {
    try {
        const { code, discountAmount, discountType, isActive, usageLimit, validFrom, validUntil } = req.body;
        const updates: any = {};
        if (code !== undefined) updates.code = code.toUpperCase();
        if (discountAmount !== undefined) updates.discountAmount = parseInt(discountAmount);
        if (discountType !== undefined) updates.discountType = discountType;
        if (isActive !== undefined) updates.isActive = isActive;
        if (usageLimit !== undefined) updates.usageLimit = parseInt(usageLimit);
        if (validFrom !== undefined) updates.validFrom = validFrom ? new Date(validFrom) : null;
        if (validUntil !== undefined) updates.validUntil = validUntil ? new Date(validUntil) : null;
        updates.updatedAt = new Date();

        const [updated] = await db
            .update(vouchers)
            .set(updates)
            .where(eq(vouchers.id, req.params.id))
            .returning();

        if (!updated) return res.status(404).json({ error: "Voucher not found" });
        res.json({ data: updated });
    } catch (error: any) {
        res.status(500).json({ error: "Failed to update voucher" });
    }
});

// DELETE /api/petugas/vouchers/:id
router.delete("/vouchers/:id", async (req, res) => {
    try {
        const [deleted] = await db
            .delete(vouchers)
            .where(eq(vouchers.id, req.params.id))
            .returning();
        if (!deleted) return res.status(404).json({ error: "Voucher not found" });
        res.json({ data: deleted });
    } catch (error: any) {
        res.status(500).json({ error: "Failed to delete voucher" });
    }
});

export default router;
