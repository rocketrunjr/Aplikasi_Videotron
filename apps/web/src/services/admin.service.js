import { apiClient } from "../lib/api-client";

// ─── Admin Orders ─────────────────────────────────────────────────────────────

/**
 * List all orders (admin, paginated)
 * @param {{ status?: string, search?: string, page?: number, limit?: number }} [filters]
 */
export function getAdminOrders(filters = {}) {
    return apiClient.get("/api/admin/orders", filters);
}

/**
 * Get order detail (admin view)
 * @param {string} id
 */
export function getAdminOrderDetail(id) {
    return apiClient.get(`/api/admin/orders/${id}`);
}

/**
 * Approve payment for an order
 * @param {string} id
 * @param {string} [adminNotes]
 */
export function verifyPayment(id, adminNotes) {
    return apiClient.patch(`/api/admin/orders/${id}/verify`, { adminNotes });
}

/**
 * Reject payment for an order
 * @param {string} id
 * @param {string} adminNotes
 */
export function rejectPayment(id, adminNotes) {
    return apiClient.patch(`/api/admin/orders/${id}/reject`, { adminNotes });
}

/**
 * Update order status
 * @param {string} id
 * @param {string} status
 */
export function updateOrderStatus(id, status) {
    return apiClient.patch(`/api/admin/orders/${id}/status`, { status });
}

/**
 * Upload invoice for an order
 * @param {string} id
 * @param {string} fileUrl
 */
export function uploadInvoice(id, fileUrl) {
    return apiClient.post(`/api/admin/orders/${id}/invoice`, { fileUrl });
}

/**
 * Upload broadcast proof image
 * @param {string} id
 * @param {{ date: string, timeOfDay?: string, imageUrl: string }} data
 */
export function uploadBroadcastProof(id, data) {
    return apiClient.post(`/api/admin/orders/${id}/broadcast-proof`, data);
}

// ─── Admin Units ──────────────────────────────────────────────────────────────

/**
 * List all units (including inactive, admin, paginated)
 * @param {{ search?: string, status?: string, page?: number, limit?: number }} [filters]
 */
export function getAdminUnits(filters = {}) {
    return apiClient.get("/api/admin/units", filters);
}

/**
 * Create a new videotron unit
 */
export function createUnit(data) {
    return apiClient.post("/api/admin/units", data);
}

/**
 * Update a videotron unit
 * @param {string} id
 */
export function updateUnit(id, data) {
    return apiClient.put(`/api/admin/units/${id}`, data);
}

/**
 * Toggle unit active/inactive status
 * @param {string} id
 */
export function toggleUnitStatus(id) {
    return apiClient.patch(`/api/admin/units/${id}/toggle-status`);
}

/**
 * Delete a videotron unit
 * @param {string} id
 */
export function deleteUnit(id) {
    return apiClient.delete(`/api/admin/units/${id}`);
}

/**
 * Delete an order (admin)
 * @param {string} id
 */
export function deleteOrder(id) {
    return apiClient.delete(`/api/admin/orders/${id}`);
}
