import z from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { and, eq, desc, count } from "drizzle-orm";
import { guiderAppliedTours, guideToTags, tags, tourGuide, tours, tourLeaveRequests, previousTours, review, guidePerformanceReviews } from "~/server/db/schema/tour";
import { user } from "~/server/db/schema/auth-schema";
import { TRPCError } from "@trpc/server";

export const tourGuideRouter = createTRPCRouter({
	// Get guide profile with full details (for viewing by businesses)
	getGuideProfileById: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			// Get guide profile with user info
			const guideData = await ctx.db
				.select({
					guide: tourGuide,
					user: {
						id: user.id, 
						name: user.name,
						email: user.email,
						image: user.image,
						createdAt: user.createdAt,
					},
				})
				.from(tourGuide)
				.innerJoin(user, eq(tourGuide.userID, user.id))
				.where(eq(tourGuide.userID, input))
				.limit(1);

			if (!guideData[0]) {
				throw new TRPCError({ message: "Tour guide not found", code: "NOT_FOUND" });
			}

			// Get guide's tags
			const guideTags = await ctx.db
				.select({
					id: tags.id,
					name: tags.tags,
				})
				.from(guideToTags)
				.innerJoin(tags, eq(guideToTags.tagID, tags.id))
				.where(eq(guideToTags.guideID, input));

			// Get completed tours count
			const completedToursCount = await ctx.db
				.select({ count: count() })
				.from(previousTours)
				.where(eq(previousTours.guideID, input));

			// Get current assigned tours
			const currentTours = await ctx.db
				.select()
				.from(tours)
				.where(and(
					eq(tours.guideID, input),
					eq(tours.status, "CURRENT"),
				))
				.orderBy(desc(tours.date))
				.limit(5);

			// Get reviews for this guide
			const guideReviews = await ctx.db
				.select({
					review: review,
					reviewer: {
						id: user.id,
						name: user.name,
						image: user.image,
					},
				})
				.from(review)
				.innerJoin(user, eq(review.fromUserID, user.id))
				.where(eq(review.toUserID, input))
				.orderBy(desc(review.createdAt))
				.limit(10);

			// Get performance reviews (from organizations)
			const performanceReviews = await ctx.db
				.select({
					id: guidePerformanceReviews.id,
					summary: guidePerformanceReviews.summary,
					strengths: guidePerformanceReviews.strengths,
					improvements: guidePerformanceReviews.improvements,
					sentimentScore: guidePerformanceReviews.sentimentScore,
					rating: guidePerformanceReviews.rating,
					redFlags: guidePerformanceReviews.redFlags,
					tourName: guidePerformanceReviews.tourName,
					tourLocation: guidePerformanceReviews.tourLocation,
					tourDate: guidePerformanceReviews.tourDate,
					createdAt: guidePerformanceReviews.createdAt,
					organization: {
						id: user.id,
						name: user.name,
						image: user.image,
					},
				})
				.from(guidePerformanceReviews)
				.innerJoin(user, eq(guidePerformanceReviews.organizationID, user.id))
				.where(eq(guidePerformanceReviews.guideID, input))
				.orderBy(desc(guidePerformanceReviews.createdAt))
				.limit(20);

			return {
				...guideData[0],
				tags: guideTags,
				completedToursCount: completedToursCount[0]?.count ?? 0,
				currentTours,
				reviews: guideReviews,
				performanceReviews,
			};
		}),

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
				cvUrl: z.string().optional(),
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
					cvUrl: input.cvUrl,
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
				cvUrl: z.string().optional(),
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
					cvUrl: input.cvUrl,
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

			await ctx.db
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

	// Request to leave an assigned tour
	requestLeaveTour: protectedProcedure
		.input(
			z.object({
				tourID: z.string(),
				reason: z.string().min(20, "Reason must be at least 20 characters").max(1000),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "GUIDE") {
				throw new TRPCError({
					message: "Unauthorized: Only guides can request to leave tours",
					code: "UNAUTHORIZED",
				});
			}

			// Check if the tour exists and this guide is assigned to it
			const tour = await ctx.db
				.select()
				.from(tours)
				.where(eq(tours.id, input.tourID))
				.limit(1);

			if (!tour[0]) {
				throw new TRPCError({ message: "Tour not found", code: "NOT_FOUND" });
			}

			if (tour[0].guideID !== ctx.session.user.id) {
				throw new TRPCError({
					message: "You are not the assigned guide for this tour",
					code: "FORBIDDEN",
				});
			}

			// Check if there's already a pending leave request
			const existingRequest = await ctx.db
				.select()
				.from(tourLeaveRequests)
				.where(
					and(
						eq(tourLeaveRequests.tourID, input.tourID),
						eq(tourLeaveRequests.guideID, ctx.session.user.id),
						eq(tourLeaveRequests.status, "PENDING"),
					),
				)
				.limit(1);

			if (existingRequest[0]) {
				throw new TRPCError({
					message: "You already have a pending leave request for this tour",
					code: "CONFLICT",
				});
			}

			// Create the leave request
			const leaveRequest = await ctx.db
				.insert(tourLeaveRequests)
				.values({
					tourID: input.tourID,
					guideID: ctx.session.user.id,
					reason: input.reason,
				})
				.returning();

			return leaveRequest[0];
		}),

	// Get my leave requests
	getMyLeaveRequests: protectedProcedure.query(async ({ ctx }) => {
		if (ctx.session.user.role !== "GUIDE") {
			throw new TRPCError({
				message: "Unauthorized: Only guides can view their leave requests",
				code: "UNAUTHORIZED",
			});
		}

		const requests = await ctx.db
			.select()
			.from(tourLeaveRequests)
			.where(eq(tourLeaveRequests.guideID, ctx.session.user.id))
			.orderBy(desc(tourLeaveRequests.createdAt));

		return requests;
	}),

	// Cancel a pending leave request
	cancelLeaveRequest: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "GUIDE") {
				throw new TRPCError({
					message: "Unauthorized: Only guides can cancel leave requests",
					code: "UNAUTHORIZED",
				});
			}

			const request = await ctx.db
				.select()
				.from(tourLeaveRequests)
				.where(
					and(
						eq(tourLeaveRequests.id, input),
						eq(tourLeaveRequests.guideID, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!request[0]) {
				throw new TRPCError({ message: "Leave request not found", code: "NOT_FOUND" });
			}

			if (request[0].status !== "PENDING") {
				throw new TRPCError({
					message: "Can only cancel pending leave requests",
					code: "CONFLICT",
				});
			}

			const deleted = await ctx.db
				.delete(tourLeaveRequests)
				.where(eq(tourLeaveRequests.id, input))
				.returning();

			return deleted[0];
		}),
});