import { apiClient } from "../lib/api-client";

/**
 * List all users (admin, paginated)
 * @param {{ search?: string, type?: string, status?: string, page?: number, limit?: number }} [filters]
 */
export function getAllUsers(filters = {}) {
    return apiClient.get("/api/admin/users", filters);
}

/**
 * Get user detail by ID
 * @param {string} id
 */
export function getUserById(id) {
    return apiClient.get(`/api/admin/users/${id}`);
}

/**
 * Update a user
 * @param {string} id
 * @param {object} data
 */
export function updateUser(id, data) {
    return apiClient.patch(`/api/admin/users/${id}`, data);
}

/**
 * Suspend a user
 * @param {string} id
 */
export function suspendUser(id) {
    return apiClient.patch(`/api/admin/users/${id}/suspend`);
}

/**
 * Activate a user
 * @param {string} id
 */
export function activateUser(id) {
    return apiClient.patch(`/api/admin/users/${id}/activate`);
}

/**
 * Delete a user
 * @param {string} id
 */
export function deleteUser(id) {
    return apiClient.delete(`/api/admin/users/${id}`);
}

/**
 * Reset user password (admin)
 * @param {string} id
 * @param {string} password
 */
export function resetUserPassword(id, password) {
    return apiClient.patch(`/api/admin/users/${id}/password`, { password });
}
