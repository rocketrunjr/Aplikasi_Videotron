import "dotenv/config";
import { auth } from "./auth/index.js";
import { db } from "./db/index.js";
import { user, videotronUnits, bankSettings } from "./db/schema.js";
import { eq } from "drizzle-orm";

// ─── Seed Users (10 users + ensure admin exists) ─────────────────────────────

const seedUsers = [
    { name: "Ahmad Fauzi", email: "ahmad.fauzi@gmail.com", password: "user12345", phone: "08115550001", company: "", address: "Jl. Bhayangkara No. 12, Bontang Utara", accountType: "pribadi" },
    { name: "Siti Nurhaliza", email: "siti.nurhaliza@yahoo.com", password: "user12345", phone: "08115550002", company: "", address: "Jl. MT Haryono No. 8, Bontang Selatan", accountType: "pribadi" },
    { name: "Budi Prasetyo", email: "budi.prasetyo@gmail.com", password: "user12345", phone: "08115550003", company: "PT Pupuk Kaltim", address: "Jl. Awang Long No. 1, Bontang", accountType: "perusahaan" },
    { name: "Dewi Lestari", email: "dewi.lestari@outlook.com", password: "user12345", phone: "08115550004", company: "", address: "Jl. D.I. Panjaitan No. 22, Bontang Utara", accountType: "pribadi" },
    { name: "Rizky Ramadhan", email: "rizky.ramadhan@gmail.com", password: "user12345", phone: "08115550005", company: "CV Borneo Media", address: "Jl. Kakap No. 5, Bontang Kuala", accountType: "perusahaan" },
    { name: "Nur Aisyah", email: "nur.aisyah@gmail.com", password: "user12345", phone: "08115550006", company: "", address: "Jl. Letjen S. Parman No. 3, Bontang Selatan", accountType: "pribadi" },
    { name: "Hendra Gunawan", email: "hendra.gunawan@company.co.id", password: "user12345", phone: "08115550007", company: "PT Badak NGL", address: "Jl. Mulawarman No. 15, Bontang", accountType: "perusahaan" },
    { name: "Fitri Handayani", email: "fitri.handayani@yahoo.com", password: "user12345", phone: "08115550008", company: "", address: "Jl. Ahmad Yani No. 10, Bontang Utara", accountType: "pribadi" },
    { name: "Dian Permana", email: "dian.permana@gmail.com", password: "user12345", phone: "08115550009", company: "Dian Advertising", address: "Jl. Kapten Piere Tendean No. 18, Bontang", accountType: "perusahaan" },
    { name: "Maya Sari", email: "maya.sari@gmail.com", password: "user12345", phone: "08115550010", company: "", address: "Jl. Gatot Subroto No. 7, Bontang Selatan", accountType: "pribadi" },
];

// ─── Seed Videotron Units (5 units in Bontang) ───────────────────────────────

const seedUnits = [
    {
        code: "VT-BTG-001",
        name: "Videotron Simpang Empat Bontang",
        location: "Persimpangan Jl. Ahmad Yani & Jl. Awang Long, Bontang Utara",
        city: "Bontang",
        size: "12m x 6m",
        type: "outdoor" as const,
        aspectRatio: "16:9",
        pricePerDay: 5000000,
        isActive: true,
    },
    {
        code: "VT-BTG-002",
        name: "LED Billboard Jl. Bhayangkara",
        location: "Jl. Bhayangkara No. 1, depan Kantor Polres Bontang",
        city: "Bontang",
        size: "10m x 5m",
        type: "outdoor" as const,
        aspectRatio: "16:9",
        pricePerDay: 3500000,
        isActive: true,
    },
    {
        code: "VT-BTG-003",
        name: "Videotron Taman Tugu",
        location: "Taman Tugu Equator, Jl. MT Haryono, Bontang Selatan",
        city: "Bontang",
        size: "8m x 4m",
        type: "outdoor" as const,
        aspectRatio: "16:9",
        pricePerDay: 2500000,
        isActive: true,
    },
    {
        code: "VT-BTG-004",
        name: "LED Indoor Mall Bontang City",
        location: "Bontang City Mall Lt. 1, Jl. D.I. Panjaitan, Bontang",
        city: "Bontang",
        size: "5m x 3m",
        type: "indoor" as const,
        aspectRatio: "16:9",
        pricePerDay: 1500000,
        isActive: true,
    },
    {
        code: "VT-BTG-005",
        name: "Videotron Pelabuhan Bontang Kuala",
        location: "Area Pelabuhan Bontang Kuala, Jl. Pelabuhan, Bontang",
        city: "Bontang",
        size: "14m x 7m",
        type: "outdoor" as const,
        aspectRatio: "16:9",
        pricePerDay: 4000000,
        isActive: true,
    },
];

// ─── Seed Bank Settings (2 banks) ────────────────────────────────────────────

const seedBanks = [
    {
        bankName: "Bank Kaltimtara",
        accountNumber: "0012345678901",
        accountHolder: "Dinas Kominfo Kota Bontang",
        isActive: true,
    },
    {
        bankName: "Bank Mandiri",
        accountNumber: "1370015678902",
        accountHolder: "Dinas Kominfo Kota Bontang",
        isActive: true,
    },
];

// ─── Main Seed Function ──────────────────────────────────────────────────────

async function seed() {
    console.log("🌱 Starting data seeding...\n");

    // 1. Seed users
    console.log("👤 Seeding users...");
    for (const u of seedUsers) {
        try {
            const existing = await db
                .select()
                .from(user)
                .where(eq(user.email, u.email))
                .limit(1);

            if (existing.length > 0) {
                console.log(`   ⏭️  ${u.email} — already exists`);
                continue;
            }

            await auth.api.signUpEmail({
                body: {
                    name: u.name,
                    email: u.email,
                    password: u.password,
                    phone: u.phone,
                    company: u.company || undefined,
                    address: u.address,
                    accountType: u.accountType,
                },
            });

            console.log(`   ✅ ${u.name} (${u.email})`);
        } catch (error: any) {
            console.error(`   ❌ ${u.email}: ${error.message || error}`);
        }
    }

    // 2. Seed videotron units
    console.log("\n📺 Seeding videotron units...");
    for (const unit of seedUnits) {
        try {
            const existing = await db
                .select()
                .from(videotronUnits)
                .where(eq(videotronUnits.code, unit.code))
                .limit(1);

            if (existing.length > 0) {
                console.log(`   ⏭️  ${unit.code} — already exists`);
                continue;
            }

            await db.insert(videotronUnits).values(unit);
            console.log(`   ✅ ${unit.name} (${unit.code})`);
        } catch (error: any) {
            console.error(`   ❌ ${unit.code}: ${error.message || error}`);
        }
    }

    // 3. Seed bank settings
    console.log("\n🏦 Seeding bank settings...");
    for (const bank of seedBanks) {
        try {
            const existing = await db
                .select()
                .from(bankSettings)
                .where(eq(bankSettings.accountNumber, bank.accountNumber))
                .limit(1);

            if (existing.length > 0) {
                console.log(`   ⏭️  ${bank.bankName} — already exists`);
                continue;
            }

            await db.insert(bankSettings).values(bank);
            console.log(`   ✅ ${bank.bankName} (${bank.accountNumber})`);
        } catch (error: any) {
            console.error(`   ❌ ${bank.bankName}: ${error.message || error}`);
        }
    }

    console.log("\n🎉 Seeding complete!");
    console.log("\n┌──────────────────────────────────────────────┐");
    console.log("│  Seed Data Summary                           │");
    console.log("├──────────────────────────────────────────────┤");
    console.log("│  Users:     10 user accounts (pass: user12345)│");
    console.log("│  Units:     5 videotron units (Bontang)       │");
    console.log("│  Banks:     2 bank settings                   │");
    console.log("│  Admin:     run seed-admin.ts separately      │");
    console.log("└──────────────────────────────────────────────┘");

    process.exit(0);
}

seed();
