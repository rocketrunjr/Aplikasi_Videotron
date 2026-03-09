import { apiClient } from "../lib/api-client";

/**
 * Create a new order
 * @param {{ unitId: string, dates: string[], materialFileUrl?: string, materialDriveLink?: string }} data
 */
export function createOrder(data) {
    return apiClient.post("/api/orders", data);
}

/**
 * Get current user's orders (paginated)
 * @param {{ status?: string, search?: string, page?: number, limit?: number }} [filters]
 */
export function getUserOrders(filters = {}) {
    return apiClient.get("/api/orders", filters);
}

/**
 * Get order detail
 * @param {string} id
 */
export function getOrderDetail(id) {
    return apiClient.get(`/api/orders/${id}`);
}

/**
 * Upload payment proof for an order
 * @param {string} id
 * @param {string} fileUrl
 */
export function uploadPaymentProof(id, fileUrl) {
    return apiClient.patch(`/api/orders/${id}/payment-proof`, { fileUrl });
}

/**
 * Apply voucher code to an order
 * @param {string} id
 * @param {string} code
 */
export function applyVoucher(id, code) {
    return apiClient.post(`/api/orders/${id}/apply-voucher`, { code });
}
