import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import * as ordersService from "../services/orders.service.js";
import * as unitsService from "../services/units.service.js";
import { getPaginationParams, createPaginatedResult } from "../utils/pagination.js";
import { db } from "../db/index.js";
import { user as userTable, petugasAssignments } from "../db/schema.js";
import { eq, inArray } from "drizzle-orm";

const router = Router();

// All admin routes require auth + admin role
router.use(requireAuth, requireAdmin);

// ─── Orders ──────────────────────────────────────────────────────────────────

// GET /api/admin/orders — List all orders
router.get("/orders", async (req, res) => {
    try {
        const { status, search } = req.query as Record<string, string>;
        const { page, limit, offset } = getPaginationParams(req.query);

        const result = await ordersService.getAllOrders({
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

// GET /api/admin/orders/:id — Get order detail (admin view)
router.get("/orders/:id", async (req, res) => {
    try {
        const order = await ordersService.getOrderDetail(req.params.id);
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json({ data: order });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch order" });
    }
});

// PATCH /api/admin/orders/:id/verify — Approve payment
router.patch("/orders/:id/verify", async (req, res) => {
    try {
        const { adminNotes } = req.body;
        const order = await ordersService.verifyPayment(req.params.id, adminNotes);
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json({ data: order });
    } catch (error) {
        res.status(500).json({ error: "Failed to verify payment" });
    }
});

// PATCH /api/admin/orders/:id/reject — Reject payment
router.patch("/orders/:id/reject", async (req, res) => {
    try {
        const { adminNotes } = req.body;
        if (!adminNotes) {
            res.status(400).json({ error: "adminNotes is required for rejection" });
            return;
        }
        const order = await ordersService.rejectPayment(req.params.id, adminNotes);
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json({ data: order });
    } catch (error) {
        res.status(500).json({ error: "Failed to reject payment" });
    }
});

// PATCH /api/admin/orders/:id/status — Update order status
router.patch("/orders/:id/status", async (req, res) => {
    try {
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
        const order = await ordersService.updateOrderStatus(req.params.id, status);
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json({ data: order });
    } catch (error) {
        res.status(500).json({ error: "Failed to update order status" });
    }
});

// POST /api/admin/orders/:id/invoice — Upload invoice
router.post("/orders/:id/invoice", async (req, res) => {
    try {
        const { fileUrl } = req.body;
        if (!fileUrl) {
            res.status(400).json({ error: "fileUrl is required" });
            return;
        }
        const order = await ordersService.uploadInvoice(req.params.id, fileUrl);
        if (!order) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json({ data: order });
    } catch (error) {
        res.status(500).json({ error: "Failed to upload invoice" });
    }
});

// POST /api/admin/orders/:id/broadcast-proof — Upload broadcast proof image
router.post("/orders/:id/broadcast-proof", async (req, res) => {
    try {
        const { date, timeOfDay, imageUrl } = req.body;
        if (!date || !imageUrl) {
            res.status(400).json({ error: "date and imageUrl are required" });
            return;
        }
        const proof = await ordersService.uploadBroadcastProof({
            orderId: req.params.id,
            date,
            timeOfDay: timeOfDay || "siang",
            imageUrl,
        });
        res.status(201).json({ data: proof });
    } catch (error) {
        res.status(500).json({ error: "Failed to upload broadcast proof" });
    }
});

// ─── Units ───────────────────────────────────────────────────────────────────

// GET /api/admin/units — List all units (including inactive)
router.get("/units", async (req, res) => {
    try {
        const { search, status } = req.query as Record<string, string>;
        const { page, limit, offset } = getPaginationParams(req.query);

        const result = await unitsService.getAllUnits({
            search,
            status,
            page,
            limit,
            offset,
        });

        res.json(createPaginatedResult(result.data, result.total, page, limit));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch units" });
    }
});

// POST /api/admin/units — Create new unit
router.post("/units", async (req, res) => {
    try {
        const { code, name, location, city, size, type, aspectRatio, pricePerDay, imageUrl } =
            req.body;

        if (!code || !name || !location || !city || !size || !pricePerDay) {
            res.status(400).json({
                error: "code, name, location, city, size, and pricePerDay are required",
            });
            return;
        }

        const unit = await unitsService.createUnit({
            code,
            name,
            location,
            city,
            size,
            type: type || "outdoor",
            aspectRatio: aspectRatio || "16:9",
            pricePerDay,
            imageUrl,
        });

        res.status(201).json({ data: unit });
    } catch (error: any) {
        if (error.code === "23505") {
            res.status(409).json({ error: "Unit code already exists" });
            return;
        }
        res.status(500).json({ error: "Failed to create unit" });
    }
});

// PUT /api/admin/units/:id — Update unit
router.put("/units/:id", async (req, res) => {
    try {
        const unit = await unitsService.updateUnit(req.params.id, req.body);
        if (!unit) {
            res.status(404).json({ error: "Unit not found" });
            return;
        }
        res.json({ data: unit });
    } catch (error) {
        res.status(500).json({ error: "Failed to update unit" });
    }
});

// PATCH /api/admin/units/:id/toggle-status — Toggle active/inactive
router.patch("/units/:id/toggle-status", async (req, res) => {
    try {
        const unit = await unitsService.toggleUnitStatus(req.params.id);
        if (!unit) {
            res.status(404).json({ error: "Unit not found" });
            return;
        }
        res.json({ data: unit });
    } catch (error) {
        res.status(500).json({ error: "Failed to toggle unit status" });
    }
});

// DELETE /api/admin/units/:id — Delete unit
router.delete("/units/:id", async (req, res) => {
    try {
        const unit = await unitsService.deleteUnit(req.params.id);
        if (!unit) {
            res.status(404).json({ error: "Unit not found" });
            return;
        }
        res.json({ data: unit, message: "Unit deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete unit" });
    }
});

// DELETE /api/admin/orders/:id — Delete order permanently
router.delete("/orders/:id", async (req, res) => {
    try {
        const deleted = await ordersService.deleteOrder(req.params.id);
        if (!deleted) {
            res.status(404).json({ error: "Order not found" });
            return;
        }
        res.json({ data: deleted, message: "Order deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete order" });
    }
});

// ─── Petugas Assignment ─────────────────────────────────────────────────────

// GET /api/admin/petugas — List all users with role=petugas
router.get("/petugas", async (req, res) => {
    try {
        const petugasList = await db
            .select({
                id: userTable.id,
                name: userTable.name,
                email: userTable.email,
                phone: userTable.phone,
            })
            .from(userTable)
            .where(eq(userTable.role, "petugas"));
        res.json({ data: petugasList });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch petugas list" });
    }
});

// GET /api/admin/units/:id/assignments — Get assigned petugas for a unit
router.get("/units/:id/assignments", async (req, res) => {
    try {
        const assignments = await db
            .select({
                id: petugasAssignments.id,
                userId: petugasAssignments.userId,
                userName: userTable.name,
                userEmail: userTable.email,
            })
            .from(petugasAssignments)
            .leftJoin(userTable, eq(petugasAssignments.userId, userTable.id))
            .where(eq(petugasAssignments.unitId, req.params.id));
        res.json({ data: assignments });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch assignments" });
    }
});

// PUT /api/admin/units/:id/assignments — Set assignments (replace all)
router.put("/units/:id/assignments", async (req, res) => {
    try {
        const unitId = req.params.id;
        const { userIds } = req.body; // string[]
        if (!Array.isArray(userIds)) {
            return res.status(400).json({ error: "userIds must be an array" });
        }

        // Delete existing assignments for this unit
        await db.delete(petugasAssignments).where(eq(petugasAssignments.unitId, unitId));

        // Insert new assignments
        if (userIds.length > 0) {
            await db.insert(petugasAssignments).values(
                userIds.map((userId: string) => ({ userId, unitId }))
            );
        }

        // Fetch and return the new assignments
        const assignments = await db
            .select({
                id: petugasAssignments.id,
                userId: petugasAssignments.userId,
                userName: userTable.name,
                userEmail: userTable.email,
            })
            .from(petugasAssignments)
            .leftJoin(userTable, eq(petugasAssignments.userId, userTable.id))
            .where(eq(petugasAssignments.unitId, unitId));

        res.json({ data: assignments });
    } catch (error) {
        console.error("Assignment error:", error);
        res.status(500).json({ error: "Failed to update assignments" });
    }
});

export default router;
