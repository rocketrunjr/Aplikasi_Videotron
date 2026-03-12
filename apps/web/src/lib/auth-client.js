import { createAuthClient } from "better-auth/react";

const API_BASE = typeof window !== "undefined"
    ? `${window.location.origin}/api/auth`
    : "http://localhost:3000/api/auth";

export const authClient = createAuthClient({
    baseURL: API_BASE,
    fetchOptions: {
        onRequest: (context) => {
            // Check if the original fetch options contain our custom headers and append them
            // In better-fetch, custom headers passed to the hook are often merged, 
            // but if they are nested improperly we can extract them
            if (context.options?.headers?.['x-captcha-token']) {
                context.request.headers.set('x-captcha-token', context.options.headers['x-captcha-token']);
            } else if (context.options?.fetchOptions?.headers?.['x-captcha-token']) {
                context.request.headers.set('x-captcha-token', context.options.fetchOptions.headers['x-captcha-token']);
            }
        }
    }
});

export const {
    signIn,
    signUp,
    signOut,
    useSession,
    getSession,
} = authClient;
