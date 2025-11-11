import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import z from "zod";

import { env } from "~/env";
import { db } from "~/server/db";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql"
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
  },
  plugins: [
    username()
  ],
  user:{
    additionalFields: {
      role:{
        type: "string",
        defaultValue: "USER",
        input: false,
        required: true,
        enum: ["ADMIN", "USER", "GUIDE", "ORGANIZATION"]
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
    }
  }
});

export type Session = typeof auth.$Infer.Session;
