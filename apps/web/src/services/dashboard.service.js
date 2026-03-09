import { apiClient } from "../lib/api-client";

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

/**
 * Get admin dashboard stats
 */
export function getAdminDashboardStats() {
    return apiClient.get("/api/dashboard/admin/stats");
}

/**
 * Get admin recent orders
 * @param {number} [limit=5]
 */
export function getAdminRecentOrders(limit = 5) {
    return apiClient.get("/api/dashboard/admin/recent-orders", { limit });
}

/**
 * Get revenue chart data
 * @param {string} [period='monthly'] — weekly | monthly | yearly
 */
export function getRevenueChart(period = 'monthly') {
    return apiClient.get("/api/dashboard/admin/revenue-chart", { period });
}

/**
 * Get top videotron units by revenue
 * @param {number} [limit=3]
 */
export function getTopUnits(limit = 3) {
    return apiClient.get("/api/dashboard/admin/top-units", { limit });
}

// ─── User Dashboard ───────────────────────────────────────────────────────────

/**
 * Get user dashboard stats
 */
export function getUserDashboardStats() {
    return apiClient.get("/api/dashboard/stats");
}

/**
 * Get user recent orders
 * @param {number} [limit=5]
 */
export function getUserRecentOrders(limit = 5) {
    return apiClient.get("/api/dashboard/recent-orders", { limit });
}
