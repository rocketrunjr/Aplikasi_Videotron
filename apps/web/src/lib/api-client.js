/**
 * Lightweight fetch wrapper for calling the backend API.
 * All requests include credentials (cookies) for auth.
 */

const BASE_URL = "";

async function request(endpoint, options = {}) {
    const { body, ...rest } = options;

    const headers = { ...rest.headers };

    // Don't set Content-Type for FormData (browser sets boundary automatically)
    if (body && !(body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...rest,
        headers,
        credentials: "include",
        body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `Request failed (${response.status})`);
        error.status = response.status;
        error.data = errorData;
        throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) return null;

    return response.json();
}

export const apiClient = {
    get: (endpoint, params) => {
        const url = params
            ? `${endpoint}?${new URLSearchParams(
                Object.fromEntries(
                    Object.entries(params).filter(([, v]) => v != null && v !== "")
                )
            ).toString()}`
            : endpoint;
        return request(url, { method: "GET" });
    },

    post: (endpoint, body) =>
        request(endpoint, { method: "POST", body }),

    put: (endpoint, body) =>
        request(endpoint, { method: "PUT", body }),

    patch: (endpoint, body) =>
        request(endpoint, { method: "PATCH", body }),

    delete: (endpoint) =>
        request(endpoint, { method: "DELETE" }),
};
