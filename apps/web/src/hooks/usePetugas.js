import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export function useUpdatePetugasOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, status }) => {
            const res = await apiClient.patch(`/api/petugas/orders/${id}/status`, { status });
            return res.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['petugas', 'orders'] });
            queryClient.invalidateQueries({ queryKey: ['petugas', 'orders', variables.id] });
        },
    });
}

export function useUploadPetugasInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, fileUrl }) => {
            const res = await apiClient.post(`/api/petugas/orders/${id}/invoice`, { fileUrl });
            return res.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['petugas', 'orders'] });
            queryClient.invalidateQueries({ queryKey: ['petugas', 'orders', variables.id] });
        },
    });
}

export function useUploadPetugasBroadcastProof() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, date, timeOfDay, imageUrl }) => {
            const res = await apiClient.post(`/api/petugas/orders/${id}/broadcast-proof`, {
                date,
                timeOfDay,
                imageUrl,
            });
            return res.data;
        },
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['petugas', 'orders'] });
            queryClient.invalidateQueries({ queryKey: ['petugas', 'orders', variables.id] });
        },
    });
}
