import { apiClient } from "../lib/api-client";

/**
 * Upload a file
 * @param {string} type — upload type: material, payment-proof, broadcast-proof, invoice, avatar, unit-image
 * @param {File} file — the file to upload
 */
export function uploadFile(type, file) {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post(`/api/uploads/${type}`, formData);
}

/**
 * Get current user's profile
 */
export function getProfile() {
    return apiClient.get("/api/profile");
}

/**
 * Update current user's profile
 * @param {{ name?: string, phone?: string, company?: string, address?: string }} data
 */
export function updateProfile(data) {
    return apiClient.patch("/api/profile", data);
}
