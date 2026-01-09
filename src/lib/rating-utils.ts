/**
 * Rating Conversion Utilities
 * 
 * Handles conversion between:
 * - Rating (1-5 scale, decimal)
 * - Sentiment Score (0-100 scale, integer)
 */

/**
 * Convert rating (1-5) to sentiment score (0-100)
 * Multiplies by 20 and ensures integer output
 */
export function ratingToSentimentScore(rating: number): number {
	return Math.round(rating * 20);
}

/**
 * Convert sentiment score (0-100) to rating (1-5)
 * Divides by 20 and clamps to valid range
 */
export function sentimentScoreToRating(sentimentScore: number): number {
	const rating = sentimentScore / 20;
	return Math.max(1, Math.min(5, Math.round(rating * 10) / 10));
}

/**
 * Ensure a number is a valid integer for database storage
 */
export function toInteger(value: number): number {
	return parseInt(value.toString());
}

/**
 * Convert rating to fixed decimal string for database storage
 */
export function ratingToDecimalString(rating: number): string {
	return rating.toFixed(1);
}

/**
 * Parse rating from database (string) to number
 * Handles both string and number inputs for flexibility
 */
export function parseRating(rating: string | number): number {
	const parsed = typeof rating === "string" ? parseFloat(rating) : rating;
	return Math.max(1, Math.min(5, parsed));
}
