import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { db } from "../db/index.js";
import { orders, videotronUnits, user as userTable, orderDates } from "../db/schema.js";
import { sql, eq, and, gte, lte, count, sum, min, max, desc } from "drizzle-orm";

const router = Router();

router.use(requireAuth, requireAdmin);

// GET /api/admin/reports/summary — Overall summary
router.get("/summary", async (req, res) => {
    try {
        const { startDate, endDate } = req.query as Record<string, string>;

        let dateFilter: any[] = [];
        if (startDate) dateFilter.push(gte(orders.createdAt, new Date(startDate)));
        if (endDate) dateFilter.push(lte(orders.createdAt, new Date(endDate)));

        const [totalResult] = await db
            .select({
                totalOrders: count(orders.id),
                totalRevenue: sum(orders.totalAmount),
            })
            .from(orders)
            .where(dateFilter.length > 0 ? and(...dateFilter) : undefined);

        const [paidResult] = await db
            .select({
                count: count(orders.id),
                revenue: sum(orders.totalAmount),
            })
            .from(orders)
            .where(
                and(
                    ...[
                        sql`${orders.status} IN ('sudah_bayar', 'tayang', 'selesai')`,
                        ...dateFilter,
                    ]
                )
            );

        const [pendingResult] = await db
            .select({ count: count(orders.id) })
            .from(orders)
            .where(
                and(
                    ...[eq(orders.status, "pending" as any), ...dateFilter]
                )
            );

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
        console.error("Report summary error:", error);
        res.status(500).json({ error: "Failed to fetch report summary" });
    }
});

// GET /api/admin/reports/export — Export orders as CSV
router.get("/export", async (req, res) => {
    try {
        const { startDate, endDate, status } = req.query as Record<string, string>;

        let conditions: any[] = [];
        if (startDate) conditions.push(gte(orders.createdAt, new Date(startDate)));
        if (endDate) conditions.push(lte(orders.createdAt, new Date(endDate)));
        if (status) conditions.push(eq(orders.status, status as any));

        const rows = await db
            .select({
                orderNumber: orders.orderNumber,
                status: orders.status,
                totalAmount: orders.totalAmount,
                createdAt: orders.createdAt,
                userName: userTable.name,
                userEmail: userTable.email,
                unitName: videotronUnits.name,
                unitLocation: videotronUnits.location,
            })
            .from(orders)
            .leftJoin(userTable, eq(orders.userId, userTable.id))
            .leftJoin(videotronUnits, eq(orders.unitId, videotronUnits.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(orders.createdAt);

        // Build CSV
        const header = "No Pesanan,Status,Total,Dibuat,Nama User,Email,Unit,Lokasi\n";
        const csvRows = rows.map((r) =>
            [
                r.orderNumber,
                r.status,
                r.totalAmount,
                r.createdAt ? new Date(r.createdAt).toLocaleDateString("id-ID") : "",
                `"${(r.userName || "").replace(/"/g, '""')}"`,
                r.userEmail || "",
                `"${(r.unitName || "").replace(/"/g, '""')}"`,
                `"${(r.unitLocation || "").replace(/"/g, '""')}"`,
            ].join(",")
        );

        const csv = header + csvRows.join("\n");

        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename=laporan-pesanan-${new Date().toISOString().slice(0, 10)}.csv`);
        res.send(csv);
    } catch (error: any) {
        console.error("Report export error:", error);
        res.status(500).json({ error: "Failed to export report" });
    }
});

// GET /api/admin/reports/export-json — Get orders as JSON for the table
router.get("/export-json", async (req, res) => {
    try {
        const { startDate, endDate } = req.query as Record<string, string>;

        let conditions: any[] = [];
        if (startDate) conditions.push(gte(orders.createdAt, new Date(startDate)));
        if (endDate) conditions.push(lte(orders.createdAt, new Date(endDate)));

        const rows = await db
            .select({
                orderNumber: orders.orderNumber,
                status: orders.status,
                totalAmount: orders.totalAmount,
                createdAt: orders.createdAt,
                userName: userTable.name,
                userEmail: userTable.email,
                unitName: videotronUnits.name,
                unitLocation: videotronUnits.location,
                voucherCode: orders.voucherCode,
                minDate: sql<string>`(SELECT MIN(date) FROM order_dates WHERE order_id = ${orders.id})`,
                maxDate: sql<string>`(SELECT MAX(date) FROM order_dates WHERE order_id = ${orders.id})`,
            })
            .from(orders)
            .leftJoin(userTable, eq(orders.userId, userTable.id))
            .leftJoin(videotronUnits, eq(orders.unitId, videotronUnits.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(orders.createdAt));

        res.json({ data: rows });
    } catch (error: any) {
        console.error("Report export-json error:", error);
        res.status(500).json({ error: "Failed to fetch report data" });
    }
});

export default router;
