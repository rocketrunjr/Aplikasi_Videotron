import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as settingsService from "../services/settings.service";

/**
 * Fetch active bank settings (public, for checkout)
 */
export function useActiveBankSettings() {
    return useQuery({
        queryKey: ["settings", "bank"],
        queryFn: () => settingsService.getActiveBankSettings(),
    });
}

/**
 * Fetch all bank settings (admin)
 */
export function useAllBankSettings() {
    return useQuery({
        queryKey: ["settings", "admin", "bank"],
        queryFn: () => settingsService.getAllBankSettings(),
    });
}

/**
 * Create a new bank setting
 */
export function useCreateBankSetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => settingsService.createBankSetting(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
    });
}

/**
 * Update a bank setting
 */
export function useUpdateBankSetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }) => settingsService.updateBankSetting(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
    });
}

/**
 * Delete a bank setting
 */
export function useDeleteBankSetting() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => settingsService.deleteBankSetting(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
        },
    });
}
