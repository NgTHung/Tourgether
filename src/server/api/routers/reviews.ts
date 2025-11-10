import { review, tourReviews, tours, userToTours } from "~/server/db/schema/tour";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import z from "zod";
import { and, eq, desc } from "drizzle-orm";

export const reviewRouter = createTRPCRouter({
    getUserReviews: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const reviews = await ctx.db
                .select()
                .from(review)
                .where(eq(review.toUserID, input))
                .orderBy(desc(review.createdAt));
            
            return reviews;
        }),

    getReviewsByUser: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const reviews = await ctx.db
                .select()
                .from(review)
                .where(eq(review.fromUserID, input))
                .orderBy(desc(review.createdAt));
            
            return reviews;
        }),

    createUserReview: protectedProcedure
        .input(z.object({
            toUserID: z.string(),
            points: z.number().int().min(1).max(100),
            reviewText: z.string().min(1).max(1000),
        }))
        .mutation(async ({ ctx, input }) => {
            if (input.toUserID === ctx.session.user.id) {
                throw new Error("Cannot review yourself");
            }
    
            const existingReview = await ctx.db
                .select()
                .from(review)
                .where(
                    and(
                        eq(review.fromUserID, ctx.session.user.id),
                        eq(review.toUserID, input.toUserID)
                    )
                )
                .limit(1);

            if (existingReview[0]) {
                throw new Error("You have already reviewed this user");
            }

            const newReview = await ctx.db
                .insert(review)
                .values({
                    fromUserID: ctx.session.user.id,
                    toUserID: input.toUserID,
                    points: input.points,
                    review: input.reviewText,
                })
                .returning();
            
            return newReview[0];
        }),

    updateUserReview: protectedProcedure
        .input(z.object({
            reviewID: z.string(),
            points: z.number().int().min(1).max(100).optional(),
            reviewText: z.string().min(1).max(1000).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const updatedReview = await ctx.db
                .update(review)
                .set({
                    points: input.points,
                    review: input.reviewText,
                })
                .where(
                    and(
                        eq(review.id, input.reviewID),
                        eq(review.fromUserID, ctx.session.user.id)
                    )
                )
                .returning();
            
            if (updatedReview.length === 0) {
                throw new Error("Review not found or unauthorized");
            }
            
            return updatedReview[0];
        }),

    deleteUserReview: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const deletedReview = await ctx.db
                .delete(review)
                .where(
                    and(
                        eq(review.id, input),
                        eq(review.fromUserID, ctx.session.user.id)
                    )
                )
                .returning();
            
            if (deletedReview.length === 0) {
                throw new Error("Review not found or unauthorized");
            }
            
            return deletedReview[0];
        }),

    
    getTourReviews: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const reviews = await ctx.db
                .select()
                .from(tourReviews)
                .where(eq(tourReviews.tourID, input))
                .orderBy(desc(tourReviews.createdAt));
            
            return reviews;
        }),

    getTourReviewsByUser: publicProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            const reviews = await ctx.db
                .select()
                .from(tourReviews)
                .where(eq(tourReviews.userID, input))
                .orderBy(desc(tourReviews.createdAt));
            
            return reviews;
        }),

    createTourReview: protectedProcedure
        .input(z.object({
            tourID: z.string(),
            rating: z.number().int().min(1).max(100),
            reviewText: z.string().min(1).max(1000),
        }))
        .mutation(async ({ ctx, input }) => {
    
            const [joinedTour] = await ctx.db
                .select()
                .from(userToTours)
                .where(
                    and(
                        eq(userToTours.tourID, input.tourID),
                        eq(userToTours.userID, ctx.session.user.id)
                    )
                )
                .limit(1);

            const [ownedTour] = await ctx.db
                .select()
                .from(tours)
                .where(
                    and(
                        eq(tours.id, input.tourID),
                        eq(tours.ownerUserID, ctx.session.user.id)
                    )
                )
                .limit(1);

            if (!joinedTour && !ownedTour) {
                throw new Error("You must join or own the tour to review it");
            }

            const existingReview = await ctx.db
                .select()
                .from(tourReviews)
                .where(
                    and(
                        eq(tourReviews.tourID, input.tourID),
                        eq(tourReviews.userID, ctx.session.user.id)
                    )
                )
                .limit(1);

            if (existingReview[0]) {
                throw new Error("You have already reviewed this tour");
            }

            const newReview = await ctx.db
                .insert(tourReviews)
                .values({
                    tourID: input.tourID,
                    userID: ctx.session.user.id,
                    rating: input.rating,
                    review: input.reviewText,
                })
                .returning();
            
            return newReview[0];
        }),

    updateTourReview: protectedProcedure
        .input(z.object({
            reviewID: z.string(),
            rating: z.number().int().min(1).max(100).optional(),
            reviewText: z.string().min(1).max(1000).optional(),
        }))
        .mutation(async ({ ctx, input }) => {
            const updatedReview = await ctx.db
                .update(tourReviews)
                .set({
                    rating: input.rating,
                    review: input.reviewText,
                })
                .where(
                    and(
                        eq(tourReviews.id, input.reviewID),
                        eq(tourReviews.userID, ctx.session.user.id)
                    )
                )
                .returning();
            
            if (updatedReview.length === 0) {
                throw new Error("Review not found or unauthorized");
            }
            
            return updatedReview[0];
        }),

    deleteTourReview: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const deletedReview = await ctx.db
                .delete(tourReviews)
                .where(
                    and(
                        eq(tourReviews.id, input),
                        eq(tourReviews.userID, ctx.session.user.id)
                    )
                )
                .returning();
            
            if (deletedReview.length === 0) {
                throw new Error("Review not found or unauthorized");
            }
            
            return deletedReview[0];
        }),
});
