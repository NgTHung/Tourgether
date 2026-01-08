import { posts, likes, comments } from "~/server/db/schema/social-media";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "../trpc";
import z from "zod";
import { and, eq, desc, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const socialRouter = createTRPCRouter({
	getAllPosts: publicProcedure
		.input(
			z
				.object({
					limit: z.number().min(1).max(100).default(20),
					offset: z.number().min(0).default(0),
				})
				.optional(),
		)
		.query(async ({ ctx, input }) => {
			const { limit = 20, offset = 0 } = input ?? {};

			const postsList = await ctx.db.query.posts.findMany({
				orderBy: (post) => [desc(post.createdAt)],
				limit: limit,
				offset: offset,
				with: {
					postedBy: {
						columns: { id: true, name: true, image: true },
					},
				},
				extras: {
					likesCount: sql`(SELECT COUNT(*) FROM "likes" WHERE "likes"."post_id" = "posts"."id")`.as("likesCount"),
					commentsCount: sql`(SELECT COUNT(*) FROM "comments" WHERE "comments"."post_id" = "posts"."id")`.as("commentsCount"),
					likedByCurrentUser: sql`(SELECT EXISTS(SELECT 1 FROM "likes" WHERE "likes"."post_id" = "posts"."id" AND "likes"."user_id" = ${ctx.session?.user.id ?? ""}))`.as("likedByCurrentUser"),
				}
			});
			return postsList;
		}),

	getPostById: publicProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const post = await ctx.db
				.select()
				.from(posts)
				.where(eq(posts.id, input))
				.limit(1);

			if (!post[0]) {
				throw new TRPCError({ message: "Post not found", code: "NOT_FOUND" });
			}

			return post[0];
		}),

	createPost: protectedProcedure
		.input(
			z.object({
				content: z.string().min(1).max(5000),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const newPost = await ctx.db
				.insert(posts)
				.values({
					content: input.content,
					postedById: ctx.session.user.id,

				})
				.returning();

			return newPost[0];
		}),

	updatePost: protectedProcedure
		.input(
			z.object({
				postID: z.string(),
				content: z.string().min(1).max(5000).optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const updatedPost = await ctx.db
				.update(posts)
				.set({
					content: input.content,
				})
				.where(eq(posts.id, input.postID))
				.returning();

			if (updatedPost.length === 0) {
				throw new TRPCError({ message: "Post not found", code: "NOT_FOUND" });
			}

			return updatedPost[0];
		}),

	deletePost: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			const deletedPost = await ctx.db
				.delete(posts)
				.where(eq(posts.id, input))
				.returning();

			if (deletedPost.length === 0) {
				throw new TRPCError({ message: "Post not found", code: "NOT_FOUND" });
			}

			return deletedPost[0];
		}),

	getPostLikes: publicProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const likesCount = await ctx.db.$count(likes, eq(likes.postID, input));

			return {
				postID: input,
				likesCount: Number(likesCount),
			};
		}),

	hasUserLikedPost: protectedProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const like = await ctx.db
				.select()
				.from(likes)
				.where(
					and(
						eq(likes.postID, input),
						eq(likes.userID, ctx.session.user.id),
					),
				)
				.limit(1);

			return {
				postID: input,
				hasLiked: like.length > 0,
			};
		}),

	likePost: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			const post = await ctx.db
				.select()
				.from(posts)
				.where(eq(posts.id, input))
				.limit(1);

			if (!post[0]) {
				throw new TRPCError({ message: "Post not found", code: "NOT_FOUND" });
			}

			const existingLike = await ctx.db
				.select()
				.from(likes)
				.where(
					and(
						eq(likes.postID, input),
						eq(likes.userID, ctx.session.user.id),
					),
				)
				.limit(1);

			if (existingLike[0]) {
				await ctx.db
					.delete(likes)
					.where(
						and(
							eq(likes.postID, input),
							eq(likes.userID, ctx.session.user.id),
						),
					);
			} else {
				await ctx.db.insert(likes).values({
					postID: input,
					userID: ctx.session.user.id,
				});
			}

			return { success: true, postID: input };
		}),

	unlikePost: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			await ctx.db
				.delete(likes)
				.where(
					and(
						eq(likes.postID, input),
						eq(likes.userID, ctx.session.user.id),
					),
				);

			return { success: true, postID: input };
		}),

	getPostComments: publicProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const commentsList = await ctx.db
				.select()
				.from(comments)
				.where(eq(comments.postID, input))
				.orderBy(desc(comments.createdAt));

			return commentsList;
		}),

	getCommentById: publicProcedure
		.input(z.string())
		.query(async ({ ctx, input }) => {
			const comment = await ctx.db
				.select()
				.from(comments)
				.where(eq(comments.id, input))
				.limit(1);

			if (!comment[0]) {
				throw new TRPCError({ message: "Comment not found", code: "NOT_FOUND" });
			}

			return comment[0];
		}),

	createComment: protectedProcedure
		.input(
			z.object({
				postID: z.string(),
				content: z.string().min(1).max(1000),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const post = await ctx.db
				.select()
				.from(posts)
				.where(eq(posts.id, input.postID))
				.limit(1);

			if (!post[0]) {
				throw new TRPCError({ message: "Post not found", code: "NOT_FOUND" });
			}

			const newComment = await ctx.db
				.insert(comments)
				.values({
					postID: input.postID,
					userID: ctx.session.user.id,
					content: input.content,
				})
				.returning();

			return newComment[0];
		}),

	updateComment: protectedProcedure
		.input(
			z.object({
				commentID: z.string(),
				content: z.string().min(1).max(1000),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			const updatedComment = await ctx.db
				.update(comments)
				.set({
					content: input.content,
				})
				.where(
					and(
						eq(comments.id, input.commentID),
						eq(comments.userID, ctx.session.user.id),
					),
				)
				.returning();

			if (updatedComment.length === 0) {
				throw new TRPCError({ message: "Comment not found or unauthorized", code: "NOT_FOUND" });
			}

			return updatedComment[0];
		}),

	deleteComment: protectedProcedure
		.input(z.string())
		.mutation(async ({ ctx, input }) => {
			const deletedComment = await ctx.db
				.delete(comments)
				.where(
					and(
						eq(comments.id, input),
						eq(comments.userID, ctx.session.user.id),
					),
				)
				.returning();

			if (deletedComment.length === 0) {
				throw new TRPCError({ message: "Comment not found or unauthorized", code: "NOT_FOUND" });
			}

			return deletedComment[0];
		}),
});
