import { useQuery } from "@tanstack/react-query";
import * as unitsService from "../services/units.service";

/**
 * Fetch all active videotron units (public)
 * @param {{ search?: string, city?: string, type?: string }} [filters]
 */
export function useActiveUnits(filters = {}) {
    return useQuery({
        queryKey: ["units", filters],
        queryFn: () => unitsService.getActiveUnits(filters),
    });
}

/**
 * Fetch a single unit by ID (public)
 * @param {string|null} id
 */
export function useUnit(id) {
    return useQuery({
        queryKey: ["units", id],
        queryFn: () => unitsService.getUnitById(id),
        enabled: !!id,
    });
}

/**
 * Fetch date availability for a unit
 * @param {string|null} id
 * @param {number} month
 * @param {number} year
 */
export function useUnitAvailability(id, month, year) {
    return useQuery({
        queryKey: ["units", id, "availability", month, year],
        queryFn: () => unitsService.getUnitAvailability(id, month, year),
        enabled: !!id && !!month && !!year,
    });
}
