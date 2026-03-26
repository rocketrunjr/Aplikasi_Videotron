import "dotenv/config";
import { auth } from "./auth/index.js";
import { db } from "./db/index.js";
import { user } from "./db/schema.js";
import { eq } from "drizzle-orm";

const PETUGAS_ACCOUNTS = [
    { email: "petugas1@videotron.local", name: "Petugas 1", password: "Petugas@2026!" },
    { email: "petugas2@videotron.local", name: "Petugas 2", password: "Petugas@2026!" },
];

async function seedPetugas() {
    console.log("🌱 Seeding petugas users...\n");

    for (const acct of PETUGAS_ACCOUNTS) {
        try {
            const existing = await db
                .select()
                .from(user)
                .where(eq(user.email, acct.email))
                .limit(1);

            if (existing.length > 0) {
                console.log(`ℹ️  ${acct.email} already exists.`);
                if (existing[0].role !== "petugas") {
                    await db.update(user).set({ role: "petugas" }).where(eq(user.email, acct.email));
                    console.log(`   ✅ Role updated to petugas.`);
                }
            } else {
                await auth.api.signUpEmail({
                    body: { name: acct.name, email: acct.email, password: acct.password },
                });
                await db.update(user).set({ role: "petugas" }).where(eq(user.email, acct.email));
                console.log(`✅ ${acct.email} created with role petugas.`);
            }
        } catch (error: any) {
            console.error(`❌ Error for ${acct.email}:`, error.message || error);
        }
    }

    console.log("\n┌──────────────────────────────────────────┐");
    console.log("│          Petugas Credentials             │");
    console.log("├──────────────────────────────────────────┤");
    console.log("│  Email:    petugas1@videotron.local       │");
    console.log("│  Password: Petugas@2026!                  │");
    console.log("│  Email:    petugas2@videotron.local       │");
    console.log("│  Password: Petugas@2026!                  │");
    console.log("└──────────────────────────────────────────┘");

    process.exit(0);
}

seedPetugas();
