import z from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { and, eq, desc } from "drizzle-orm";
import { guiderAppliedTours, guideToTags, tags, tourGuide, tours } from "~/server/db/schema/tour";
import { TRPCError } from "@trpc/server";

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
				throw new TRPCError({ message: "Tour guide not found", code: "NOT_FOUND" });
			}

			return tourGuideQuery[0];
		}),

	getMyGuideProfile: protectedProcedure.query(async ({ ctx }) => {
		if (ctx.session.user.role !== "GUIDE") {
			throw new TRPCError({ message: "Unauthorized: Only guides can access this", code: "UNAUTHORIZED" });
		}

		const guide = await ctx.db
			.select()
			.from(tourGuide)
			.where(eq(tourGuide.userID, ctx.session.user.id))
			.limit(1);

		if (!guide[0]) {
			throw new TRPCError({ message: "Tour guide profile not found", code: "NOT_FOUND" });
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
		.input(
			z.object({
				school: z.string().min(1).max(200),
				certificates: z.array(z.string()).default([]),
				workExperience: z.array(z.string()).default([]),
				description: z.string().min(1).max(2000),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "GUIDE") {
				throw new TRPCError({
					message: "Unauthorized: Only guides can create profiles",
					code: "UNAUTHORIZED",
				});
			}

			const existing = await ctx.db
				.select()
				.from(tourGuide)
				.where(eq(tourGuide.userID, ctx.session.user.id))
				.limit(1);

			if (existing[0]) {
				throw new TRPCError({ message: "Tour guide profile already exists", code: "CONFLICT" });
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
		.input(
			z.object({
				school: z.string().min(1).max(200).optional(),
				certificates: z.array(z.string()).optional(),
				workExperience: z.array(z.string()).optional(),
				description: z.string().min(1).max(2000).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "GUIDE") {
				throw new TRPCError({
					message: "Unauthorized: Only guides can update profiles",
					code: "UNAUTHORIZED",
				});
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
				throw new TRPCError({ message: "Tour guide profile not found", code: "NOT_FOUND" });
			}

			return updatedGuide[0];
		}),

	deleteGuideProfile: protectedProcedure.mutation(async ({ ctx }) => {
		if (ctx.session.user.role !== "GUIDE") {
			throw new TRPCError({ message: "Unauthorized: Only guides can delete profiles", code: "UNAUTHORIZED" });
		}

		const deletedGuide = await ctx.db
			.delete(tourGuide)
			.where(eq(tourGuide.userID, ctx.session.user.id))
			.returning();

		if (deletedGuide.length === 0) {
			throw new TRPCError({ message: "Tour guide profile not found", code: "NOT_FOUND" });
		}

		return deletedGuide[0];
	}),

	addTagToGuide: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "GUIDE") {
				throw new TRPCError({ message: "Unauthorized: Only guides can add tags", code: "UNAUTHORIZED" });
			}

			const tag = await ctx.db
				.select()
				.from(tags)
				.where(eq(tags.id, input))
				.limit(1);

			if (!tag[0]) {
				throw new TRPCError({ message: "Tag not found", code: "NOT_FOUND" });
			}

			const existing = await ctx.db
				.select()
				.from(guideToTags)
				.where(
					and(
						eq(guideToTags.guideID, ctx.session.user.id),
						eq(guideToTags.tagID, input),
					),
				)
				.limit(1);

			if (existing[0]) {
				throw new TRPCError({ message: "Tag already added to guide", code: "CONFLICT" });
			}

			await ctx.db.insert(guideToTags).values({
				guideID: ctx.session.user.id,
				tagID: input,
			});

			return { success: true, tagID: input };
		}),

	removeTagFromGuide: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "GUIDE") {
				throw new TRPCError({ message: "Unauthorized: Only guides can remove tags", code: "UNAUTHORIZED" });
			}

			const result = await ctx.db
				.delete(guideToTags)
				.where(
					and(
						eq(guideToTags.guideID, ctx.session.user.id),
						eq(guideToTags.tagID, input),
					),
				);

			return { success: true, tagID: input };
		}),

	applyAsGuideToTour: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "GUIDE") {
				throw new TRPCError({ message: "Unauthorized: Only guides can join tours", code: "UNAUTHORIZED" });
			}
			const tour = await ctx.db
				.select()
				.from(tours)
				.where(eq(tours.id, input))
				.limit(1);
			if (!tour[0]) {
				throw new TRPCError({ message: "Tour not found", code: "NOT_FOUND" });
			}
			if(tour[0].guideID === ctx.session.user.id){
				throw new TRPCError({ message: "You are already the guide of this tour", code: "CONFLICT" });
			}
			if(tour[0].guideID !== null){
				throw new TRPCError({ message: "This tour already has a guide assigned", code: "CONFLICT" });
			}
			const createdApplication = await ctx.db
				.insert(guiderAppliedTours)
				.values({
					tourID: input,
					guideID: ctx.session.user.id,
				})
				.returning();

			return createdApplication[0];
		}),
});