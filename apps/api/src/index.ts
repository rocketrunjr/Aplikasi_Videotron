import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth/index.js";

// Route imports
import unitsRoutes from "./routes/units.routes.js";
import ordersRoutes from "./routes/orders.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import usersRoutes from "./routes/users.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import uploadsRoutes from "./routes/uploads.routes.js";
import reportsRoutes from "./routes/reports.routes.js";
import vouchersRoutes from "./routes/vouchers.routes.js";
import petugasRoutes from "./routes/petugas.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        credentials: true,
    })
);
// Apply body parsers strictly to non-auth routes
// Better Auth's toNodeHandler needs the raw stream and will fail if the body is already parsed by express.json()
app.use((req, res, next) => {
    if (req.path.startsWith("/api/auth")) return next();
    express.json()(req, res, next);
});
app.use((req, res, next) => {
    if (req.path.startsWith("/api/auth")) return next();
    express.urlencoded({ extended: true })(req, res, next);
});

// Serve uploaded files statically
// Serve uploaded files statically
const isVercel = process.env.VERCEL === "1";
const uploadDir = process.env.UPLOAD_DIR || (isVercel ? "/tmp/uploads" : "./uploads");

// Ensure upload directories exist
const uploadSubDirs = [
    "material",
    "payment-proof",
    "broadcast-proof",
    "invoice",
    "avatar",
    "unit-image",
    "misc",
];
for (const dir of uploadSubDirs) {
    const fullPath = path.join(uploadDir, dir);
    if (!fs.existsSync(fullPath)) {
        try {
            fs.mkdirSync(fullPath, { recursive: true });
        } catch (err) {
            console.warn(`[WARNING] Could not create upload dir ${fullPath} (expected in read-only Vercel environment)`);
        }
    }
}
app.use("/uploads", express.static(uploadDir));

// ─── Routes ──────────────────────────────────────────────────────────────────

// Auth (Better Auth handles all /api/auth/* routes)
// Add Captcha verification middleware for sign-in and sign-up
app.use("/api/auth/sign-in/email", async (req, res, next) => {
    console.log("[LOGIN] Sign-in attempt received", req.body);
    const token = req.headers["x-captcha-token"] || req.body?.captchaToken;
    console.log("[LOGIN] Captcha token received:", token ? "Yes" : "No");
    
    if (!token) return res.status(400).json({ message: "Captcha token is required" });
    try {
        console.log(`[LOGIN] Sending token to Cloudflare: ${String(token).substring(0, 15)}...`);
        const formData = new URLSearchParams();
        formData.append("secret", process.env.TURNSTILE_SECRET_KEY || "");
        formData.append("response", token as string);
        const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            body: formData,
            method: "POST",
        });
        const outcome = await result.json();
        console.log("[LOGIN] Cloudflare Turnstile response:", JSON.stringify(outcome));
        if (!outcome.success) {
            return res.status(400).json({ message: "Verifikasi Captcha gagal. Coba lagi." });
        }
        next();
    } catch (error) {
        console.error("[LOGIN] Captcha error:", error);
        return res.status(500).json({ message: "Captcha verification failed" });
    }
});

app.use("/api/auth/sign-up/email", async (req, res, next) => {
    console.log("[REGISTER] Sign-up attempt received");
    const token = req.headers["x-captcha-token"] || req.body?.captchaToken;
    console.log("[REGISTER] Captcha token received:", token ? "Yes" : "No");
    if (!token) return res.status(400).json({ message: "Captcha token is required" });
    try {
        const formData = new URLSearchParams();
        formData.append("secret", process.env.TURNSTILE_SECRET_KEY || "");
        formData.append("response", token as string);
        const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            body: formData,
            method: "POST",
        });
        const outcome = await result.json();
        console.log("[REGISTER] Captcha verification outcome:", outcome);
        if (!outcome.success) {
            return res.status(400).json({ message: "Invalid captcha token" });
        }
        next();
    } catch (error) {
        return res.status(500).json({ message: "Captcha verification failed" });
    }
});

// Mount directly on app.all so toNodeHandler receives the full URL path
app.all("/api/auth/*", toNodeHandler(auth));

// Public routes
app.use("/api/units", unitsRoutes);
app.use("/api/settings", settingsRoutes);

// User routes (authenticated)
app.use("/api/orders", ordersRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/uploads", uploadsRoutes); // /api/uploads/:type
app.use("/api", uploadsRoutes); // /api/profile (profile routes also in this router)

// Admin routes
app.use("/api/admin", adminRoutes);
app.use("/api/admin/users", usersRoutes);
app.use("/api/admin/reports", reportsRoutes);
app.use("/api/vouchers", vouchersRoutes);

// Petugas routes
app.use("/api/petugas", petugasRoutes);

// ─── Health check ────────────────────────────────────────────────────────────

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

// ─── Error handling ──────────────────────────────────────────────────────────

app.use(
    (
        err: any,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
    ) => {
        console.error("Unhandled error:", err);

        // Multer errors
        if (err.code === "LIMIT_FILE_SIZE") {
            res.status(413).json({ error: "File too large" });
            return;
        }

        res.status(err.status || 500).json({
            error: err.message || "Internal server error",
        });
    }
);

// ─── Start server ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
    console.log(`🚀 Videotron API server running on http://localhost:${PORT}`);
    console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
});

export default app;
