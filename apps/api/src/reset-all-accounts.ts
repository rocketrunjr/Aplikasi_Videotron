import "dotenv/config";
import { auth } from "./auth/index.js";
import { db } from "./db/index.js";
import { user } from "./db/schema.js";
import { eq } from "drizzle-orm";

const ACCOUNTS = [
    { email: "admin@videotron.local", name: "Administrator", password: "Admin@2026!", role: "admin" },
    { email: "petugas1@videotron.local", name: "Petugas 1", password: "Petugas@2026!", role: "petugas" },
    { email: "petugas2@videotron.local", name: "Petugas 2", password: "Petugas@2026!", role: "petugas" },
];

async function resetAllAccounts() {
    console.log("🔄 Resetting all accounts...\n");

    for (const acct of ACCOUNTS) {
        try {
            // Delete existing user
            console.log(`  Deleting ${acct.email}...`);
            await db.delete(user).where(eq(user.email, acct.email));

            // Recreate via Better Auth
            console.log(`  Creating ${acct.email}...`);
            await auth.api.signUpEmail({
                body: { name: acct.name, email: acct.email, password: acct.password },
            });

            // Set correct role
            await db.update(user).set({ role: acct.role }).where(eq(user.email, acct.email));
            console.log(`  ✅ ${acct.email} (${acct.role}) reset OK\n`);
        } catch (error: any) {
            console.error(`  ❌ ${acct.email}: ${error.message || error}\n`);
        }
    }

    console.log("┌──────────────────────────────────────────┐");
    console.log("│           Account Credentials            │");
    console.log("├──────────────────────────────────────────┤");
    console.log("│  admin@videotron.local    / Admin@2026!  │");
    console.log("│  petugas1@videotron.local / Petugas@2026!│");
    console.log("│  petugas2@videotron.local / Petugas@2026!│");
    console.log("└──────────────────────────────────────────┘");

    process.exit(0);
}

resetAllAccounts();
