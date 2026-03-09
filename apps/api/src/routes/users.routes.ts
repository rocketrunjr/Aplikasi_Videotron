import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import * as usersService from "../services/users.service.js";
import { getPaginationParams, createPaginatedResult } from "../utils/pagination.js";
import { db } from "../db/index.js";
import { account } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

const router = Router();

// All user management routes require admin
router.use(requireAuth, requireAdmin);

// GET /api/admin/users — List all users
router.get("/", async (req, res) => {
    try {
        const { search, type, accountType, status, role } = req.query as Record<string, string>;
        const { page, limit, offset } = getPaginationParams(req.query);

        const result = await usersService.getAllUsers({
            search,
            type: type || accountType,
            status,
            role,
            limit,
            offset,
        });

        res.json(createPaginatedResult(result.data, result.total, page, limit));
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

// GET /api/admin/users/:id — Get user detail
router.get("/:id", async (req, res) => {
    try {
        const user = await usersService.getUserById(req.params.id);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ data: user });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch user" });
    }
});

// PATCH /api/admin/users/:id — Update user
router.patch("/:id", async (req, res) => {
    try {
        const user = await usersService.updateUser(req.params.id, req.body);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ data: user });
    } catch (error) {
        res.status(500).json({ error: "Failed to update user" });
    }
});

// PATCH /api/admin/users/:id/suspend — Suspend user
router.patch("/:id/suspend", async (req, res) => {
    try {
        const user = await usersService.suspendUser(req.params.id);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ data: user, message: "User suspended" });
    } catch (error) {
        res.status(500).json({ error: "Failed to suspend user" });
    }
});

// PATCH /api/admin/users/:id/activate — Activate user
router.patch("/:id/activate", async (req, res) => {
    try {
        const user = await usersService.activateUser(req.params.id);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ data: user, message: "User activated" });
    } catch (error) {
        res.status(500).json({ error: "Failed to activate user" });
    }
});

// DELETE /api/admin/users/:id — Delete user
router.delete("/:id", async (req, res) => {
    try {
        const user = await usersService.deleteUser(req.params.id);
        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }
        res.json({ data: user, message: "User deleted" });
    } catch (error) {
        res.status(500).json({ error: "Failed to delete user" });
    }
});
// PATCH /api/admin/users/:id/password — Admin reset user password
router.patch("/:id/password", async (req, res) => {
    try {
        const { password } = req.body;
        if (!password || password.length < 5) {
            res.status(400).json({ error: "Password minimal 5 karakter" });
            return;
        }

        // Use Node.js built-in crypto for password hashing (scrypt)
        const crypto = await import("crypto");
        const salt = crypto.randomBytes(16).toString("hex");
        const hash = crypto.scryptSync(password, salt, 64).toString("hex");
        const hashedPassword = `${salt}:${hash}`;

        // Update directly in the account table
        const result = await db
            .update(account)
            .set({ password: hashedPassword, updatedAt: new Date() })
            .where(
                and(
                    eq(account.userId, req.params.id),
                    eq(account.providerId, "credential")
                )
            )
            .returning();

        if (result.length === 0) {
            res.status(404).json({ error: "Akun credential tidak ditemukan untuk user ini" });
            return;
        }

        res.json({ message: "Password berhasil direset" });
    } catch (error: any) {
        console.error("Password reset error:", error);
        res.status(500).json({ error: "Gagal mereset password" });
    }
});

export default router;
