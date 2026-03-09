import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as ordersService from "../services/orders.service";

/**
 * Fetch current user's orders (paginated)
 * @param {{ status?: string, search?: string, page?: number, limit?: number }} [filters]
 */
export function useUserOrders(filters = {}) {
    return useQuery({
        queryKey: ["orders", filters],
        queryFn: () => ordersService.getUserOrders(filters),
    });
}

/**
 * Fetch a single order detail
 * @param {string|null} id
 */
export function useOrderDetail(id) {
    return useQuery({
        queryKey: ["orders", id],
        queryFn: () => ordersService.getOrderDetail(id),
        enabled: !!id,
    });
}

/**
 * Create a new order
 */
export function useCreateOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => ordersService.createOrder(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
            queryClient.invalidateQueries({ queryKey: ["dashboard"] });
        },
    });
}

/**
 * Upload payment proof for an order
 */
export function useUploadPaymentProof() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, fileUrl }) => ordersService.uploadPaymentProof(id, fileUrl),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });
}

/**
 * Apply a voucher code to an order
 */
export function useApplyVoucher() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, code }) => ordersService.applyVoucher(id, code),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["orders", variables.id] });
        },
    });
}
