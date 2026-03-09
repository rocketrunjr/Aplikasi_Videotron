import { db } from "../db/index.js";
import { vouchers } from "../db/schema.js";
import { eq, and, ilike, or, sql, count, desc } from "drizzle-orm";

export async function getAllVouchers(filters?: {
    search?: string;
    status?: string;
    limit?: number;
    offset?: number;
}) {
    const conditions: any[] = [];

    if (filters?.search) {
        conditions.push(ilike(vouchers.code, `%${filters.search}%`));
    }
    if (filters?.status === "active") {
        conditions.push(eq(vouchers.isActive, true));
    } else if (filters?.status === "inactive") {
        conditions.push(eq(vouchers.isActive, false));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, totalResult] = await Promise.all([
        db
            .select()
            .from(vouchers)
            .where(whereClause)
            .orderBy(desc(vouchers.createdAt))
            .limit(filters?.limit || 50)
            .offset(filters?.offset || 0),
        db.select({ count: count() }).from(vouchers).where(whereClause),
    ]);

    return { data, total: totalResult[0]?.count || 0 };
}

export async function createVoucher(data: {
    code: string;
    discountAmount: number;
    discountType: string;
    usageLimit?: number;
    validFrom?: string;
    validUntil?: string;
}) {
    const [voucher] = await db
        .insert(vouchers)
        .values({
            code: data.code.toUpperCase(),
            discountAmount: data.discountAmount,
            discountType: data.discountType,
            usageLimit: data.usageLimit || 0,
            validFrom: data.validFrom ? new Date(data.validFrom) : null,
            validUntil: data.validUntil ? new Date(data.validUntil) : null,
        })
        .returning();
    return voucher;
}

export async function toggleVoucherStatus(id: string) {
    const [existing] = await db
        .select()
        .from(vouchers)
        .where(eq(vouchers.id, id))
        .limit(1);
    if (!existing) return null;

    const [updated] = await db
        .update(vouchers)
        .set({ isActive: !existing.isActive, updatedAt: new Date() })
        .where(eq(vouchers.id, id))
        .returning();
    return updated;
}

export async function deleteVoucher(id: string) {
    const [deleted] = await db
        .delete(vouchers)
        .where(eq(vouchers.id, id))
        .returning();
    return deleted;
}

export async function validateVoucher(code: string, orderAmount: number) {
    const [voucher] = await db
        .select()
        .from(vouchers)
        .where(
            and(
                eq(vouchers.code, code.toUpperCase()),
                eq(vouchers.isActive, true)
            )
        )
        .limit(1);

    if (!voucher) {
        throw new Error("Kode voucher tidak ditemukan atau tidak aktif.");
    }

    // Check usage limit
    if (voucher.usageLimit > 0 && voucher.usedCount >= voucher.usageLimit) {
        throw new Error("Voucher sudah mencapai batas penggunaan.");
    }

    // Check validity dates
    const now = new Date();
    if (voucher.validFrom && now < voucher.validFrom) {
        throw new Error("Voucher belum berlaku.");
    }
    if (voucher.validUntil && now > voucher.validUntil) {
        throw new Error("Voucher sudah kedaluwarsa.");
    }

    // Calculate discount
    let discount = 0;
    if (voucher.discountType === "percentage") {
        discount = Math.floor(orderAmount * (voucher.discountAmount / 100));
    } else {
        discount = Math.min(voucher.discountAmount, orderAmount);
    }

    return {
        voucherId: voucher.id,
        code: voucher.code,
        discountType: voucher.discountType,
        discountAmount: voucher.discountAmount,
        calculatedDiscount: discount,
        finalAmount: orderAmount - discount,
    };
}

export async function incrementVoucherUsage(code: string) {
    await db
        .update(vouchers)
        .set({
            usedCount: sql`${vouchers.usedCount} + 1`,
            updatedAt: new Date(),
        })
        .where(eq(vouchers.code, code.toUpperCase()));
}
