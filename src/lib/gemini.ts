import { GoogleGenerativeAI, type Part } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: "application/json" }
});

export interface FeedbackAnalysis {
    summary: string;
    sentiment_score: number;
    strengths: string[];
    improvements: string;
    red_flags: boolean;
}

export interface ImageContent {
    base64: string;
    mimeType: string;
}

export const analyzeFeedback = async (
    reviewsContent: string[],
    imageContents: ImageContent[] = []
): Promise<FeedbackAnalysis> => {
    const combinedReviews = reviewsContent.join("\n\n--- NEXT REVIEW ---\n\n")

    const prompt = `
        You are a Senior Performance Analyst for a tourism recruitment platform.
            
        Here are ${reviewsContent.length} text reviews${imageContents.length > 0 ? ` and ${imageContents.length} image(s) containing feedback` : ""} from travelers for a specific Tour Guide.
        Your goal is to extract the "Producer Surplus" - the specific value the GUIDE added, separate from the tour logistics (bus, weather, itinerary).
    
        Analyze these reviews and output a JSON object with the following structure:
        {
            "summary": "A concise professional summary of the guide's performance (1-2 sentences max). Be brief and specific. Focus on soft skills and problem solving.",
            "sentiment_score": 0, // A score from 0 (Terrible) to 100 (Perfect)
            "strengths": ["Tag 1", "Tag 2", "Tag 3"], // Top 3 specific strengths (e.g., "Historical Knowledge", "Crisis Management")
            "improvements": "One brief constructive piece of advice for the guide to improve (1 sentence).",
            "red_flags": false // Boolean: set to true ONLY if there are safety concerns or harassment reported.
        }
        
        IMPORTANT: Keep the summary and improvements very concise and to the point.
        
        ${reviewsContent.length > 0 ? `Here are the text reviews:\n${combinedReviews}` : ""}
        ${imageContents.length > 0 ? "\nPlease also analyze any text or feedback visible in the attached images." : ""}
    `;

    try {
        // Build the content parts array
        const parts: Part[] = [{ text: prompt }];

        // Add image parts if any
        for (const image of imageContents) {
            parts.push({
                inlineData: {
                    data: image.base64,
                    mimeType: image.mimeType,
                },
            });
        }

        const result = await model.generateContent(parts);
        const response = result.response;
        const text = response.text();
        
        // 3. Return the parsed JSON
        const analysis = JSON.parse(text) as FeedbackAnalysis;
        console.log("[AI Feedback] Generated JSON:", JSON.stringify(analysis, null, 2));
        return analysis;
    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        throw new Error("Failed to analyze feedback");
    }
};