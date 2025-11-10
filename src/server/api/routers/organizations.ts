import { organizations } from "~/server/db/schema/tour";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import z from "zod";
import { and, eq } from "drizzle-orm";

export const organizationRouter = createTRPCRouter({
    // Get organization profile by user ID (public)
    getOrganizationByUserID: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const organization = await ctx.db
                .select()
                .from(organizations)
                .where(eq(organizations.userID, input))
                .limit(1);
            
            if (!organization[0]) {
                throw new Error("Organization not found");
            }
            
            return organization[0];
        }),

    // Get current user's organization profile
    getMyOrganization: protectedProcedure
        .query(async ({ ctx }) => {
            if (ctx.session.user.role !== "ORGANIZATION") {
                throw new Error("Unauthorized: Only organizations can access this");
            }

            const organization = await ctx.db
                .select()
                .from(organizations)
                .where(eq(organizations.userID, ctx.session.user.id))
                .limit(1);
            
            if (!organization[0]) {
                throw new Error("Organization profile not found");
            }
            
            return organization[0];
        }),

    // Create organization profile
    createOrganization: protectedProcedure
        .input(z.object({
            taxID: z.number().int().positive(),
            websiteURL: z.string().url(),
            slogan: z.string().min(1).max(500),
        }))
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.user.role !== "ADMIN") {
                throw new Error("Unauthorized: Only admins can create organization profiles");
            }

            // Check if organization already exists
            const existing = await ctx.db
                .select()
                .from(organizations)
                .where(eq(organizations.userID, ctx.session.user.id))
                .limit(1);

            if (existing[0]) {
                throw new Error("Organization profile already exists");
            }

            const newOrganization = await ctx.db
                .insert(organizations)
                .values({
                    userID: ctx.session.user.id,
                    taxID: input.taxID,
                    websiteURL: input.websiteURL,
                    slogan: input.slogan,
                })
                .returning();
            
            return newOrganization[0];
        }),

    // Update organization profile
    updateOrganization: protectedProcedure
        .input(z.object({
            taxID: z.number().int().positive().optional(),
            websiteURL: z.string().url().optional(),
            slogan: z.string().min(1).max(500).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.user.role !== "ORGANIZATION") {
                throw new Error("Unauthorized: Only organizations can update profiles");
            }

            const updatedOrganization = await ctx.db
                .update(organizations)
                .set({
                    taxID: input.taxID,
                    websiteURL: input.websiteURL,
                    slogan: input.slogan,
                })
                .where(eq(organizations.userID, ctx.session.user.id))
                .returning();
            
            if (updatedOrganization.length === 0) {
                throw new Error("Organization profile not found");
            }
            
            return updatedOrganization[0];
        }),

    // Delete organization profile
    deleteOrganization: protectedProcedure
        .mutation(async ({ ctx }) => {
            if (ctx.session.user.role !== "ADMIN") {
                throw new Error("Unauthorized: Only admins can delete organization profiles");
            }

            const deletedOrganization = await ctx.db
                .delete(organizations)
                .where(eq(organizations.userID, ctx.session.user.id))
                .returning();
            
            if (deletedOrganization.length === 0) {
                throw new Error("Organization profile not found");
            }
            
            return deletedOrganization[0];
        }),
});
