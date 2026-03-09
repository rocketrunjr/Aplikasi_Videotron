import { apiClient } from "../lib/api-client";

/**
 * Get all active videotron units (public)
 * @param {{ search?: string, city?: string, type?: string }} [filters]
 */
export function getActiveUnits(filters = {}) {
    return apiClient.get("/api/units", filters);
}

/**
 * Get unit detail by ID (public)
 * @param {string} id
 */
export function getUnitById(id) {
    return apiClient.get(`/api/units/${id}`);
}

/**
 * Get date availability for a unit (public)
 * @param {string} id
 * @param {number} month
 * @param {number} year
 */
export function getUnitAvailability(id, month, year) {
    return apiClient.get(`/api/units/${id}/availability`, { month, year });
}
