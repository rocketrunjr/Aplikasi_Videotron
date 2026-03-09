import { db } from "../db/index.js";
import { bankSettings } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function getActiveBankSettings() {
    return db
        .select()
        .from(bankSettings)
        .where(eq(bankSettings.isActive, true))
        .orderBy(bankSettings.bankName);
}

export async function getAllBankSettings() {
    return db.select().from(bankSettings).orderBy(bankSettings.bankName);
}

export async function createBankSetting(data: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
}) {
    const [setting] = await db.insert(bankSettings).values(data).returning();
    return setting;
}

export async function updateBankSetting(
    id: string,
    data: Partial<{
        bankName: string;
        accountNumber: string;
        accountHolder: string;
        isActive: boolean;
    }>
) {
    const [updated] = await db
        .update(bankSettings)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(bankSettings.id, id))
        .returning();
    return updated;
}

export async function deleteBankSetting(id: string) {
    const [deleted] = await db
        .delete(bankSettings)
        .where(eq(bankSettings.id, id))
        .returning();
    return deleted;
}
