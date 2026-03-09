import { db } from "../db/index.js";
import {
    orders,
    videotronUnits,
    user,
    broadcastProofs,
} from "../db/schema.js";
import { eq, sql, count, desc, and } from "drizzle-orm";

// ─── Admin Dashboard ─────────────────────────────────────────────────────────

export async function getAdminDashboardStats() {
    const [
        revenueResult,
        pendingVerificationResult,
        activeUnitsResult,
        totalUnitsResult,
        totalUsersResult,
    ] = await Promise.all([
        // Total revenue (from orders that are sudah_bayar, tayang, or selesai)
        db
            .select({ total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` })
            .from(orders)
            .where(
                sql`${orders.status} IN ('sudah_bayar', 'tayang', 'selesai')`
            ),
        // Pending verification count
        db
            .select({ count: count() })
            .from(orders)
            .where(eq(orders.status, "menunggu_verifikasi")),
        // Active videotron units
        db
            .select({ count: count() })
            .from(videotronUnits)
            .where(eq(videotronUnits.isActive, true)),
        // Total videotron units
        db.select({ count: count() }).from(videotronUnits),
        // Total users
        db.select({ count: count() }).from(user),
    ]);

    return {
        totalRevenue: revenueResult[0]?.total || 0,
        pendingVerification: pendingVerificationResult[0]?.count || 0,
        activeUnits: activeUnitsResult[0]?.count || 0,
        totalUnits: totalUnitsResult[0]?.count || 0,
        totalUsers: totalUsersResult[0]?.count || 0,
    };
}

export async function getAdminRecentOrders(limit: number = 5) {
    return db
        .select({
            order: orders,
            unit: {
                name: videotronUnits.name,
                location: videotronUnits.location,
                imageUrl: videotronUnits.imageUrl,
            },
            user: { name: user.name, email: user.email },
        })
        .from(orders)
        .leftJoin(videotronUnits, eq(orders.unitId, videotronUnits.id))
        .leftJoin(user, eq(orders.userId, user.id))
        .orderBy(desc(orders.createdAt))
        .limit(limit);
}

// ─── User Dashboard ──────────────────────────────────────────────────────────

export async function getUserDashboardStats(userId: string) {
    const [
        totalOrdersResult,
        currentlyBroadcastingResult,
        awaitingPaymentResult,
        totalSpendingResult,
    ] = await Promise.all([
        // Total orders for user
        db
            .select({ count: count() })
            .from(orders)
            .where(eq(orders.userId, userId)),
        // Currently broadcasting
        db
            .select({ count: count() })
            .from(orders)
            .where(and(eq(orders.userId, userId), eq(orders.status, "tayang"))),
        // Awaiting payment
        db
            .select({ count: count() })
            .from(orders)
            .where(and(eq(orders.userId, userId), eq(orders.status, "pending"))),
        // Total spending
        db
            .select({ total: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)` })
            .from(orders)
            .where(
                and(
                    eq(orders.userId, userId),
                    sql`${orders.status} IN ('sudah_bayar', 'tayang', 'selesai')`
                )
            ),
    ]);

    return {
        totalOrders: totalOrdersResult[0]?.count || 0,
        currentlyBroadcasting: currentlyBroadcastingResult[0]?.count || 0,
        awaitingPayment: awaitingPaymentResult[0]?.count || 0,
        totalSpending: totalSpendingResult[0]?.total || 0,
    };
}

export async function getUserRecentOrders(userId: string, limit: number = 5) {
    return db
        .select({
            order: orders,
            unit: {
                name: videotronUnits.name,
                location: videotronUnits.location,
                imageUrl: videotronUnits.imageUrl,
            },
        })
        .from(orders)
        .leftJoin(videotronUnits, eq(orders.unitId, videotronUnits.id))
        .where(eq(orders.userId, userId))
        .orderBy(desc(orders.createdAt))
        .limit(limit);
}

// ─── Revenue Chart ──────────────────────────────────────────────────────────

export async function getRevenueChart(period: string = "monthly") {
    const paidStatuses = "('sudah_bayar', 'tayang', 'selesai')";

    if (period === "weekly") {
        // Last 8 weeks
        const result = await db.execute(sql`
            SELECT
                TO_CHAR(DATE_TRUNC('week', ${orders.createdAt}), 'DD Mon') AS label,
                COALESCE(SUM(${orders.totalAmount}), 0)::int AS revenue
            FROM ${orders}
            WHERE ${orders.status} IN ('sudah_bayar', 'tayang', 'selesai')
            AND ${orders.createdAt} >= NOW() - INTERVAL '8 weeks'
            GROUP BY DATE_TRUNC('week', ${orders.createdAt})
            ORDER BY DATE_TRUNC('week', ${orders.createdAt})
        `);
        return result.rows || result;
    } else if (period === "yearly") {
        // Last 5 years
        const result = await db.execute(sql`
            SELECT
                TO_CHAR(DATE_TRUNC('year', ${orders.createdAt}), 'YYYY') AS label,
                COALESCE(SUM(${orders.totalAmount}), 0)::int AS revenue
            FROM ${orders}
            WHERE ${orders.status} IN ('sudah_bayar', 'tayang', 'selesai')
            AND ${orders.createdAt} >= NOW() - INTERVAL '5 years'
            GROUP BY DATE_TRUNC('year', ${orders.createdAt})
            ORDER BY DATE_TRUNC('year', ${orders.createdAt})
        `);
        return result.rows || result;
    } else {
        // Monthly (default) — last 12 months
        const result = await db.execute(sql`
            SELECT
                TO_CHAR(DATE_TRUNC('month', ${orders.createdAt}), 'Mon YYYY') AS label,
                COALESCE(SUM(${orders.totalAmount}), 0)::int AS revenue
            FROM ${orders}
            WHERE ${orders.status} IN ('sudah_bayar', 'tayang', 'selesai')
            AND ${orders.createdAt} >= NOW() - INTERVAL '12 months'
            GROUP BY DATE_TRUNC('month', ${orders.createdAt})
            ORDER BY DATE_TRUNC('month', ${orders.createdAt})
        `);
        return result.rows || result;
    }
}

export async function getTopVideotronRevenue(limit: number = 3) {
    const result = await db
        .select({
            unitId: videotronUnits.id,
            name: videotronUnits.name,
            location: videotronUnits.location,
            totalRevenue: sql<number>`COALESCE(SUM(${orders.totalAmount}), 0)::int`,
            totalOrders: sql<number>`COUNT(${orders.id})::int`,
        })
        .from(videotronUnits)
        .leftJoin(
            orders,
            and(
                eq(orders.unitId, videotronUnits.id),
                sql`${orders.status} IN ('sudah_bayar', 'tayang', 'selesai')`
            )
        )
        .groupBy(videotronUnits.id, videotronUnits.name, videotronUnits.location)
        .orderBy(sql`COALESCE(SUM(${orders.totalAmount}), 0) DESC`)
        .limit(limit);

    return result;
}
