import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as usersService from "../services/users.service";

/**
 * Fetch all users (admin, paginated)
 */
export function useAllUsers(filters = {}) {
    return useQuery({
        queryKey: ["admin", "users", filters],
        queryFn: () => usersService.getAllUsers(filters),
    });
}

/**
 * Fetch a single user by ID
 */
export function useUserById(id) {
    return useQuery({
        queryKey: ["admin", "users", id],
        queryFn: () => usersService.getUserById(id),
        enabled: !!id,
    });
}

/**
 * Update a user
 */
export function useUpdateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, ...data }) => usersService.updateUser(id, data),
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
            queryClient.invalidateQueries({ queryKey: ["admin", "users", variables.id] });
        },
    });
}

/**
 * Suspend a user
 */
export function useSuspendUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => usersService.suspendUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
    });
}

/**
 * Activate a user
 */
export function useActivateUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => usersService.activateUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
    });
}

/**
 * Delete a user
 */
export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id) => usersService.deleteUser(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
        },
    });
}

/**
 * Reset user password (admin)
 */
export function useResetUserPassword() {
    return useMutation({
        mutationFn: ({ id, password }) => usersService.resetUserPassword(id, password),
    });
}
