import {
    pgTable,
    text,
    timestamp,
    boolean,
    integer,
    uuid,
    date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Better Auth managed tables ──────────────────────────────────────────────
// Better Auth creates: user, session, account, verification
// We define the `user` table here so Drizzle is aware of it and we can add
// our custom columns. Better Auth will use this definition if we pass it.

export const user = pgTable("user", {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull().default(false),
    image: text("image"),
    phone: text("phone"),
    company: text("company"),
    address: text("address"),
    accountType: text("account_type").notNull().default("pribadi"), // pribadi | perusahaan | pemerintah
    role: text("role").notNull().default("user"), // user | admin
    status: text("status").notNull().default("active"), // active | suspended
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
});

// ─── Application tables ──────────────────────────────────────────────────────

export const videotronUnits = pgTable("videotron_units", {
    id: uuid("id").defaultRandom().primaryKey(),
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
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orders = pgTable("orders", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderNumber: text("order_number").notNull().unique(),
    userId: text("user_id")
        .notNull()
        .references(() => user.id, { onDelete: "cascade" }),
    unitId: uuid("unit_id")
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
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const orderDates = pgTable("order_dates", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    price: integer("price").notNull(),
});

export const broadcastProofs = pgTable("broadcast_proofs", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id")
        .notNull()
        .references(() => orders.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    timeOfDay: text("time_of_day").notNull().default("siang"), // siang | malam
    imageUrl: text("image_url").notNull(),
    uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

export const bankSettings = pgTable("bank_settings", {
    id: uuid("id").defaultRandom().primaryKey(),
    bankName: text("bank_name").notNull(),
    accountNumber: text("account_number").notNull(),
    accountHolder: text("account_holder").notNull(),
    isActive: boolean("is_active").notNull().default(true),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const vouchers = pgTable("vouchers", {
    id: uuid("id").defaultRandom().primaryKey(),
    code: text("code").notNull().unique(),
    discountAmount: integer("discount_amount").notNull(),
    discountType: text("discount_type").notNull().default("fixed"), // fixed | percentage
    isActive: boolean("is_active").notNull().default(true),
    usageLimit: integer("usage_limit").notNull().default(0), // 0 = unlimited
    usedCount: integer("used_count").notNull().default(0),
    validFrom: timestamp("valid_from"),
    validUntil: timestamp("valid_until"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
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
