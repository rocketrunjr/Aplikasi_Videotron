import { useQuery } from "@tanstack/react-query";
import * as dashboardService from "../services/dashboard.service";

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

/**
 * Fetch admin dashboard stats
 */
export function useAdminDashboardStats() {
    return useQuery({
        queryKey: ["dashboard", "admin", "stats"],
        queryFn: () => dashboardService.getAdminDashboardStats(),
    });
}

/**
 * Fetch admin recent orders
 * @param {number} [limit=5]
 */
export function useAdminRecentOrders(limit = 5) {
    return useQuery({
        queryKey: ["dashboard", "admin", "recent-orders", limit],
        queryFn: () => dashboardService.getAdminRecentOrders(limit),
    });
}

/**
 * Fetch revenue chart data
 * @param {string} [period='monthly']
 */
export function useRevenueChart(period = 'monthly') {
    return useQuery({
        queryKey: ["dashboard", "admin", "revenue-chart", period],
        queryFn: () => dashboardService.getRevenueChart(period),
    });
}

/**
 * Fetch top videotron units by revenue
 * @param {number} [limit=3]
 */
export function useTopUnits(limit = 3) {
    return useQuery({
        queryKey: ["dashboard", "admin", "top-units", limit],
        queryFn: () => dashboardService.getTopUnits(limit),
    });
}

// ─── User Dashboard ───────────────────────────────────────────────────────────

/**
 * Fetch user dashboard stats
 */
export function useUserDashboardStats() {
    return useQuery({
        queryKey: ["dashboard", "user", "stats"],
        queryFn: () => dashboardService.getUserDashboardStats(),
    });
}

/**
 * Fetch user recent orders
 * @param {number} [limit=5]
 */
export function useUserRecentOrders(limit = 5) {
    return useQuery({
        queryKey: ["dashboard", "user", "recent-orders", limit],
        queryFn: () => dashboardService.getUserRecentOrders(limit),
    });
}
