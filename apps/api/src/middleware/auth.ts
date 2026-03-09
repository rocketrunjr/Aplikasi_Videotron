import type { Request, Response, NextFunction } from "express";
import { auth } from "../auth/index.js";
import { fromNodeHeaders } from "better-auth/node";

// Extend Express Request to include user info
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                name: string;
                email: string;
                image?: string | null;
                phone?: string | null;
                company?: string | null;
                address?: string | null;
                accountType: string;
                role: string;
                status: string;
            };
            session?: {
                id: string;
                userId: string;
                token: string;
                expiresAt: Date;
            };
        }
    }
}

/**
 * Middleware that requires a valid session.
 * Attaches `req.user` and `req.session` on success.
 * Returns 401 if not authenticated.
 */
export async function requireAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const sessionData = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!sessionData || !sessionData.user) {
            res.status(401).json({ error: "Unauthorized — please log in" });
            return;
        }

        // Check if user is suspended
        const userData = sessionData.user as any;
        if (userData.status === "suspended") {
            res.status(403).json({ error: "Account suspended" });
            return;
        }

        req.user = userData;
        req.session = sessionData.session as any;
        next();
    } catch (error) {
        res.status(401).json({ error: "Unauthorized — invalid session" });
    }
}

/**
 * Middleware that requires admin role.
 * Must be used AFTER `requireAuth`.
 */
export async function requireAdmin(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    if (req.user.role !== "admin") {
        res.status(403).json({ error: "Forbidden — admin access required" });
        return;
    }

    next();
}
