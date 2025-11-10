import { tags, tours, tourToTags, userToTours } from "~/server/db/schema/tour";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import z from "zod";
import { and, eq, or } from "drizzle-orm";

export const tourRouter = createTRPCRouter({
    getAccessibleTours: protectedProcedure.query(async ({ ctx }) => {
        const ownedTours = await ctx.db
            .select()
            .from(tours)
            .where(eq(tours.ownerUserID, ctx.session.user.id));

        const joinedToursData = await ctx.db
            .select({
                tour: tours,
                joinedAt: userToTours.joinedAt,
            })
            .from(userToTours)
            .innerJoin(tours, eq(userToTours.tourID, tours.id))
            .where(eq(userToTours.userID, ctx.session.user.id));

        return {
            ownedTours,
            joinedTours: joinedToursData.map(item => ({
                ...item.tour,
                joinedAt: item.joinedAt,
            })),
        };
    }),
    getTourById: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            // Check if user owns the tour
            const tour = await ctx.db
                .select()
                .from(tours)
                .where(
                    and(
                        eq(tours.id, input),
                        eq(tours.ownerUserID, ctx.session.user.id)
                    )
                )
                .limit(1);
            
            if (tour[0]) {
                return tour[0];
            }

            // If not owner, check if user has joined the tour
            const joinedTour = await ctx.db
                .select({
                    tour: tours,
                    joinedAt: userToTours.joinedAt,
                })
                .from(userToTours)
                .innerJoin(tours, eq(userToTours.tourID, tours.id))
                .where(
                    and(
                        eq(userToTours.tourID, input),
                        eq(userToTours.userID, ctx.session.user.id)
                    )
                )
                .limit(1);

            if (!joinedTour[0]) {
                throw new Error("Tour not found or unauthorized");
            }
            
            return {
                ...joinedTour[0].tour,
                joinedAt: joinedTour[0].joinedAt,
            };
        }),
    createTour: protectedProcedure
        .input(z.object({
            name: z.string(),
            description: z.string(),
            price: z.number(),
            location: z.string(),
            date: z.string().refine((date) => !isNaN(Date.parse(date)), {
                message: "Invalid date format",
            }),
            guideID: z.string().nullable(),
        })).mutation(async ({ ctx, input }) => {
            if(ctx.session.user.role !== "ORGANIZATION" && ctx.session.user.role !== "TOUR_GUIDE") {
                throw new Error("Unauthorized");
            }
            
            const newTour = await ctx.db.insert(tours).values({
                name: input.name,
                description: input.description,
                price: input.price,
                location: input.location,
                date: new Date(input.date),
                ownerUserID: ctx.session.user.id!,
                guideID: input.guideID,
            }).returning();
            return newTour;
        }),
    updateTour: protectedProcedure
        .input(z.object({
            id: z.string(),
            name: z.string().optional(),
            description: z.string().optional(),
            price: z.number().min(0).optional(),
            location: z.string().optional(),
            date: z.string().refine((date) => !isNaN(Date.parse(date)), {
                message: "Invalid date format",
            }).optional(),
            guideID: z.string().nullable().optional(),
        })).mutation(async ({ ctx, input }) => {
            if(ctx.session.user.role !== "ORGANIZATION" && ctx.session.user.role !== "TOUR_GUIDE") {
                throw new Error("Unauthorized");
            }
            
            const updatedTour = await ctx.db
                .update(tours)
                .set({
                    name: input.name,
                    description: input.description,
                    price: input.price,
                    location: input.location,
                    date: input.date ? new Date(input.date) : undefined,
                    guideID: input.guideID,
                })
                .where(
                    and(
                        eq(tours.id, input.id),
                        eq(tours.ownerUserID, ctx.session.user.id)
                    )
                )
                .returning();
            
            if (updatedTour.length === 0) {
                throw new Error("Tour not found or unauthorized");
            }
            
            return updatedTour[0];
        }),
    deleteTour: protectedProcedure
        .input(z.string())
        .mutation(async ({ ctx, input }) => {
            const deletedTour = await ctx.db.delete(tours).where(and(eq(tours.id, input), eq(tours.ownerUserID, ctx.session.user.id))).returning();
            if (deletedTour.length === 0) {
                throw new Error("Tour not found or unauthorized");
            }
            return deletedTour[0];
        }),
    getTags: protectedProcedure
        .input(z.string())
        .query(async ({ ctx, input }) => {
            // Check if user owns the tour
            const isOwner = await ctx.db
                .select({ id: tours.id })
                .from(tours)
                .where(
                    and(
                        eq(tours.id, input),
                        eq(tours.ownerUserID, ctx.session.user.id)
                    )
                )
                .limit(1);

            // If not owner, check if user has joined the tour
            if (isOwner.length === 0) {
                const hasJoined = await ctx.db
                    .select({ tourID: userToTours.tourID })
                    .from(userToTours)
                    .where(
                        and(
                            eq(userToTours.tourID, input),
                            eq(userToTours.userID, ctx.session.user.id)
                        )
                    )
                    .limit(1);

                if (hasJoined.length === 0) {
                    throw new Error("Tour not found or unauthorized");
                }
            }

            // User is authorized, get the tags
            const tourTags = await ctx.db
                .select({
                    id: tags.id,
                    name: tags.tags,
                })
                .from(tourToTags)
                .innerJoin(tags, eq(tourToTags.tagID, tags.id))
                .where(eq(tourToTags.tourID, input));

            return tourTags;
        })
});