import {
	pgTable,
	primaryKey,
	text,
	timestamp,
	uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import { relations } from "drizzle-orm/relations";

export const posts = pgTable("posts", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	content: text("content").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
export const postsRelations = relations(posts, ({ many }) => ({
	comments: many(comments),
	likes: many(likes),
}));

export const likes = pgTable(
	"likes",
	{
		userID: text("user_id").references(() => user.id, {
			onDelete: "cascade",
		}),
		postID: uuid("post_id").references(() => posts.id, {
			onDelete: "cascade",
		}),
	},
	(table) => [primaryKey({ columns: [table.userID, table.postID] })],
);
export const likesRelations = relations(likes, ({ one }) => ({
	user: one(user, { fields: [likes.userID], references: [user.id] }),
	post: one(posts, { fields: [likes.postID], references: [posts.id] }),
}));

export const comments = pgTable("comments", {
	id: uuid("id").primaryKey().defaultRandom(),
	userID: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	postID: uuid("post_id")
		.notNull()
		.references(() => posts.id, { onDelete: "cascade" }),
	content: text("content").notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});
export const commentsRelations = relations(comments, ({ one }) => ({
	user: one(user, { fields: [comments.userID], references: [user.id] }),
	post: one(posts, { fields: [comments.postID], references: [posts.id] }),
}));