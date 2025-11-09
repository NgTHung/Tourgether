import { pgTable, primaryKey, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const posts = pgTable("posts", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull()
})

export const likes = pgTable("likes", {
    userID: text("user_id").references(() => user.id, { onDelete: "cascade" }),
    postID: uuid("post_id").references(() => posts.id, { onDelete: "cascade" }),
}, (table) => [
    primaryKey({ columns: [table.userID, table.postID] })
])

export const comments = pgTable("comments", {
    id: uuid("id").primaryKey().defaultRandom(),
    userID: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    postID: uuid("post_id").notNull().references(() => posts.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
        .$onUpdate(() => /* @__PURE__ */ new Date())
        .notNull()
})