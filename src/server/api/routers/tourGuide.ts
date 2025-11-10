import z from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { and, eq, desc } from "drizzle-orm";
import { guideToTags, tags, tourGuide, tours } from "~/server/db/schema/tour";

export const tourGuideRouter = createTRPCRouter({
    getTourGuideByUserID: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const tourGuideQuery = await ctx.db
                .select()
                .from(tourGuide)
                .where(eq(tourGuide.userID, input))
                .limit(1);

            if (!tourGuideQuery[0]) {
                throw new Error("Tour guide not found");
            }

            return tourGuideQuery[0];
        }),

    getMyGuideProfile: protectedProcedure
        .query(async ({ ctx }) => {
            if (ctx.session.user.role !== "TOUR_GUIDE") {
                throw new Error("Unauthorized: Only tour guides can access this");
            }

            const guide = await ctx.db
                .select()
                .from(tourGuide)
                .where(eq(tourGuide.userID, ctx.session.user.id))
                .limit(1);

            if (!guide[0]) {
                throw new Error("Tour guide profile not found");
            }

            return guide[0];
        }),

    getAllToursFromGuide: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const toursQuery = await ctx.db
                .select()
                .from(tours)
                .where(eq(tours.guideID, input))
                .orderBy(desc(tours.date));

            return toursQuery;
        }),

    getGuideTags: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const guideTags = await ctx.db
                .select({
                    id: tags.id,
                    name: tags.tags,
                })
                .from(guideToTags)
                .innerJoin(tags, eq(guideToTags.tagID, tags.id))
                .where(eq(guideToTags.guideID, input));

            return guideTags;
        }),

    createGuideProfile: protectedProcedure
        .input(z.object({
            school: z.string().min(1).max(200),
            certificates: z.array(z.string()).default([]),
            workExperience: z.array(z.string()).default([]),
            description: z.string().min(1).max(2000),
        }))
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.user.role !== "ADMIN") {
                throw new Error("Unauthorized: Only admins can create profiles");
            }

            const existing = await ctx.db
                .select()
                .from(tourGuide)
                .where(eq(tourGuide.userID, ctx.session.user.id))
                .limit(1);

            if (existing[0]) {
                throw new Error("Tour guide profile already exists");
            }

            const newGuide = await ctx.db
                .insert(tourGuide)
                .values({
                    userID: ctx.session.user.id,
                    school: input.school,
                    certificates: input.certificates,
                    workExperience: input.workExperience,
                    description: input.description,
                })
                .returning();

            return newGuide[0];
        }),

    updateGuideProfile: protectedProcedure
        .input(z.object({
            school: z.string().min(1).max(200).optional(),
            certificates: z.array(z.string()).optional(),
            workExperience: z.array(z.string()).optional(),
            description: z.string().min(1).max(2000).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.user.role !== "TOUR_GUIDE") {
                throw new Error("Unauthorized: Only tour guides can update profiles");
            }

            const updatedGuide = await ctx.db
                .update(tourGuide)
                .set({
                    school: input.school,
                    certificates: input.certificates,
                    workExperience: input.workExperience,
                    description: input.description,
                })
                .where(eq(tourGuide.userID, ctx.session.user.id))
                .returning();

            if (updatedGuide.length === 0) {
                throw new Error("Tour guide profile not found");
            }

            return updatedGuide[0];
        }),

    deleteGuideProfile: protectedProcedure
        .mutation(async ({ ctx }) => {
            if (ctx.session.user.role !== "ADMIN") {
                throw new Error("Unauthorized: Only admins can delete profiles");
            }

            const deletedGuide = await ctx.db
                .delete(tourGuide)
                .where(eq(tourGuide.userID, ctx.session.user.id))
                .returning();

            if (deletedGuide.length === 0) {
                throw new Error("Tour guide profile not found");
            }

            return deletedGuide[0];
        }),

    addTagToGuide: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.user.role !== "TOUR_GUIDE") {
                throw new Error("Unauthorized: Only tour guides can add tags");
            }

            const tag = await ctx.db
                .select()
                .from(tags)
                .where(eq(tags.id, input))
                .limit(1);

            if (!tag[0]) {
                throw new Error("Tag not found");
            }

            const existing = await ctx.db
                .select()
                .from(guideToTags)
                .where(
                    and(
                        eq(guideToTags.guideID, ctx.session.user.id),
                        eq(guideToTags.tagID, input)
                    )
                )
                .limit(1);

            if (existing[0]) {
                throw new Error("Tag already added to guide");
            }

            await ctx.db
                .insert(guideToTags)
                .values({
                    guideID: ctx.session.user.id,
                    tagID: input,
                });

            return { success: true, tagID: input };
        }),


    removeTagFromGuide: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            if (ctx.session.user.role !== "TOUR_GUIDE") {
                throw new Error("Unauthorized: Only tour guides can remove tags");
            }

            const result = await ctx.db
                .delete(guideToTags)
                .where(
                    and(
                        eq(guideToTags.guideID, ctx.session.user.id),
                        eq(guideToTags.tagID, input)
                    )
                );

            return { success: true, tagID: input };
        }),
});