import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { user } from "~/server/db/schema/auth-schema";
import { eq } from "drizzle-orm/sql/expressions";
import { TRPCError } from "@trpc/server";
import { organizations, tourGuide, tours } from "~/server/db/schema/tour";

export const userRouter = createTRPCRouter({
    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
        const currentUser = await ctx.db
            .query.user.findFirst({
                where: eq(user.id, ctx.session.user.id),
                extras: {
                    tours: ctx.db.$count(tours, eq(tours.guideID, ctx.session.user.id)).as("tours"),
                }
            });
        if (!currentUser) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "User not found",
            });
        }
        let profile: typeof organizations.$inferSelect | typeof tourGuide.$inferSelect | undefined;
        if (ctx.session.user.role === "ORGANIZATION") {
            profile = await ctx.db
                .query.organizations.findFirst({
                    where: eq(organizations.userID, ctx.session.user.id),
                });
        }
        if (ctx.session.user.role === "GUIDE") {
            profile = await ctx.db
                .query.tourGuide.findFirst({
                    where: eq(tourGuide.userID, ctx.session.user.id),
                });
        }
        return { currentUser, profile };
    }),
    updateUserProfile: protectedProcedure
        .input(
            z.object({
                fullName: z.string().min(1).max(100).optional(),
                email: z.email().optional(),
                phone: z.string().min(7).max(15).optional(),
                address: z.string().optional(),
                gender: z.string().optional(),
                // Guide specific
                school: z.string().optional(),
                certificates: z.array(z.string()).optional(),
                workExperience: z.array(z.string()).optional(),
                description: z.string().optional(),
                cvUrl: z.string().optional(),
                // Organization specific
                taxID: z.string().optional(), // Input as string, convert to int
                websiteURL: z.string().optional(),
                slogan: z.string().optional(),
            })
        ).mutation(async ({ ctx, input }) => {
            // Update User table
            const updatedUser = await ctx.db
                .update(user)
                .set({
                    name: input.fullName,
                    email: input.email,
                    phonenumber: input.phone,
                    address: input.address,
                    gender: input.gender,
                })
                .where(eq(user.id, ctx.session.user.id))
                .returning();

            if (updatedUser.length === 0) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "User not found",
                });
            }

            // Update Role specific tables
            if (ctx.session.user.role === "GUIDE") {
                await ctx.db
                    .insert(tourGuide)
                    .values({
                        userID: ctx.session.user.id,
                        school: input.school,
                        certificates: input.certificates,
                        workExperience: input.workExperience,
                        description: input.description,
                        cvUrl: input.cvUrl,
                    })
                    .onConflictDoUpdate({
                        target: tourGuide.userID,
                        set: {
                            school: input.school,
                            certificates: input.certificates,
                            workExperience: input.workExperience,
                            description: input.description,
                            cvUrl: input.cvUrl,
                        },
                    });
            } else if (ctx.session.user.role === "ORGANIZATION") {
                await ctx.db
                    .insert(organizations)
                    .values({
                        userID: ctx.session.user.id,
                        taxID: input.taxID ? parseInt(input.taxID) : 0, // Default to 0 if not provided or invalid
                        websiteURL: input.websiteURL,
                        slogan: input.slogan,
                    })
                    .onConflictDoUpdate({
                        target: organizations.userID,
                        set: {
                            taxID: input.taxID ? parseInt(input.taxID) : undefined,
                            websiteURL: input.websiteURL,
                            slogan: input.slogan,
                        },
                    });
            }

            return updatedUser[0];
        }),
});