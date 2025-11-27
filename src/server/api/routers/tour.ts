import {
	itinerary,
	tags,
	tours,
	tourToTags,
	tourReviews,
	guiderAppliedTours,
} from "~/server/db/schema/tour";
import { user } from "~/server/db/schema/auth-schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import { z } from "zod/v4";
import { and, avg, eq, or, isNull, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
// import { zFilterState } from "~/components/FilterBar";

export const zFilterState = z.object({
  city: z.string(),
  dateRange: z
	.object({
	  from: z.union([z.date(), z.undefined()]),
	  to: z.date().optional(),
	})
	.optional(),
});

export const tourRouter = createTRPCRouter({
	getAccessibleTours: protectedProcedure
		.input(zFilterState)
		.query(async ({ ctx, input }) => {
			const availableTours = await ctx.db.query.tours.findMany({
				where: and(
					eq(tours.ownerUserID, ctx.session.user.id),
					ctx.session.user.role === "GUIDE"
						? or(
								isNull(tours.guideID),
								eq(tours.guideID, ctx.session.user.id),
							)
						: undefined,
					input.city ? eq(tours.location, input.city) : undefined,
					input.dateRange
						? and(
								input.dateRange.from
									? gte(
											tours.date,
											new Date(input.dateRange.from),
										)
									: undefined,
								input.dateRange.to
									? lte(
											tours.date,
											new Date(input.dateRange.to),
										)
									: undefined,
							)
						: undefined,
					eq(tours.status, "PENDING"),
				),
				with: {
					owner: {
						columns: {
							id: true,
							name: true,
							rating: true,
						},
					},
				},
			});
			return availableTours;
		}),
	getOwnedTours: protectedProcedure
		.input(zFilterState)
		.query(async ({ ctx, input }) => {
			const ownedTours = await ctx.db.query.tours.findMany({
				where: and(
					eq(tours.ownerUserID, ctx.session.user.id),
					input.city ? eq(tours.location, input.city) : undefined,
					input.dateRange
						? and(
								input.dateRange.from
									? gte(
											tours.date,
											new Date(input.dateRange.from),
										)
									: undefined,
								input.dateRange.to
									? lte(
											tours.date,
											new Date(input.dateRange.to),
										)
									: undefined,
							)
						: undefined,
					eq(tours.status, "PENDING"),
				),
			});
			return ownedTours;
		}),
	getCompletedTours: protectedProcedure.query(async ({ ctx }) => {
		const rows = await ctx.db.query.tours.findMany({
			where: and(
				eq(tours.ownerUserID, ctx.session.user.id),
				eq(tours.status, "COMPLETED"),
			),
			with: {
				guide: {
					columns: {},
					with: {
						user: {
							columns: {
								name: true,
							},
						},
					},
				},
				reviews: {
					with: {
						user: {},
					},
				},
			},
		});
		const completedTours = rows.map((tour) => {
			const rating =
				tour.reviews.length > 0
					? tour.reviews.reduce(
							(acc, review) => acc + review.rating,
							0,
						) / tour.reviews.length
					: null;
			const newTour = Object.assign({}, tour, { rating: rating });
			return newTour;
		});
		return completedTours;
	}),
	getTourById: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				shouldGetOwner: z.boolean().default(false),
				shouldGetGuide: z.boolean().default(false),
				shouldGetItineraries: z.boolean().default(false),
				shouldGetRatings: z.boolean().default(false),
				shouldGetTags: z.boolean().default(false),
			}),
		)
		.query(async ({ ctx, input }) => {
			const tour = await ctx.db.query.tours.findFirst({
				where: and(
					eq(tours.id, input.id),
					or(
						eq(tours.ownerUserID, ctx.session.user.id),
						eq(tours.guideID, ctx.session.user.id),
					),
				),
				with: {
					owner: input.shouldGetOwner ? true : undefined,
					guide: input.shouldGetGuide ? true : undefined,
					itineraries: input.shouldGetItineraries ? true : undefined,
				},
			});
			if (!tour) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tour not found or unauthorized",
				});
			}
			let averageRating: string | null = null;
			if (input.shouldGetRatings) {
				const avgResult = await ctx.db
					.select({
						average: avg(tourReviews.rating),
					})
					.from(tourReviews)
					.where(eq(tourReviews.tourID, input.id))
					.groupBy(tourReviews.tourID);
				averageRating = avgResult[0]?.average ?? null;
			}
			let tagings: string[] = [];
			if (input.shouldGetTags) {
				const rows = await ctx.db
					.select({
						id: tags.id,
						name: tags.tags,
					})
					.from(tourToTags)
					.innerJoin(tags, eq(tourToTags.tagID, tags.id))
					.where(eq(tourToTags.tourID, input.id));
				tagings = rows.map((tag) => tag.name);
			}
			return {
				tour: tour,
				averageRating: averageRating,
				tags: tagings,
			};
		}),
	createTour: protectedProcedure
		.input(
			z.object({
				name: z.string(),
				description: z.string(),
				price: z.number(),
				location: z.string(),
				date: z.string().refine((date) => !isNaN(Date.parse(date)), {
					message: "Invalid date format",
				}),
				guideID: z.string().nullable(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (
				ctx.session.user.role !== "ORGANIZATION" &&
				ctx.session.user.role !== "GUIDE"
			) {
				return new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only organizations or guides can create tours",
				});
			}

			const newTour = await ctx.db
				.insert(tours)
				.values({
					name: input.name,
					description: input.description,
					price: input.price,
					location: input.location,
					date: new Date(input.date),
					ownerUserID: ctx.session.user.id!,
					guideID: input.guideID,
					thumbnailUrl: "",
				})
				.returning();
			return newTour;
		}),
	updateTour: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				name: z.string().optional(),
				description: z.string().optional(),
				price: z.number().min(0).optional(),
				location: z.string().optional(),
				date: z
					.string()
					.refine((date) => !isNaN(Date.parse(date)), {
						message: "Invalid date format",
					})
					.optional(),
				guideID: z.string().nullable().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (
				ctx.session.user.role !== "ORGANIZATION" &&
				ctx.session.user.role !== "GUIDE"
			) {
				return new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only organizations or guides can create tours",
				});
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
						eq(tours.ownerUserID, ctx.session.user.id),
					),
				)
				.returning();

			if (updatedTour.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tour not found or unauthorized",
				});
			}

			return updatedTour[0];
		}),
	deleteTour: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			const deletedTour = await ctx.db
				.delete(tours)
				.where(
					and(
						eq(tours.id, input),
						eq(tours.ownerUserID, ctx.session.user.id),
					),
				)
				.returning();
			if (deletedTour.length === 0) {
				throw new TRPCError({
					code: "NOT_FOUND",
					message: "Tour not found or unauthorized",
				});
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
						eq(tours.ownerUserID, ctx.session.user.id),
					),
				)
				.limit(1);
			if (!isOwner[0]) {
				const isGuiding = await ctx.db
					.select({ id: tours.id })
					.from(tours)
					.where(
						and(
							eq(tours.id, input),
							eq(tours.guideID, ctx.session.user.id),
						),
					)
					.limit(1);
				if (!isGuiding[0]) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message: "Only tour owners or guides can view tags",
					});
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
		}),
	getIternaries: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			// Check if user owns the tour
			const isOwner = await ctx.db
				.select({ id: tours.id })
				.from(tours)
				.where(
					and(
						eq(tours.id, input),
						eq(tours.ownerUserID, ctx.session.user.id),
					),
				)
				.limit(1);
			if (!isOwner[0]) {
				const isGuiding = await ctx.db
					.select({ id: tours.id })
					.from(tours)
					.where(
						and(
							eq(tours.id, input),
							eq(tours.guideID, ctx.session.user.id),
						),
					)
					.limit(1);
				if (!isGuiding[0]) {
					throw new TRPCError({
						code: "UNAUTHORIZED",
						message:
							"Only tour owners or guides can view itineraries",
					});
				}
			}

			// User is authorized, get the itineraries
			const itineraries = await ctx.db
				.select()
				.from(itinerary)
				.where(eq(itinerary.ownTourID, input));

			return itineraries;
		}),
	addItinerary: protectedProcedure
		.input(
			z.object({
				ownTourID: z.string(),
				title: z.string(),
				description: z.string(),
				duration: z.number().int(),
				activities: z.number().int(),
				location: z.string(),
				time: z.iso.time(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (
				ctx.session.user.role !== "ORGANIZATION" &&
				ctx.session.user.role !== "GUIDE"
			) {
				return new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only organizations or guides can create tours",
				});
			}

			const newItinerary = await ctx.db
				.insert(itinerary)
				.values({
					ownTourID: input.ownTourID,
					title: input.title,
					description: input.description,
					duration: input.duration,
					activities: input.activities,
					location: input.location,
					time: input.time,
				})
				.returning();

			return newItinerary[0];
		}),
	getAppliedGuidesForTour: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "ORGANIZATION") {
				throw new TRPCError({
					code: "UNAUTHORIZED",
					message: "Only tour owners can view applied guides",
				});
			}
			const rows = await ctx.db
				.select()
				.from(tours)
				.where(eq(tours.id, input))
				.innerJoin(
					guiderAppliedTours,
					eq(tours.id, guiderAppliedTours.tourID),
				)
				.innerJoin(user, eq(guiderAppliedTours.guideID, user.id));
			const appliedGuides = rows.reduce<
				Map<string, { user: typeof user.$inferSelect; tours: number }>
			>((acc, row) => {
				if (row.guider_applied_tours?.guideID) {
					if (!acc.has(row.guider_applied_tours.guideID)) {
						acc.set(row.guider_applied_tours.guideID, {
							user: row.user,
							tours: 0,
						});
					}
					acc.get(row.guider_applied_tours.guideID)!.tours += 1;
				}
				return acc;
			}, new Map());

			return appliedGuides;
		}),
});
