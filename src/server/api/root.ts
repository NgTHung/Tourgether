import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { tourRouter } from "./routers/tour";
import { tourGuideRouter } from "./routers/tourGuide";
import { organizationRouter } from "./routers/organizations";
import { reviewRouter } from "./routers/reviews";
import { socialRouter } from "./routers/socialNetwork";
import { userRouter } from "./routers/users";
import { previousToursRouter } from "./routers/previousTours";
import { aiFeedbackRouter } from "./routers/ai-feedback";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
    tour: tourRouter,
    guide: tourGuideRouter,
    organization: organizationRouter,
    social: socialRouter,
    reviews: reviewRouter,
    user: userRouter,
    previousTours: previousToursRouter,
    aiFeedback: aiFeedbackRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
