import { GoogleGenerativeAI } from "@google/generative-ai"

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

export const analyzeFeedback = async (reviewsContent: string[]): Promise<FeedbackAnalysis> => {
    const combinedReviews = reviewsContent.join("\n\n--- NEXT REVIEW ---\n\n")

    const prompt = `
        You are a Senior Performance Analyst for a tourism recruitment platform.
            
        Here are ${reviewsContent.length} reviews from travelers for a specific Tour Guide.
        Your goal is to extract the "Producer Surplus" - the specific value the GUIDE added, separate from the tour logistics (bus, weather, itinerary).
    
        Analyze these reviews and output a JSON object with the following structure:
        {
            "summary": A professional executive summary of the guide's performance (3-4 sentences). Focus on soft skills and problem solving.",
            "sentiment_score": 0, // A score from 0 (Terrible) to 100 (Perfect)
            "strengths": ["Tag 1", "Tag 2", "Tag 3"], // Top 3 specific strengths (e.g., "Historical Knowledge", "Crisis Management")
            "improvements": "One constructive piece of advice for the guide to get better.",
            "red_flags": false // Boolean: set to true ONLY if there are safety concerns or harassment reported.
        }
        
        Here are the reviews:
        ${combinedReviews}
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();
        
        // 3. Return the parsed JSON
        return JSON.parse(text) as FeedbackAnalysis;
    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        throw new Error("Failed to analyze feedback");
    }
};