import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db/index.js";
import * as schema from "../db/schema.js";

export const auth = betterAuth({
    basePath: "/api/auth",
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            user: schema.user,
            session: schema.session,
            account: schema.account,
            verification: schema.verification,
        },
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 5,
    },
    socialProviders: {
        ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
            ? {
                google: {
                    clientId: process.env.GOOGLE_CLIENT_ID,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                },
            }
            : {}),
    },
    user: {
        additionalFields: {
            phone: {
                type: "string",
                required: false,
                input: true,
            },
            company: {
                type: "string",
                required: false,
                input: true,
            },
            address: {
                type: "string",
                required: false,
                input: true,
            },
            accountType: {
                type: "string",
                required: false,
                defaultValue: "pribadi",
                input: true,
                fieldName: "accountType",
            },
            role: {
                type: "string",
                required: false,
                defaultValue: "user",
                input: false, // cannot be set by user during registration
                fieldName: "role",
            },
            status: {
                type: "string",
                required: false,
                defaultValue: "active",
                input: false,
                fieldName: "status",
            },
        },
    },
    trustedOrigins: [
        process.env.FRONTEND_URL || "http://localhost:5173",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175"
    ],
});
