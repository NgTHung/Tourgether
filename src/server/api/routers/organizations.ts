import {
	guiderAppliedTours,
	organizations,
	tours,
	tourGuide,
	tourLeaveRequests,
} from "~/server/db/schema/tour";
import { user } from "~/server/db/schema/auth-schema";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import z from "zod";
import { and, eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

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
	getMyOrganization: protectedProcedure.query(async ({ ctx }) => {
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
		.input(
			z.object({
				taxID: z.number().int().positive(),
				websiteURL: z.url().optional(),
				slogan: z.string().min(1).max(500).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "ORGANIZATION") {
				throw new Error(
					"Unauthorized: Only organizations can create organization profiles",
				);
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
		.input(
			z.object({
				taxID: z.number().int().positive().optional(),
				websiteURL: z.string().url().optional(),
				slogan: z.string().min(1).max(500).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "ORGANIZATION") {
				throw new Error(
					"Unauthorized: Only organizations can update profiles",
				);
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
	deleteOrganization: protectedProcedure.mutation(async ({ ctx }) => {
		if (ctx.session.user.role !== "ORGANIZATION") {
			throw new TRPCError({
				message: "Unauthorized: Only organizations can delete organization profiles",
				code: "UNAUTHORIZED",
			});
		}

		const deletedOrganization = await ctx.db
			.delete(organizations)
			.where(eq(organizations.userID, ctx.session.user.id))
			.returning();

		if (deletedOrganization.length === 0) {
			throw new TRPCError({ message: "Organization profile not found", code: "NOT_FOUND" });
		}

		return deletedOrganization[0];
	}),

	// Get all applicants for a specific tour
	getTourApplicants: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "ORGANIZATION") {
				throw new TRPCError({
					message: "Unauthorized: Only organizations can view applicants",
					code: "UNAUTHORIZED",
				});
			}

			// Verify the tour belongs to this organization
			const tour = await ctx.db
				.select()
				.from(tours)
				.where(
					and(
						eq(tours.id, input),
						eq(tours.ownerUserID, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!tour[0]) {
				throw new TRPCError({ message: "Tour not found or unauthorized", code: "NOT_FOUND" });
			}

			// Get all applicants with their guide profile and user info
			const applicants = await ctx.db
				.select({
					guideID: guiderAppliedTours.guideID,
					tourID: guiderAppliedTours.tourID,
					status: guiderAppliedTours.status,
					appliedAt: guiderAppliedTours.appliedAt,
					reviewedAt: guiderAppliedTours.reviewedAt,
					guide: {
						userID: tourGuide.userID,
						school: tourGuide.school,
						certificates: tourGuide.certificates,
						workExperience: tourGuide.workExperience,
						description: tourGuide.description,
						cvUrl: tourGuide.cvUrl,
					},
					user: {
						id: user.id,
						name: user.name,
						email: user.email,
						image: user.image,
					},
				})
				.from(guiderAppliedTours)
				.innerJoin(tourGuide, eq(guiderAppliedTours.guideID, tourGuide.userID))
				.innerJoin(user, eq(tourGuide.userID, user.id))
				.where(eq(guiderAppliedTours.tourID, input));

			return { tour: tour[0], applicants };
		}),

	// Approve a guide application
	approveGuiderApplication: protectedProcedure
		.input(
			z.object({
				tourID: z.string(),
				guideID: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "ORGANIZATION") {
				throw new TRPCError({
					message: "Unauthorized: Only organizations can approve guider applications",
					code: "UNAUTHORIZED",
				});
			}

			// Verify tour ownership and that no guide is assigned yet
			const tour = await ctx.db
				.select()
				.from(tours)
				.where(
					and(
						eq(tours.id, input.tourID),
						eq(tours.ownerUserID, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!tour[0]) {
				throw new TRPCError({ message: "Tour not found or unauthorized", code: "NOT_FOUND" });
			}

			if (tour[0].guideID !== null) {
				throw new TRPCError({ message: "This tour already has an approved guide", code: "CONFLICT" });
			}

			// Check if application exists and is pending
			const application = await ctx.db
				.select()
				.from(guiderAppliedTours)
				.where(
					and(
						eq(guiderAppliedTours.tourID, input.tourID),
						eq(guiderAppliedTours.guideID, input.guideID),
					),
				)
				.limit(1);

			if (!application[0]) {
				throw new TRPCError({ message: "Application not found", code: "NOT_FOUND" });
			}

			if (application[0].status !== "PENDING") {
				throw new TRPCError({ message: "Application has already been reviewed", code: "CONFLICT" });
			}

			// Update application status to APPROVED
			await ctx.db
				.update(guiderAppliedTours)
				.set({
					status: "APPROVED",
					reviewedAt: new Date(),
				})
				.where(
					and(
						eq(guiderAppliedTours.tourID, input.tourID),
						eq(guiderAppliedTours.guideID, input.guideID),
					),
				);

			// Assign the guide to the tour
			const updatedTour = await ctx.db
				.update(tours)
				.set({
					guideID: input.guideID,
				})
				.where(eq(tours.id, input.tourID))
				.returning();

			// Reject all other pending applications for this tour
			await ctx.db
				.update(guiderAppliedTours)
				.set({
					status: "REJECTED",
					reviewedAt: new Date(),
				})
				.where(
					and(
						eq(guiderAppliedTours.tourID, input.tourID),
						eq(guiderAppliedTours.status, "PENDING"),
					),
				);

			return updatedTour[0];
		}),

	// Reject a guide application
	rejectGuiderApplication: protectedProcedure
		.input(
			z.object({
				tourID: z.string(),
				guideID: z.string(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "ORGANIZATION") {
				throw new TRPCError({
					message: "Unauthorized: Only organizations can reject guider applications",
					code: "UNAUTHORIZED",
				});
			}

			// Verify tour ownership
			const tour = await ctx.db
				.select()
				.from(tours)
				.where(
					and(
						eq(tours.id, input.tourID),
						eq(tours.ownerUserID, ctx.session.user.id),
					),
				)
				.limit(1);

			if (!tour[0]) {
				throw new TRPCError({ message: "Tour not found or unauthorized", code: "NOT_FOUND" });
			}

			// Check if application exists and is pending
			const application = await ctx.db
				.select()
				.from(guiderAppliedTours)
				.where(
					and(
						eq(guiderAppliedTours.tourID, input.tourID),
						eq(guiderAppliedTours.guideID, input.guideID),
					),
				)
				.limit(1);

			if (!application[0]) {
				throw new TRPCError({ message: "Application not found", code: "NOT_FOUND" });
			}

			if (application[0].status !== "PENDING") {
				throw new TRPCError({ message: "Application has already been reviewed", code: "CONFLICT" });
			}

			// Update application status to REJECTED
			const updatedApplication = await ctx.db
				.update(guiderAppliedTours)
				.set({
					status: "REJECTED",
					reviewedAt: new Date(),
				})
				.where(
					and(
						eq(guiderAppliedTours.tourID, input.tourID),
						eq(guiderAppliedTours.guideID, input.guideID),
					),
				)
				.returning();

			return updatedApplication[0];
		}),

	// Get all leave requests for organization's tours
	getLeaveRequests: protectedProcedure.query(async ({ ctx }) => {
		if (ctx.session.user.role !== "ORGANIZATION") {
			throw new TRPCError({
				message: "Unauthorized: Only organizations can view leave requests",
				code: "UNAUTHORIZED",
			});
		}

		// Get all tours owned by this organization
		const orgTours = await ctx.db
			.select({ id: tours.id })
			.from(tours)
			.where(eq(tours.ownerUserID, ctx.session.user.id));

		const tourIds = orgTours.map((t) => t.id);

		if (tourIds.length === 0) {
			return [];
		}

		// Get leave requests for these tours with guide and tour info
		const requests = await ctx.db
			.select({
				id: tourLeaveRequests.id,
				tourID: tourLeaveRequests.tourID,
				guideID: tourLeaveRequests.guideID,
				reason: tourLeaveRequests.reason,
				status: tourLeaveRequests.status,
				organizationResponse: tourLeaveRequests.organizationResponse,
				criticismRating: tourLeaveRequests.criticismRating,
				criticismReason: tourLeaveRequests.criticismReason,
				createdAt: tourLeaveRequests.createdAt,
				reviewedAt: tourLeaveRequests.reviewedAt,
				tour: {
					id: tours.id,
					name: tours.name,
					date: tours.date,
				},
				guide: {
					userID: tourGuide.userID,
					school: tourGuide.school,
					description: tourGuide.description,
				},
				user: {
					id: user.id,
					name: user.name,
					email: user.email,
					image: user.image,
				},
			})
			.from(tourLeaveRequests)
			.innerJoin(tours, eq(tourLeaveRequests.tourID, tours.id))
			.innerJoin(tourGuide, eq(tourLeaveRequests.guideID, tourGuide.userID))
			.innerJoin(user, eq(tourGuide.userID, user.id))
			.where(eq(tours.ownerUserID, ctx.session.user.id))
			.orderBy(desc(tourLeaveRequests.createdAt));

		return requests;
	}),

	// Approve a leave request (guide leaves without penalty)
	approveLeaveRequest: protectedProcedure
		.input(
			z.object({
				requestID: z.string(),
				response: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "ORGANIZATION") {
				throw new TRPCError({
					message: "Unauthorized: Only organizations can approve leave requests",
					code: "UNAUTHORIZED",
				});
			}

			// Get the leave request
			const request = await ctx.db
				.select()
				.from(tourLeaveRequests)
				.innerJoin(tours, eq(tourLeaveRequests.tourID, tours.id))
				.where(eq(tourLeaveRequests.id, input.requestID))
				.limit(1);

			if (!request[0]) {
				throw new TRPCError({ message: "Leave request not found", code: "NOT_FOUND" });
			}

			if (request[0].tours.ownerUserID !== ctx.session.user.id) {
				throw new TRPCError({
					message: "You don't own this tour",
					code: "FORBIDDEN",
				});
			}

			if (request[0].tour_leave_requests.status !== "PENDING") {
				throw new TRPCError({
					message: "This request has already been reviewed",
					code: "CONFLICT",
				});
			}

			// Update the leave request
			await ctx.db
				.update(tourLeaveRequests)
				.set({
					status: "APPROVED",
					organizationResponse: input.response,
					reviewedAt: new Date(),
				})
				.where(eq(tourLeaveRequests.id, input.requestID));

			// Remove the guide from the tour
			await ctx.db
				.update(tours)
				.set({ guideID: null })
				.where(eq(tours.id, request[0].tour_leave_requests.tourID!));

			return { success: true };
		}),

	// Criticize a leave request (guide leaves with penalty)
	criticizeLeaveRequest: protectedProcedure
		.input(
			z.object({
				requestID: z.string(),
				criticismRating: z.number().min(1).max(5),
				criticismReason: z.string().min(10, "Reason must be at least 10 characters").max(500),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "ORGANIZATION") {
				throw new TRPCError({
					message: "Unauthorized: Only organizations can criticize leave requests",
					code: "UNAUTHORIZED",
				});
			}

			// Get the leave request
			const request = await ctx.db
				.select()
				.from(tourLeaveRequests)
				.innerJoin(tours, eq(tourLeaveRequests.tourID, tours.id))
				.where(eq(tourLeaveRequests.id, input.requestID))
				.limit(1);

			if (!request[0]) {
				throw new TRPCError({ message: "Leave request not found", code: "NOT_FOUND" });
			}

			if (request[0].tours.ownerUserID !== ctx.session.user.id) {
				throw new TRPCError({
					message: "You don't own this tour",
					code: "FORBIDDEN",
				});
			}

			if (request[0].tour_leave_requests.status !== "PENDING") {
				throw new TRPCError({
					message: "This request has already been reviewed",
					code: "CONFLICT",
				});
			}

			// Update the leave request with criticism
			await ctx.db
				.update(tourLeaveRequests)
				.set({
					status: "CRITICIZED",
					criticismRating: input.criticismRating,
					criticismReason: input.criticismReason,
					reviewedAt: new Date(),
				})
				.where(eq(tourLeaveRequests.id, input.requestID));

			// Remove the guide from the tour
			await ctx.db
				.update(tours)
				.set({ guideID: null })
				.where(eq(tours.id, request[0].tour_leave_requests.tourID!));

			// TODO: Update the guide's rating based on criticism
			// This could be done by averaging criticism ratings or adding a penalty

			return { success: true, criticismRating: input.criticismRating };
		}),

	// Reject a leave request (guide must stay on the tour)
	rejectLeaveRequest: protectedProcedure
		.input(
			z.object({
				requestID: z.string(),
				response: z.string().min(10, "Response must be at least 10 characters").max(500),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			if (ctx.session.user.role !== "ORGANIZATION") {
				throw new TRPCError({
					message: "Unauthorized: Only organizations can reject leave requests",
					code: "UNAUTHORIZED",
				});
			}

			// Get the leave request
			const request = await ctx.db
				.select()
				.from(tourLeaveRequests)
				.innerJoin(tours, eq(tourLeaveRequests.tourID, tours.id))
				.where(eq(tourLeaveRequests.id, input.requestID))
				.limit(1);

			if (!request[0]) {
				throw new TRPCError({ message: "Leave request not found", code: "NOT_FOUND" });
			}

			if (request[0].tours.ownerUserID !== ctx.session.user.id) {
				throw new TRPCError({
					message: "You don't own this tour",
					code: "FORBIDDEN",
				});
			}

			if (request[0].tour_leave_requests.status !== "PENDING") {
				throw new TRPCError({
					message: "This request has already been reviewed",
					code: "CONFLICT",
				});
			}

			// Update the leave request
			await ctx.db
				.update(tourLeaveRequests)
				.set({
					status: "REJECTED",
					organizationResponse: input.response,
					reviewedAt: new Date(),
				})
				.where(eq(tourLeaveRequests.id, input.requestID));

			return { success: true };
		}),
});
