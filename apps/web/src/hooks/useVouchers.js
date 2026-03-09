import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as vouchersService from "../services/vouchers.service";

export function useAllVouchers(filters = {}) {
    return useQuery({
        queryKey: ["admin", "vouchers", filters],
        queryFn: () => vouchersService.getAllVouchers(filters),
    });
}

export function useCreateVoucher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data) => vouchersService.createVoucher(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
        },
    });
}

export function useToggleVoucher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => vouchersService.toggleVoucher(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
        },
    });
}

export function useDeleteVoucher() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id) => vouchersService.deleteVoucher(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "vouchers"] });
        },
    });
}

export function useValidateVoucher() {
    return useMutation({
        mutationFn: ({ code, orderAmount }) => vouchersService.validateVoucher(code, orderAmount),
    });
}
