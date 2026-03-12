import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSession, signIn, signUp, signOut } from "../lib/auth-client";

/**
 * Auth hook — provides session state and auth mutations.
 */
export function useAuth() {
    const session = useSession();

    return {
        session: session.data,
        user: session.data?.user ?? null,
        isPending: session.isPending,
        error: session.error,
    };
}

/**
 * Email sign-in mutation
 */
export function useSignIn() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ email, password, rememberMe, captchaToken }) =>
            signIn.email({ email, password, rememberMe }, {
                headers: {
                    "x-captcha-token": captchaToken,
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["session"] });
        },
    });
}

/**
 * Email sign-up mutation
 */
export function useSignUp() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ email, password, name, phone, company, address, accountType, captchaToken }) =>
            signUp.email({
                email,
                password,
                name,
                phone,
                company,
                address,
                accountType,
            }, {
                headers: {
                    "x-captcha-token": captchaToken,
                },
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["session"] });
        },
    });
}

/**
 * Sign-out mutation
 */
export function useSignOut() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => signOut(),
        onSuccess: () => {
            queryClient.clear();
        },
    });
}

/**
 * Google OAuth sign-in (redirects to Google)
 */
export function useGoogleSignIn() {
    return useMutation({
        mutationFn: () =>
            signIn.social({
                provider: "google",
                callbackURL: window.location.origin + "/user/dashboard",
            }),
    });
}
