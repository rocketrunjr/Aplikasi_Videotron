import { Router } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "../auth/index.js";

const router = Router();

// Mount Better Auth at /api/auth/*
// Better Auth handles all auth routes internally
router.all("/*splat", toNodeHandler(auth));

export default router;
