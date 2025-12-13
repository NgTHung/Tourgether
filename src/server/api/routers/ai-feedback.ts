// server/routers/ai-feedback.ts
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { analyzeFeedback } from "~/lib/gemini";
import { processFileFromUrl, type ProcessedFile } from "~/lib/file-processor";

export const aiFeedbackRouter = createTRPCRouter({
  generateSummary: protectedProcedure
    .input(z.object({
      tourId: z.string(),
      fileUrls: z.array(z.string()).optional(), // List of S3 URLs (optional)
      feedbackTexts: z.array(z.string()).optional(), // Direct feedback texts (optional)
    }))
    .mutation(async ({ input }) => {
      const textContents: string[] = [];
      const imageContents: { base64: string; mimeType: string }[] = [];

      // 1. Process files from S3 URLs if provided
      if (input.fileUrls && input.fileUrls.length > 0) {
        const processedFiles = await Promise.all(
          input.fileUrls.map(async (url): Promise<ProcessedFile | null> => {
            try {
              return await processFileFromUrl(url);
            } catch (error) {
              console.error(`Failed to process file from ${url}:`, error);
              return null;
            }
          })
        );

        // Separate text and image content
        for (const file of processedFiles) {
          if (!file) continue;
          
          if (file.type === "text") {
            textContents.push(file.content);
          } else if (file.type === "image") {
            imageContents.push({
              base64: file.content,
              mimeType: file.mimeType,
            });
          }
        }
      }

      // 2. Add direct feedback texts if provided
      if (input.feedbackTexts && input.feedbackTexts.length > 0) {
        textContents.push(...input.feedbackTexts);
      }

      if (textContents.length === 0 && imageContents.length === 0) {
        throw new Error("No feedback content provided");
      }

      // 3. Send to Gemini with both text and images
      const analysis = await analyzeFeedback(textContents, imageContents);

      return analysis;
    }),
});