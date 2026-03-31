import { db } from "../db/index.js";
import { user } from "../db/schema.js";
import { eq, and, ilike, or, count } from "drizzle-orm";

export async function getAllUsers(filters?: {
    search?: string;
    type?: string;
    status?: string;
    role?: string;
    limit?: number;
    offset?: number;
}) {
    const conditions = [];

    if (filters?.search) {
        conditions.push(
            or(
                ilike(user.name, `%${filters.search}%`),
                ilike(user.email, `%${filters.search}%`),
                ilike(user.phone || "", `%${filters.search}%`)
            )!
        );
    }
    if (filters?.type) {
        conditions.push(eq(user.accountType, filters.type));
    }
    if (filters?.status) {
        conditions.push(eq(user.status, filters.status));
    }
    if (filters?.role) {
        conditions.push(eq(user.role, filters.role));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, totalResult] = await Promise.all([
        db
            .select({
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                telegramChatId: user.telegramChatId,
                company: user.company,
                accountType: user.accountType,
                role: user.role,
                status: user.status,
                image: user.image,
                createdAt: user.createdAt,
            })
            .from(user)
            .where(whereClause)
            .orderBy(user.createdAt)
            .limit(filters?.limit || 10)
            .offset(filters?.offset || 0),
        db.select({ count: count() }).from(user).where(whereClause),
    ]);

    return { data, total: totalResult[0]?.count || 0 };
}

export async function getUserById(id: string) {
    const [result] = await db
        .select()
        .from(user)
        .where(eq(user.id, id))
        .limit(1);
    return result || null;
}

export async function updateUser(
    id: string,
    data: Partial<{
        name: string;
        phone: string;
        telegramChatId: string;
        company: string;
        address: string;
        accountType: string;
        role: string;
        status: string;
    }>
) {
    const [updated] = await db
        .update(user)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(user.id, id))
        .returning();
    return updated;
}

export async function suspendUser(id: string) {
    return updateUser(id, { status: "suspended" });
}

export async function activateUser(id: string) {
    return updateUser(id, { status: "active" });
}

export async function deleteUser(id: string) {
    const [deleted] = await db
        .delete(user)
        .where(eq(user.id, id))
        .returning();
    return deleted;
}
