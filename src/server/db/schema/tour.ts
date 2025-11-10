import { relations, sql } from "drizzle-orm";
import {
	pgTable,
	text,
	timestamp,
	integer,
	uuid,
	primaryKey,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const itinerary = pgTable("itinerary", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	location: text("location").notNull(),
	duration: integer("duration").notNull(),
	activities: integer("activities").notNull(),
	description: text("description").notNull(),
	ownTourID: uuid("own_tour_id").references(() => tours.id, {
		onDelete: "cascade",
	}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const itineraryRelations = relations(itinerary, ({ one }) => ({
	ownTours: one(tours, {
		fields: [itinerary.ownTourID],
		references: [tours.id],
	}),
}));

export const userRelations = relations(user, ({ many }) => ({
	tours: many(tours),
	joinedTours: many(userToTours),
	givenRatings: many(review, { relationName: "rater" }),
	receivedRatings: many(review, { relationName: "ratee" }),
	tourReviews: many(tourReviews),
}));

export const tours = pgTable("tours", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	description: text("description").notNull(),
	price: integer("price").notNull(),
	location: text("location").notNull(),
	date: timestamp("date").notNull(),
	ownerUserID: text("owner_user_id").references(() => user.id, {
		onDelete: "cascade",
	}),
	guideID: text("guide_id").references(() => tourGuide.userID, {
		onDelete: "set null",
	}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const toursRelations = relations(tours, ({ one, many }) => ({
	itineraries: many(itinerary),
	owner: one(user, { fields: [tours.ownerUserID], references: [user.id] }),
	joiners: many(userToTours),
	guide: one(tourGuide, {
		fields: [tours.guideID],
		references: [tourGuide.userID],
	}),
	tags: many(tourToTags),
	reviews: many(tourReviews),
}));

export const organizations = pgTable("organizations", {
	userID: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	taxID: integer("tax_id").notNull(),
	websiteURL: text("website_url").notNull(),
	slogan: text("slogan").notNull(),
});

export const organizationRelations = relations(organizations, ({ one }) => ({
	user: one(user, { fields: [organizations.userID], references: [user.id] }),
}));

export const tourGuide = pgTable("tour_guide", {
	userID: text("user_id")
		.primaryKey()
		.references(() => user.id, { onDelete: "cascade" }),
	school: text("school").notNull(),
	certificates: text("certs")
		.array()
		.default(sql`'{}'::text[]`),
	workExperience: text("work_exp")
		.array()
		.default(sql`'{}'::text[]`),
	description: text("description").notNull(),
});

export const tourGuideRelations = relations(tourGuide, ({ many, one }) => ({
	tags: many(guideToTags),
	tours: many(tours),
	user: one(user, { fields: [tourGuide.userID], references: [user.id] }),
}));

export const tags = pgTable("tags", {
	id: uuid("id").primaryKey().defaultRandom(),
	tags: text("tags").notNull(),
});

export const guideTagsRelations = relations(tags, ({ many }) => ({
	guide: many(guideToTags),
	tours: many(tourToTags),
}));

export const guideToTags = pgTable(
	"guide_to_tags",
	{
		guideID: text("guide_id").references(() => tourGuide.userID, {
			onDelete: "cascade",
		}),
		tagID: uuid("tag_id").references(() => tags.id, {
			onDelete: "cascade",
		}),
	},
	(table) => [primaryKey({ columns: [table.guideID, table.tagID] })],
);

export const guideToTagsRelations = relations(guideToTags, ({ one }) => ({
	guide: one(tourGuide, {
		fields: [guideToTags.guideID],
		references: [tourGuide.userID],
	}),
	tag: one(tags, { fields: [guideToTags.tagID], references: [tags.id] }),
}));

export const tourToTags = pgTable(
	"tour_to_tags",
	{
		tourID: uuid("tour_id").references(() => tours.id, {
			onDelete: "cascade",
		}),
		tagID: uuid("tag_id").references(() => tags.id, {
			onDelete: "cascade",
		}),
	},
	(table) => [primaryKey({ columns: [table.tourID, table.tagID] })],
);

export const tourToTagsRelations = relations(tourToTags, ({ one }) => ({
	tour: one(tours, { fields: [tourToTags.tourID], references: [tours.id] }),
	tag: one(tags, { fields: [tourToTags.tagID], references: [tags.id] }),
}));

export const userToTours = pgTable(
	"user_to_tours",
	{
		userID: text("user_id").references(() => user.id, {
			onDelete: "cascade",
		}),
		tourID: uuid("tour_id").references(() => tours.id, {
			onDelete: "cascade",
		}),
		joinedAt: timestamp("joined_at").defaultNow().notNull(),
	},
	(table) => [primaryKey({ columns: [table.userID, table.tourID] })],
);

export const userToToursRelations = relations(userToTours, ({ one }) => ({
	user: one(user, { fields: [userToTours.userID], references: [user.id] }),
	tour: one(tours, { fields: [userToTours.tourID], references: [tours.id] }),
}));

export const review = pgTable("reviews", {
	id: uuid("id").primaryKey().defaultRandom(),
	points: integer("points").notNull(),
	review: text("review").notNull(),
	fromUserID: text("from_user_id").references(() => user.id, {
		onDelete: "cascade",
	}),
	toUserID: text("to_user_id").references(() => user.id, {
		onDelete: "cascade",
	}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const reviewRelations = relations(review, ({ one }) => ({
	from: one(user, {
		fields: [review.fromUserID],
		references: [user.id],
		relationName: "rater",
	}),
	to: one(user, {
		fields: [review.toUserID],
		references: [user.id],
		relationName: "ratee",
	}),
}));

export const tourReviews = pgTable("tour_reviews", {
	id: uuid("id").primaryKey().defaultRandom(),
	tourID: uuid("tour_id").references(() => tours.id, { onDelete: "cascade" }),
	userID: text("user_id").references(() => user.id, { onDelete: "cascade" }),
	rating: integer("rating").notNull(),
	review: text("review").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
export const tourReviewsRelations = relations(tourReviews, ({ one }) => ({
	tour: one(tours, { fields: [tourReviews.tourID], references: [tours.id] }),
	user: one(user, { fields: [tourReviews.userID], references: [user.id] }),
}));
