import { db } from "../db/index.js";
import { videotronUnits, orders, orderDates } from "../db/schema.js";
import { eq, and, ilike, or, sql, count } from "drizzle-orm";

// ─── Public ──────────────────────────────────────────────────────────────────

export async function getActiveUnits(filters?: {
    search?: string;
    city?: string;
    type?: string;
}) {
    const conditions = [eq(videotronUnits.isActive, true)];

    if (filters?.search) {
        conditions.push(
            or(
                ilike(videotronUnits.name, `%${filters.search}%`),
                ilike(videotronUnits.location, `%${filters.search}%`)
            )!
        );
    }
    if (filters?.city) {
        conditions.push(ilike(videotronUnits.city, `%${filters.city}%`));
    }
    if (filters?.type) {
        conditions.push(eq(videotronUnits.type, filters.type));
    }

    return db
        .select()
        .from(videotronUnits)
        .where(and(...conditions))
        .orderBy(videotronUnits.name);
}

export async function getUnitById(id: string) {
    const [unit] = await db
        .select()
        .from(videotronUnits)
        .where(eq(videotronUnits.id, id))
        .limit(1);
    return unit || null;
}

export async function getUnitAvailability(
    unitId: string,
    month: number,
    year: number
) {
    // Get the unit to know maxSlotsPerDay
    const [unit] = await db
        .select({ maxSlotsPerDay: videotronUnits.maxSlotsPerDay })
        .from(videotronUnits)
        .where(eq(videotronUnits.id, unitId))
        .limit(1);

    const maxSlots = unit?.maxSlotsPerDay || 1;

    // Get all dates that are already booked for this unit in the given month
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate =
        month === 12
            ? `${year + 1}-01-01`
            : `${year}-${String(month + 1).padStart(2, "0")}-01`;

    const bookedDates = await db
        .select({ date: orderDates.date, count: count() })
        .from(orderDates)
        .innerJoin(orders, eq(orderDates.orderId, orders.id))
        .where(
            and(
                eq(orders.unitId, unitId),
                sql`${orderDates.date} >= ${startDate}`,
                sql`${orderDates.date} < ${endDate}`,
                // Only count orders that are not cancelled or rejected
                sql`${orders.status} NOT IN ('dibatalkan', 'ditolak')`
            )
        )
        .groupBy(orderDates.date);

    return {
        maxSlots,
        dates: bookedDates.map((d) => ({
            date: d.date,
            bookedCount: Number(d.count),
            isFullyBooked: Number(d.count) >= maxSlots,
        })),
    };
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export async function getAllUnits(filters?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
    offset?: number;
}) {
    const conditions = [];

    if (filters?.search) {
        conditions.push(
            or(
                ilike(videotronUnits.name, `%${filters.search}%`),
                ilike(videotronUnits.location, `%${filters.search}%`),
                ilike(videotronUnits.code, `%${filters.search}%`)
            )!
        );
    }
    if (filters?.status === "active") {
        conditions.push(eq(videotronUnits.isActive, true));
    } else if (filters?.status === "inactive") {
        conditions.push(eq(videotronUnits.isActive, false));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, totalResult] = await Promise.all([
        db
            .select()
            .from(videotronUnits)
            .where(whereClause)
            .orderBy(videotronUnits.createdAt)
            .limit(filters?.limit || 10)
            .offset(filters?.offset || 0),
        db.select({ count: count() }).from(videotronUnits).where(whereClause),
    ]);

    return { data, total: totalResult[0]?.count || 0 };
}

export async function createUnit(data: {
    code: string;
    name: string;
    location: string;
    city: string;
    size: string;
    type: string;
    aspectRatio: string;
    pricePerDay: number;
    maxSlotsPerDay?: number;
    imageUrl?: string;
}) {
    const [unit] = await db.insert(videotronUnits).values({
        ...data,
        maxSlotsPerDay: data.maxSlotsPerDay || 1,
    }).returning();
    return unit;
}

export async function updateUnit(
    id: string,
    data: Partial<{
        code: string;
        name: string;
        location: string;
        city: string;
        size: string;
        type: string;
        aspectRatio: string;
        pricePerDay: number;
        maxSlotsPerDay: number;
        imageUrl: string;
        isActive: boolean;
    }>
) {
    const [unit] = await db
        .update(videotronUnits)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(videotronUnits.id, id))
        .returning();
    return unit;
}

export async function toggleUnitStatus(id: string) {
    const unit = await getUnitById(id);
    if (!unit) return null;

    const [updated] = await db
        .update(videotronUnits)
        .set({ isActive: !unit.isActive, updatedAt: new Date() })
        .where(eq(videotronUnits.id, id))
        .returning();
    return updated;
}

export async function deleteUnit(id: string) {
    const [deleted] = await db
        .delete(videotronUnits)
        .where(eq(videotronUnits.id, id))
        .returning();
    return deleted;
}
