import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as adminService from "../services/admin.service";

// ─── Admin Orders ─────────────────────────────────────────────────────────────

/**
 * Fetch all orders (admin, paginated)
 */
export function useAdminOrders(filters = {}) {
    return useQuery({
        queryKey: ["admin", "orders", filters],
        queryFn: () => adminService.getAdminOrders(filters),
    });
}

/**
 * Fetch order detail (admin view)
 */
export function useAdminOrderDetail(id) {
    return useQuery({
        queryKey: ["admin", "orders", id],
        queryFn: () => adminService.getAdminOrderDetail(id),
        enabled: !!id,
    });
}

/**
 * Verify (approve) payment
 */
export function useVerifyPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, adminNotes }) => adminService.verifyPayment(id, adminNotes),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "orders", variables.id] });
        },
    });
}

/**
 * Reject payment
 */
export function useRejectPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, adminNotes }) => adminService.rejectPayment(id, adminNotes),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "orders", variables.id] });
        },
    });
}

/**
 * Update order status
 */
export function useUpdateOrderStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }) => adminService.updateOrderStatus(id, status),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "orders", variables.id] });
        },
    });
}

/**
 * Upload invoice for an order
 */
export function useUploadInvoice() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, fileUrl }) => adminService.uploadInvoice(id, fileUrl),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "orders", variables.id] });
        },
    });
}

/**
 * Upload broadcast proof image
 */
export function useUploadBroadcastProof() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }) => adminService.uploadBroadcastProof(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "orders", variables.id] });
        },
    });
}

// ─── Admin Units ──────────────────────────────────────────────────────────────

/**
 * Fetch all units (admin, paginated)
 */
export function useAdminUnits(filters = {}) {
    return useQuery({
        queryKey: ["admin", "units", filters],
        queryFn: () => adminService.getAdminUnits(filters),
    });
}

/**
 * Create a new unit
 */
export function useCreateUnit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => adminService.createUnit(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "units"] });
            queryClient.invalidateQueries({ queryKey: ["units"] });
        },
    });
}

/**
 * Update a unit
 */
export function useUpdateUnit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }) => adminService.updateUnit(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "units"] });
            queryClient.invalidateQueries({ queryKey: ["units"] });
        },
    });
}

/**
 * Toggle unit active/inactive status
 */
export function useToggleUnitStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => adminService.toggleUnitStatus(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "units"] });
            queryClient.invalidateQueries({ queryKey: ["units"] });
        },
    });
}

/**
 * Delete a unit
 */
export function useDeleteUnit() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => adminService.deleteUnit(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "units"] });
            queryClient.invalidateQueries({ queryKey: ["units"] });
        },
    });
}

/**
 * Delete an order (admin)
 */
export function useDeleteOrder() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => adminService.deleteOrder(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
        },
    });
}
