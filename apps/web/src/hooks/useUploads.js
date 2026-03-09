import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as uploadsService from "../services/uploads.service";

/**
 * Upload a file mutation
 * Usage: uploadFile.mutate({ type: "material", file: fileObj })
 */
export function useUploadFile() {
    return useMutation({
        mutationFn: ({ type, file }) => uploadsService.uploadFile(type, file),
    });
}

/**
 * Fetch current user's profile
 */
export function useProfile() {
    return useQuery({
        queryKey: ["profile"],
        queryFn: () => uploadsService.getProfile(),
    });
}

/**
 * Update current user's profile
 */
export function useUpdateProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data) => uploadsService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["profile"] });
            queryClient.invalidateQueries({ queryKey: ["session"] });
        },
    });
}
