// server/routers/ai-feedback.ts
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { analyzeFeedback } from "~/lib/gemini";

export const aiFeedbackRouter = createTRPCRouter({
  generateSummary: protectedProcedure
    .input(z.object({
      tourId: z.string(),
      fileUrls: z.array(z.string()).optional(), // List of S3 URLs (optional)
      feedbackTexts: z.array(z.string()).optional(), // Direct feedback texts (optional)
    }))
    .mutation(async ({ input }) => {
      const allContents: string[] = [];

      // 1. Fetch file contents from S3 URLs if provided
      if (input.fileUrls && input.fileUrls.length > 0) {
        const fileContents = await Promise.all(
          input.fileUrls.map(async (url) => {
            try {
              const response = await fetch(url);
              return await response.text();
            } catch (error) {
              console.error(`Failed to fetch file from ${url}:`, error);
              return "";
            }
          })
        );
        allContents.push(...fileContents.filter(content => content.length > 0));
      }

      // 2. Add direct feedback texts if provided
      if (input.feedbackTexts && input.feedbackTexts.length > 0) {
        allContents.push(...input.feedbackTexts);
      }

      if (allContents.length === 0) {
        throw new Error("No feedback content provided");
      }

      // 3. Send to Gemini
      const analysis = await analyzeFeedback(allContents);

      return analysis;
    }),
});