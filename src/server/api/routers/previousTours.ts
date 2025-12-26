import {
	previousTours,
	previousTourFeedbacks,
	guidePerformanceReviews,
	tourGuide,
} from "~/server/db/schema/tour";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { z } from "zod/v4";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const previousToursRouter = createTRPCRouter({
	// Get all previous tours for the current user (as owner or guide)
	getMyPreviousTours: protectedProcedure.query(async ({ ctx }) => {
		const userPreviousTours = await ctx.db.query.previousTours.findMany({
			where: eq(previousTours.ownerUserID, ctx.session.user.id),
			orderBy: [desc(previousTours.completedAt)],
			with: {
				owner: {
					columns: {
						id: true,
						name: true,
					},
				},
				feedbacks: {
					with: {
						user: {
							columns: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
				},
			},
		});

		return userPreviousTours;
	}),

	// Get previous tours where user was the guide
	getMyGuidedPreviousTours: protectedProcedure.query(async ({ ctx }) => {
		if (ctx.session.user.role !== "GUIDE") {
			throw new TRPCError({
				code: "UNAUTHORIZED",
				message: "Only guides can access this",
			});
		}

		const guidedTours = await ctx.db.query.previousTours.findMany({
			where: eq(previousTours.guideID, ctx.session.user.id),
			orderBy: [desc(previousTours.completedAt)],
			with: {
				owner: {
					columns: {
						id: true,
						name: true,
					},
				},
				feedbacks: {
					with: {
						user: {
							columns: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
				},
			},
		});

		return guidedTours;
	}),

	// Get a single previous tour by ID
	getPreviousTourById: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const previousTour = await ctx.db.query.previousTours.findFirst({
				where: eq(previousTours.id, input),
				with: {
					owner: true,
					guide: {
						with: {
							user: true,
						},
					},
					feedbacks: {
						with: {
							user: {
								columns: {
									id: true,
									name: true,
									image: true,
								},
							},
						},
						orderBy: [desc(previousTourFeedbacks.createdAt)],
					},
				},
			});

			if (!previousTour) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Previous tour not found",
				});
			}

			// Check authorization - only owner or guide can view
			if (
				previousTour.ownerUserID !== ctx.session.user.id &&
				previousTour.guideID !== ctx.session.user.id
			) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You are not authorized to view this tour",
				});
			}

			return previousTour;
		}),

	// Add feedback to a previous tour
	addFeedback: protectedProcedure
		.input(
			z.object({
				previousTourId: z.string(),
				rating: z.number().min(1).max(5),
				feedback: z.string().min(1).max(2000),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if the tour exists and user is authorized
			const previousTour = await ctx.db.query.previousTours.findFirst({
				where: eq(previousTours.id, input.previousTourId),
			});

			if (!previousTour) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Previous tour not found",
				});
			}

			// Only owner can add feedback
			if (previousTour.ownerUserID !== ctx.session.user.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only the tour owner can add feedback",
				});
			}

			const newFeedback = await ctx.db
				.insert(previousTourFeedbacks)
				.values({
					previousTourID: input.previousTourId,
					userID: ctx.session.user.id,
					rating: input.rating,
					feedback: input.feedback,
				})
				.returning();

			// Update the average rating on the previous tour
			const allFeedbacks = await ctx.db.query.previousTourFeedbacks.findMany({
				where: eq(previousTourFeedbacks.previousTourID, input.previousTourId),
			});

			const newAvgRating = allFeedbacks.length > 0
				? (allFeedbacks.reduce((acc, f) => acc + f.rating, 0) / allFeedbacks.length).toFixed(2)
				: null;

			await ctx.db
				.update(previousTours)
				.set({ averageRating: newAvgRating })
				.where(eq(previousTours.id, input.previousTourId));

			return newFeedback[0];
		}),

	// Delete feedback
	deleteFeedback: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			const feedback = await ctx.db.query.previousTourFeedbacks.findFirst({
				where: eq(previousTourFeedbacks.id, input),
				with: {
					previousTour: {
						columns: {
							ownerUserID: true,
						},
					},
				},
			});

			if (!feedback) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Feedback not found",
				});
			}

			// Allow deletion if user owns the feedback OR owns the tour
			const isOwner = feedback.userID === ctx.session.user.id;
			const isTourOwner = feedback.previousTour?.ownerUserID === ctx.session.user.id;

			if (!isOwner && !isTourOwner) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "You can only delete your own feedback or feedbacks on tours you own",
				});
			}

			await ctx.db
				.delete(previousTourFeedbacks)
				.where(eq(previousTourFeedbacks.id, input));

			// Recalculate average rating if previousTourID exists
			if (feedback.previousTourID) {
				const allFeedbacks = await ctx.db.query.previousTourFeedbacks.findMany({
					where: eq(previousTourFeedbacks.previousTourID, feedback.previousTourID),
				});

				const newAvgRating = allFeedbacks.length > 0
					? (allFeedbacks.reduce((acc, f) => acc + f.rating, 0) / allFeedbacks.length).toFixed(2)
					: null;

				await ctx.db
					.update(previousTours)
					.set({ averageRating: newAvgRating })
					.where(eq(previousTours.id, feedback.previousTourID));
			}

			return { success: true };
		}),

	// Update total travelers
	updateTotalTravelers: protectedProcedure
		.input(
			z.object({
				previousTourId: z.string(),
				totalTravelers: z.number().min(0),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const previousTour = await ctx.db.query.previousTours.findFirst({
				where: eq(previousTours.id, input.previousTourId),
			});

			if (!previousTour) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Previous tour not found",
				});
			}

			if (previousTour.ownerUserID !== ctx.session.user.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only the tour owner can update total travelers",
				});
			}

			await ctx.db
				.update(previousTours)
				.set({ totalTravelers: input.totalTravelers })
				.where(eq(previousTours.id, input.previousTourId));

			return { success: true };
		}),

	// Push AI review to guide's public profile
	pushReviewToGuide: protectedProcedure
		.input(
			z.object({
				previousTourId: z.string(),
				guideId: z.string(),
				summary: z.string(),
				strengths: z.array(z.string()),
				improvements: z.string().optional(),
				sentimentScore: z.number().min(0).max(100),
				rating: z.number().min(1).max(5),
				redFlags: z.number().min(0).max(1), // 0 = false, 1 = true
				tourName: z.string(),
				tourLocation: z.string().optional(),
				tourDate: z.date().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			// Check if the previous tour exists
			const previousTour = await ctx.db.query.previousTours.findFirst({
				where: eq(previousTours.id, input.previousTourId),
			});

			if (!previousTour) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Previous tour not found",
				});
			}

			// Only the tour owner can push reviews
			if (previousTour.ownerUserID !== ctx.session.user.id) {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only the tour owner can push reviews to guides",
				});
			}

			// Check if the guide exists
			const guide = await ctx.db.query.tourGuide.findFirst({
				where: eq(tourGuide.userID, input.guideId),
			});

			if (!guide) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tour guide not found",
				});
			}

			// Check if a review already exists for this tour
			const existingReview = await ctx.db.query.guidePerformanceReviews.findFirst({
				where: eq(guidePerformanceReviews.previousTourID, input.previousTourId),
			});

			if (existingReview) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "A review has already been pushed for this tour",
				});
			}

			// Insert the performance review
			await ctx.db.insert(guidePerformanceReviews).values({
				previousTourID: input.previousTourId,
				guideID: input.guideId,
				organizationID: ctx.session.user.id,
				summary: input.summary,
				strengths: input.strengths,
				improvements: input.improvements,
				sentimentScore: input.sentimentScore,
				rating: input.rating.toFixed(1), // Convert to string with 1 decimal
				redFlags: input.redFlags,
				tourName: input.tourName,
				tourLocation: input.tourLocation,
				tourDate: input.tourDate,
			});

			// Calculate new average rating for the guide
			const allReviews = await ctx.db.query.guidePerformanceReviews.findMany({
				where: eq(guidePerformanceReviews.guideID, input.guideId),
			});

			const totalRating = allReviews.reduce((sum, review) => sum + parseFloat(review.rating), 0);
			const averageRating = totalRating / allReviews.length;
			const roundedRating = Math.round(averageRating * 10) / 10;

			// Update the guide's rating and total reviews count
			await ctx.db
				.update(tourGuide)
				.set({ 
					averageRating: roundedRating.toFixed(1),
					totalReviews: allReviews.length,
				})
				.where(eq(tourGuide.userID, input.guideId));

			return { 
				success: true, 
				newRating: roundedRating,
				totalReviews: allReviews.length,
			};
		}),
});
