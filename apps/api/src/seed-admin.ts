import "dotenv/config";
import { auth } from "./auth/index.js";
import { db } from "./db/index.js";
import { user } from "./db/schema.js";
import { eq } from "drizzle-orm";

const ADMIN_EMAIL = "admin@videotron.local";
const ADMIN_PASSWORD = "admin";
const ADMIN_NAME = "Administrator";

async function seedAdmin() {
    console.log("🌱 Seeding admin user...\n");

    try {
        // Check if admin already exists
        const existing = await db
            .select()
            .from(user)
            .where(eq(user.email, ADMIN_EMAIL))
            .limit(1);

        if (existing.length > 0) {
            console.log("ℹ️  Admin user already exists.");
            // Ensure role is admin
            if (existing[0].role !== "admin") {
                await db
                    .update(user)
                    .set({ role: "admin" })
                    .where(eq(user.email, ADMIN_EMAIL));
                console.log("✅ Updated role to admin.");
            } else {
                console.log("✅ Role is already admin.");
            }
        } else {
            // Use Better Auth's internal API to create user
            const res = await auth.api.signUpEmail({
                body: {
                    name: ADMIN_NAME,
                    email: ADMIN_EMAIL,
                    password: ADMIN_PASSWORD,
                },
            });

            console.log("✅ Admin user registered via Better Auth.");

            // Update role to admin
            await db
                .update(user)
                .set({ role: "admin" })
                .where(eq(user.email, ADMIN_EMAIL));

            console.log("✅ Role updated to admin.");
        }

        console.log("\n┌──────────────────────────────────────┐");
        console.log("│        Admin Credentials             │");
        console.log("├──────────────────────────────────────┤");
        console.log("│  Email:    admin@videotron.local      │");
        console.log("│  Password: admin                      │");
        console.log("│  Role:     admin                      │");
        console.log("└──────────────────────────────────────┘");
    } catch (error: any) {
        console.error("❌ Error:", error.message || error);
    }

    process.exit(0);
}

seedAdmin();
