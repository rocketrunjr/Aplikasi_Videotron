import "dotenv/config";
import { auth } from "./auth/index.js";
import { db } from "./db/index.js";
import { user } from "./db/schema.js";
import { eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";

const ADMIN_EMAIL = "admin@videotron.local";
const ADMIN_PASSWORD = "Admin@2026!"; // Meets security rules

async function resetAdminPassword() {
    console.log("🌱 Resetting admin password...\n");

    try {
        const hashedPassword = await hashPassword(ADMIN_PASSWORD);
        
        // Update password in db directly
        // Note: Better Auth stores password in the account table typically, let's just delete the user and recreate
        console.log("Deleting existing admin user...");
        await db.delete(user).where(eq(user.email, ADMIN_EMAIL));
        
        console.log("Creating fresh admin user...");
        const res = await auth.api.signUpEmail({
            body: {
                name: "Administrator",
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
            },
        });

        // Ensure role is admin
        await db
            .update(user)
            .set({ role: "admin" })
            .where(eq(user.email, ADMIN_EMAIL));

        console.log("✅ Admin user reset successfully.");
        console.log("Email:", ADMIN_EMAIL);
        console.log("Password:", ADMIN_PASSWORD);
        
    } catch (error: any) {
        console.error("❌ Error:", error.message || error);
    }

    process.exit(0);
}

resetAdminPassword();
