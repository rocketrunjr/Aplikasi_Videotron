import {
    sqliteTable,
    text,
    integer,
} from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

// ─── Better Auth managed tables ──────────────────────────────────────────────
// Better Auth creates: user, session, account, verification
// We define the `user` table here so Drizzle is aware of it and we can add
// our custom columns. Better Auth will use this definition if we pass it.

export const user = sqliteTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: integer("email_verified", { mode: 'boolean' }).notNull().default(false),
    image: text("image"),
    phone: text("phone"),
    company: text("company"),
    address: text("address"),
    telegramChatId: text("telegram_chat_id"),
    accountType: text("account_type").notNull().default("pribadi"), // pribadi | perusahaan | pemerintah
    role: text("role").notNull().default("user"), // user | admin | petugas
    status: text("status").notNull().default("active"), // active | suspended
    createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const session = sqliteTable("session", {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: 'timestamp' }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: 'timestamp' }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: 'timestamp' }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: 'timestamp' }).notNull(),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull(),
});

export const verification = sqliteTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: 'timestamp' }).notNull(),
    createdAt: integer("created_at", { mode: 'timestamp' }),
    updatedAt: integer("updated_at", { mode: 'timestamp' }),
});

// ─── Application tables ──────────────────────────────────────────────────────

export const videotronUnits = sqliteTable("videotron_units", {
    id: text("id").primaryKey().$defaultFn(() => uuidv4()),
    code: text("code").notNull().unique(),
    name: text("name").notNull(),
    location: text("location").notNull(),
    city: text("city").notNull(),
    size: text("size").notNull(),
    type: text("type").notNull().default("outdoor"), // indoor | outdoor
    aspectRatio: text("aspect_ratio").notNull().default("16:9"),
    pricePerDay: integer("price_per_day").notNull(),
    imageUrl: text("image_url"),
    maxSlotsPerDay: integer("max_slots_per_day").notNull().default(1),
    isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
    createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const orders = sqliteTable("orders", {
    id: text("id").primaryKey().$defaultFn(() => uuidv4()),
    orderNumber: text("order_number").notNull().unique(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    unitId: text("unit_id")
        .notNull()
        .references(() => videotronUnits.id, { onDelete: "restrict" }),
    status: text("status").notNull().default("pending"),
    // pending | menunggu_verifikasi | ditolak | sudah_bayar | tayang | selesai | dibatalkan
    materialFileUrl: text("material_file_url"),
    materialDriveLink: text("material_drive_link"),
    paymentProofUrl: text("payment_proof_url"),
    invoiceFileUrl: text("invoice_file_url"),
    voucherCode: text("voucher_code"),
    discountAmount: integer("discount_amount").notNull().default(0),
    subtotal: integer("subtotal").notNull().default(0),
    totalAmount: integer("total_amount").notNull().default(0),
    adminNotes: text("admin_notes"),
    createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const orderDates = sqliteTable("order_dates", {
    id: text("id").primaryKey().$defaultFn(() => uuidv4()),
    orderId: text("order_id")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    price: integer("price").notNull(),
});

export const broadcastProofs = sqliteTable("broadcast_proofs", {
    id: text("id").primaryKey().$defaultFn(() => uuidv4()),
    orderId: text("order_id")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    date: text("date").notNull(),
    timeOfDay: text("time_of_day").notNull().default("siang"), // siang | malam
    imageUrl: text("image_url").notNull(),
    uploadedAt: integer("uploaded_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const bankSettings = sqliteTable("bank_settings", {
    id: text("id").primaryKey().$defaultFn(() => uuidv4()),
    bankName: text("bank_name").notNull(),
    accountNumber: text("account_number").notNull(),
    accountHolder: text("account_holder").notNull(),
    isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const vouchers = sqliteTable("vouchers", {
    id: text("id").primaryKey().$defaultFn(() => uuidv4()),
    code: text("code").notNull().unique(),
    discountAmount: integer("discount_amount").notNull(),
    discountType: text("discount_type").notNull().default("fixed"), // fixed | percentage
    isActive: integer("is_active", { mode: 'boolean' }).notNull().default(true),
    usageLimit: integer("usage_limit").notNull().default(0), // 0 = unlimited
    usedCount: integer("used_count").notNull().default(0),
    validFrom: integer("valid_from", { mode: 'timestamp' }),
    validUntil: integer("valid_until", { mode: 'timestamp' }),
    createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const petugasAssignments = sqliteTable("petugas_assignments", {
    id: text("id").primaryKey().$defaultFn(() => uuidv4()),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    unitId: text("unit_id")
        .notNull()
        .references(() => videotronUnits.id, { onDelete: "cascade" }),
    createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// ─── Relations ───────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
    orders: many(orders),
    sessions: many(session),
    accounts: many(account),
}));

export const sessionRelations = relations(session, ({ one }) => ({
    user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
    user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const videotronUnitRelations = relations(videotronUnits, ({ many }) => ({
    orders: many(orders),
    petugasAssignments: many(petugasAssignments),
}));

export const orderRelations = relations(orders, ({ one, many }) => ({
    user: one(user, { fields: [orders.userId], references: [user.id] }),
    unit: one(videotronUnits, {
        fields: [orders.unitId],
        references: [videotronUnits.id],
    }),
    dates: many(orderDates),
    broadcastProofs: many(broadcastProofs),
}));

export const orderDateRelations = relations(orderDates, ({ one }) => ({
    order: one(orders, {
        fields: [orderDates.orderId],
        references: [orders.id],
    }),
}));

export const broadcastProofRelations = relations(broadcastProofs, ({ one }) => ({
    order: one(orders, {
        fields: [broadcastProofs.orderId],
        references: [orders.id],
    }),
}));

export const petugasAssignmentRelations = relations(petugasAssignments, ({ one }) => ({
    user: one(user, { fields: [petugasAssignments.userId], references: [user.id] }),
    unit: one(videotronUnits, { fields: [petugasAssignments.unitId], references: [videotronUnits.id] }),
}));
