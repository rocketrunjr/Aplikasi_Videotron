import { db } from "../db/index.js";
import {
    orders,
    orderDates,
    broadcastProofs,
    videotronUnits,
    user,
} from "../db/schema.js";
import { eq, and, ilike, or, sql, count, desc } from "drizzle-orm";
import { generateOrderNumber } from "../utils/generate-order-number.js";

// ─── User-facing ─────────────────────────────────────────────────────────────

export async function createOrder(data: {
    userId: string;
    unitId: string;
    dates: string[]; // ISO date strings
    materialFileUrl?: string;
    materialDriveLink?: string;
    paymentProofUrl?: string;
    voucherCode?: string;
}) {
    // Get unit to calculate pricing
    const [unit] = await db
        .select()
        .from(videotronUnits)
        .where(eq(videotronUnits.id, data.unitId))
        .limit(1);

    if (!unit) throw new Error("Videotron unit not found");
    if (!unit.isActive) throw new Error("Videotron unit is not available");

    const subtotal = data.dates.length * unit.pricePerDay;
    const orderNumber = generateOrderNumber();

    // Determine initial status
    const initialStatus = data.paymentProofUrl ? "menunggu_verifikasi" : "pending";

    // Calculate voucher discount if applicable
    let discountAmount = 0;
    if (data.voucherCode) {
        const { vouchers } = await import("../db/schema.js");
        const [voucher] = await db
            .select()
            .from(vouchers)
            .where(eq(vouchers.code, data.voucherCode.toUpperCase()))
            .limit(1);
        if (voucher && voucher.isActive) {
            if (voucher.discountType === "percentage") {
                discountAmount = Math.round((subtotal * voucher.discountAmount) / 100);
            } else {
                discountAmount = voucher.discountAmount;
            }
            // Cap discount at subtotal so total doesn't go negative
            if (discountAmount > subtotal) discountAmount = subtotal;
        }
    }
    const totalAmount = subtotal - discountAmount;

    // Create order + order_dates in a transaction
    const result = await db.transaction(async (tx) => {
        const [order] = await tx
            .insert(orders)
            .values({
                orderNumber,
                userId: data.userId,
                unitId: data.unitId,
                status: initialStatus,
                materialFileUrl: data.materialFileUrl || null,
                materialDriveLink: data.materialDriveLink || null,
                paymentProofUrl: data.paymentProofUrl || null,
                voucherCode: data.voucherCode || null,
                discountAmount,
                subtotal,
                totalAmount,
            })
            .returning();

        // Insert individual dates
        const dateValues = data.dates.map((date) => ({
            orderId: order.id,
            date,
            price: unit.pricePerDay,
        }));

        await tx.insert(orderDates).values(dateValues);

        // Increment voucher usage if a voucher was used
        if (data.voucherCode) {
            const { vouchers } = await import("../db/schema.js");
            await tx
                .update(vouchers)
                .set({
                    usedCount: sql`${vouchers.usedCount} + 1`,
                    updatedAt: new Date(),
                })
                .where(eq(vouchers.code, data.voucherCode.toUpperCase()));
        }

        return order;
    });

    return result;
}

export async function getUserOrders(
    userId: string,
    filters?: {
        status?: string;
        search?: string;
        limit?: number;
        offset?: number;
    }
) {
    const conditions = [eq(orders.userId, userId)];

    if (filters?.status && filters.status !== "Semua") {
        // Map frontend status to DB status
        const statusMap: Record<string, string[]> = {
            Verifikasi: ["pending", "menunggu_verifikasi"],
            Dibayar: ["sudah_bayar"],
            Tayang: ["tayang"],
            Selesai: ["selesai"],
        };
        const dbStatuses = statusMap[filters.status];
        if (dbStatuses) {
            conditions.push(
                sql`${orders.status} IN (${sql.join(
                    dbStatuses.map((s) => sql`${s}`),
                    sql`, `
                )})`
            );
        }
    }

    if (filters?.search) {
        conditions.push(
            or(
                ilike(orders.orderNumber, `%${filters.search}%`),
                sql`EXISTS (
          SELECT 1 FROM ${videotronUnits}
          WHERE ${videotronUnits.id} = ${orders.unitId}
          AND (${ilike(videotronUnits.name, `%${filters.search}%`)}
            OR ${ilike(videotronUnits.location, `%${filters.search}%`)})
        )`
            )!
        );
    }

    const whereClause = and(...conditions);

    const [data, totalResult] = await Promise.all([
        db
            .select({
                order: orders,
                unit: {
                    id: videotronUnits.id,
                    name: videotronUnits.name,
                    location: videotronUnits.location,
                    imageUrl: videotronUnits.imageUrl,
                    type: videotronUnits.type,
                },
            })
            .from(orders)
            .leftJoin(videotronUnits, eq(orders.unitId, videotronUnits.id))
            .where(whereClause)
            .orderBy(desc(orders.createdAt))
            .limit(filters?.limit || 10)
            .offset(filters?.offset || 0),
        db.select({ count: count() }).from(orders).where(whereClause),
    ]);

    return { data, total: totalResult[0]?.count || 0 };
}

export async function getOrderDetail(orderId: string, userId?: string) {
    const conditions = [eq(orders.id, orderId)];
    if (userId) {
        conditions.push(eq(orders.userId, userId));
    }

    const [order] = await db
        .select({
            order: orders,
            unit: videotronUnits,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                company: user.company,
                accountType: user.accountType,
            },
        })
        .from(orders)
        .leftJoin(videotronUnits, eq(orders.unitId, videotronUnits.id))
        .leftJoin(user, eq(orders.userId, user.id))
        .where(and(...conditions))
        .limit(1);

    if (!order) return null;

    // Get dates and proofs
    const [dates, proofs] = await Promise.all([
        db
            .select()
            .from(orderDates)
            .where(eq(orderDates.orderId, orderId))
            .orderBy(orderDates.date),
        db
            .select()
            .from(broadcastProofs)
            .where(eq(broadcastProofs.orderId, orderId))
            .orderBy(broadcastProofs.date, broadcastProofs.uploadedAt),
    ]);

    return { ...order, dates, proofs };
}

export async function uploadPaymentProof(
    orderId: string,
    userId: string,
    fileUrl: string
) {
    const [updated] = await db
        .update(orders)
        .set({
            paymentProofUrl: fileUrl,
            status: "menunggu_verifikasi",
            updatedAt: new Date(),
        })
        .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
        .returning();
    return updated;
}

export async function applyVoucher(orderId: string, code: string) {
    // Placeholder: in a real app, validate the voucher code against a vouchers table
    // For now, just store the code
    const [updated] = await db
        .update(orders)
        .set({ voucherCode: code, updatedAt: new Date() })
        .where(eq(orders.id, orderId))
        .returning();
    return updated;
}

// ─── Admin-facing ────────────────────────────────────────────────────────────

export async function getAllOrders(filters?: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
}) {
    const conditions = [];

    if (filters?.status) {
        conditions.push(eq(orders.status, filters.status));
    }

    if (filters?.search) {
        conditions.push(
            or(
                ilike(orders.orderNumber, `%${filters.search}%`),
                sql`EXISTS (
          SELECT 1 FROM ${user}
          WHERE ${user.id} = ${orders.userId}
          AND ${ilike(user.name, `%${filters.search}%`)}
        )`
            )!
        );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, totalResult] = await Promise.all([
        db
            .select({
                order: orders,
                unit: {
                    id: videotronUnits.id,
                    name: videotronUnits.name,
                    location: videotronUnits.location,
                    imageUrl: videotronUnits.imageUrl,
                },
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    phone: user.phone,
                },
            })
            .from(orders)
            .leftJoin(videotronUnits, eq(orders.unitId, videotronUnits.id))
            .leftJoin(user, eq(orders.userId, user.id))
            .where(whereClause)
            .orderBy(desc(orders.createdAt))
            .limit(filters?.limit || 10)
            .offset(filters?.offset || 0),
        db.select({ count: count() }).from(orders).where(whereClause),
    ]);

    return { data, total: totalResult[0]?.count || 0 };
}

export async function verifyPayment(orderId: string, adminNotes?: string) {
    const [updated] = await db
        .update(orders)
        .set({
            status: "sudah_bayar",
            adminNotes: adminNotes || null,
            updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning();
    return updated;
}

export async function rejectPayment(orderId: string, adminNotes: string) {
    const [updated] = await db
        .update(orders)
        .set({
            status: "ditolak",
            adminNotes,
            updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId))
        .returning();
    return updated;
}

export async function updateOrderStatus(orderId: string, status: string) {
    const [updated] = await db
        .update(orders)
        .set({ status, updatedAt: new Date() })
        .where(eq(orders.id, orderId))
        .returning();
    return updated;
}

export async function uploadInvoice(orderId: string, fileUrl: string) {
    const [updated] = await db
        .update(orders)
        .set({ invoiceFileUrl: fileUrl, updatedAt: new Date() })
        .where(eq(orders.id, orderId))
        .returning();
    return updated;
}

export async function uploadBroadcastProof(data: {
    orderId: string;
    date: string;
    timeOfDay: string;
    imageUrl: string;
}) {
    const [proof] = await db.insert(broadcastProofs).values(data).returning();
    return proof;
}

export async function deleteOrder(id: string) {
    // Delete related data first
    await db.delete(broadcastProofs).where(eq(broadcastProofs.orderId, id));
    await db.delete(orderDates).where(eq(orderDates.orderId, id));
    const [deleted] = await db.delete(orders).where(eq(orders.id, id)).returning();
    return deleted;
}
