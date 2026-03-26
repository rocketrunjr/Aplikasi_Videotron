import { Router } from "express";
import multer from "multer";
import path from "path";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import * as usersService from "../services/users.service.js";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Determine subdirectory based on upload type
        const type = (req.params.type as string) || "misc";
        const dest = path.join(UPLOAD_DIR, type);
        cb(null, dest);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    },
});

// File filter
const fileFilter = (
    req: any,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    const allowedMimes = [
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/gif",
        "video/mp4",
        "video/avi",
        "video/quicktime",
        "application/pdf",
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE || "52428800"), // 50MB default
    },
});

const router = Router();

// Helper to build the file URL
function getFileUrl(req: any, file: Express.Multer.File): string {
    const relativePath = file.path.replace(/\\/g, "/");
    return `${req.protocol}://${req.get("host")}/${relativePath}`;
}

// POST /api/uploads/:type — Generic upload endpoint
// Types: material, payment-proof, broadcast-proof, invoice, avatar, unit-image
router.post("/:type", requireAuth, (req, res, next) => {
    // Check admin-only upload types
    const adminOnlyTypes = ["broadcast-proof", "invoice", "unit-image"];
    if (adminOnlyTypes.includes(req.params.type as string) && req.user?.role !== "admin" && req.user?.role !== "petugas") {
        res.status(403).json({ error: "Admin access required for this upload type" });
        return;
    }
    next();
}, upload.single("file"), async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: "No file uploaded" });
            return;
        }

        const fileUrl = getFileUrl(req, req.file);

        res.status(201).json({
            data: {
                url: fileUrl,
                filename: req.file.filename,
                originalName: req.file.originalname,
                mimetype: req.file.mimetype,
                size: req.file.size,
            },
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message || "Upload failed" });
    }
});

// ─── Profile Routes (mounted here for convenience) ───────────────────────────

// GET /api/profile — Get current user profile
router.get("/profile", requireAuth, async (req, res) => {
    try {
        const profile = await usersService.getUserById(req.user!.id);
        if (!profile) {
            res.status(404).json({ error: "Profile not found" });
            return;
        }
        res.json({ data: profile });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// PATCH /api/profile — Update profile
router.patch("/profile", requireAuth, async (req, res) => {
    try {
        const { name, phone, company, address } = req.body;
        const updated = await usersService.updateUser(req.user!.id, {
            name,
            phone,
            company,
            address,
        });
        if (!updated) {
            res.status(404).json({ error: "Profile not found" });
            return;
        }
        res.json({ data: updated });
    } catch (error) {
        res.status(500).json({ error: "Failed to update profile" });
    }
});

// ─── Multer error handler ─────────────────────────────────────────────────────
router.use((err: any, req: any, res: any, next: any) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(413).json({ error: 'File terlalu besar. Maksimum 50MB.' });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }
    if (err && err.message && err.message.includes('Unsupported file type')) {
        return res.status(400).json({ error: err.message });
    }
    next(err);
});

export default router;
