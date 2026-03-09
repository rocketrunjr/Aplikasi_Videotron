import { apiClient } from "../lib/api-client";

// ─── Admin ───────────────────────────────────────────────────────────────────

export function getAllVouchers(filters = {}) {
    return apiClient.get("/api/vouchers/admin", filters);
}

export function createVoucher(data) {
    return apiClient.post("/api/vouchers/admin", data);
}

export function toggleVoucher(id) {
    return apiClient.patch(`/api/vouchers/admin/${id}/toggle`);
}

export function deleteVoucher(id) {
    return apiClient.delete(`/api/vouchers/admin/${id}`);
}

// ─── Public ──────────────────────────────────────────────────────────────────

export function validateVoucher(code, orderAmount) {
    return apiClient.post("/api/vouchers/validate", { code, orderAmount });
}
