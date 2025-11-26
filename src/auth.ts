import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware, username } from "better-auth/plugins";

import { db } from "~/server/db";
import * as user from "~/server/db/schema/auth-schema";
import { z } from "zod";
import { api } from "./trpc/server";
import { eq } from "drizzle-orm";
import { organizations, tourGuide } from "./server/db/schema/tour";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // or "pg" or "mysql",
    schema: user,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
  },
  plugins: [
    username(),
    nextCookies(),
  ],
  user:{
    additionalFields: {
      role:{
        type: "string",
        defaultValue: "USER",
        input: false,
        required: true,
        validator: {
          input: z.string().refine((val) => ["ADMIN", "USER", "GUIDE", "ORGANIZATION"].includes(val), {
            message: "Role must be one of: ADMIN, USER, GUIDE, ORGANIZATION",
          }),
          output: z.string().refine((val) => ["ADMIN", "USER", "GUIDE", "ORGANIZATION"].includes(val), {
            message: "Role must be one of: ADMIN, USER, GUIDE, ORGANIZATION",
          }),
        }
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
  },
  advanced: {
    cookiePrefix: "tourgether",
  },
  databaseHooks:{
    user: {
      create: {
        after: async (usr, context) => {
          if(!context?.path.startsWith("/signup"))
            return;
          const useracc = await db.query.user.findFirst({
            where: eq(user.user.id, usr.id)
          })
          if(!useracc)
            return
          if(useracc.role === "GUIDE"){
            await db.insert(tourGuide)
                    .values({
                      userID: useracc.id,
                      school: "",
                      description: ""                      
                    })
          }
          else {
            await db.insert(organizations)
                    .values({
                      userID: useracc.id,
                      taxID: 0,
                      slogan: "",
                      websiteURL: ""
                    })
          }
        },
      }
    }
  }
});

export type Session = typeof auth.$Infer.Session;
