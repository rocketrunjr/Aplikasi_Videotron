import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import * as dashboardService from "../services/dashboard.service.js";

const router = Router();

// All dashboard routes require auth
router.use(requireAuth);

// ─── Admin Dashboard ─────────────────────────────────────────────────────────

// GET /api/dashboard/admin/stats
router.get("/admin/stats", requireAdmin, async (req, res) => {
    try {
        const stats = await dashboardService.getAdminDashboardStats();
        res.json({ data: stats });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
});

// GET /api/dashboard/admin/recent-orders
router.get("/admin/recent-orders", requireAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 5;
        const orders = await dashboardService.getAdminRecentOrders(limit);
        res.json({ data: orders });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recent orders" });
    }
});

// GET /api/dashboard/admin/revenue-chart?period=monthly
router.get("/admin/revenue-chart", requireAdmin, async (req, res) => {
    try {
        const period = (req.query.period as string) || "monthly";
        const data = await dashboardService.getRevenueChart(period);
        res.json({ data });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch revenue chart" });
    }
});

// GET /api/dashboard/admin/top-units
router.get("/admin/top-units", requireAdmin, async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 3;
        const data = await dashboardService.getTopVideotronRevenue(limit);
        res.json({ data });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch top units" });
    }
});

// ─── User Dashboard ──────────────────────────────────────────────────────────

// GET /api/dashboard/stats
router.get("/stats", async (req, res) => {
    try {
        const stats = await dashboardService.getUserDashboardStats(req.user!.id);
        res.json({ data: stats });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
});

// GET /api/dashboard/recent-orders
router.get("/recent-orders", async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 5;
        const orders = await dashboardService.getUserRecentOrders(
            req.user!.id,
            limit
        );
        res.json({ data: orders });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recent orders" });
    }
});

export default router;
