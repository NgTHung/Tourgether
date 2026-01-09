import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { username } from "better-auth/plugins";

import { db } from "~/server/db";
import * as user from "~/server/db/schema/auth-schema";

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg", // or "pg" or "mysql",
		schema: user,
	}),
	emailAndPassword: {
		enabled: true,
	},
	socialProviders: {},
	plugins: [username(), nextCookies()],
	user: {
		additionalFields: {
			role: {
				type: "string",
				defaultValue: "GUIDE",
				input: true,
				required: true,
				enum: ["GUIDE", "ORGANIZATION"],
			},
			phonenumber: {
				type: "string",
				defaultValue: "",
				input: true,
				required: true,
			},
			address: {
				type: "string",
				defaultValue: "",
				input: true,
				required: true,
			},
			gender: {
				type: "string",
				defaultValue: "",
				input: true,
				required: true,
			},
			birthday: {
				type: "string",
				defaultValue: "",
				input: true,
				required: true,
			},
			verificationID: {
				type: "string",
				defaultValue: "",
				input: true,
				required: true,
			},
			rating: {
				type: "number",
				defaultValue: 0,
				input: false,
				required: true,
			},
			mediapage: {
				type: "string",
				defaultValue: "",
				input: false,
				required: true,
			},
			finishedOnboardings: {
				type: "boolean",
				defaultValue: false,
				input: false,
				required: true,
			},
		},
	},
	advanced: {
		cookiePrefix: "tourgether",
	},
	trustedOrigins: [
		"http://localhost:5173",
		...(process.env.VERCEL_URL
			? [`https://${process.env.VERCEL_URL}`]
			: []),
	],
});

export type Session = typeof auth.$Infer.Session;
