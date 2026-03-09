import { apiClient } from "../lib/api-client";

// ─── Public ───────────────────────────────────────────────────────────────────

/**
 * Get active bank accounts (for checkout page)
 */
export function getActiveBankSettings() {
    return apiClient.get("/api/settings/bank");
}

// ─── Admin ────────────────────────────────────────────────────────────────────

/**
 * Get all bank accounts (admin)
 */
export function getAllBankSettings() {
    return apiClient.get("/api/settings/admin/bank");
}

/**
 * Create a bank setting
 * @param {{ bankName: string, accountNumber: string, accountHolder: string }} data
 */
export function createBankSetting(data) {
    return apiClient.post("/api/settings/admin/bank", data);
}

/**
 * Update a bank setting
 * @param {string} id
 * @param {object} data
 */
export function updateBankSetting(id, data) {
    return apiClient.put(`/api/settings/admin/bank/${id}`, data);
}

/**
 * Delete a bank setting
 * @param {string} id
 */
export function deleteBankSetting(id) {
    return apiClient.delete(`/api/settings/admin/bank/${id}`);
}
