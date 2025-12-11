"use client";
import { useState, use, useRef } from "react";
import {
	MapPin,
	Calendar,
	DollarSign,
	Star,
	Camera,
	BarChart3,
	MessageSquarePlus,
	ArrowLeft,
	Users,
	Upload,
	FileText,
	X,
	Sparkles,
	Loader2,
	RefreshCw,
	Trash2,
	Pencil,
	Check,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
	Dialog,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { useRouter } from "next/navigation";
import { useSession } from "~/components/AuthProvider";
import { api } from "~/trpc/react";
import { toast } from "sonner";

const formatter = new Intl.DateTimeFormat("en-US", {
	month: "2-digit",
	day: "2-digit",
	year: "numeric",
});

const PreviousTourDetail = ({ params }: { params: Promise<{ id: string }> }) => {
	const id = use(params).id;
	const router = useRouter();
	const [feedbackOpen, setFeedbackOpen] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
	const [isGeneratingAI, setIsGeneratingAI] = useState(false);
	const [aiGeneratedFeedback, setAiGeneratedFeedback] = useState<string | null>(null);
	const [isEditingTravelers, setIsEditingTravelers] = useState(false);
	const [editTravelersValue, setEditTravelersValue] = useState<string>("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const {
		data: session,
	} = useSession();

	const [tourData, { refetch }] = api.previousTours.getPreviousTourById.useSuspenseQuery(id);

	const deleteFeedbackMutation = api.previousTours.deleteFeedback.useMutation({
		onSuccess: () => {
			toast.success("Feedback deleted successfully");
			void refetch();
		},
		onError: (error) => {
			toast.error(error.message ?? "Failed to delete feedback");
		},
	});

	const updateTravelersMutation = api.previousTours.updateTotalTravelers.useMutation({
		onSuccess: () => {
			toast.success("Total travelers updated");
			setIsEditingTravelers(false);
			void refetch();
		},
		onError: (error) => {
			toast.error(error.message ?? "Failed to update total travelers");
		},
	});

	const handleSaveTravelers = () => {
		const value = parseInt(editTravelersValue, 10);
		if (isNaN(value) || value < 0) {
			toast.error("Please enter a valid number");
			return;
		}
		updateTravelersMutation.mutate({
			previousTourId: id,
			totalTravelers: value,
		});
	};

	const handleStartEditTravelers = () => {
		setEditTravelersValue(String(tourData.totalTravelers ?? 0));
		setIsEditingTravelers(true);
	};

	const userRole = session?.user?.role ?? "GUIDE";
	const isOwner = tourData.ownerUserID === session?.user?.id;

	// File upload handlers
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files ?? []);
		const validFiles = files.filter((file) => {
			const validTypes = [
				"application/pdf",
				"text/plain",
				"application/msword",
				"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				"image/jpeg",
				"image/png",
			];
			return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
		});
		setUploadedFiles((prev) => [...prev, ...validFiles]);
	};

	const removeFile = (index: number) => {
		setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const getFileIcon = (file: File) => {
		if (file.type.startsWith("image/")) return "🖼️";
		if (file.type === "application/pdf") return "📄";
		if (file.type.includes("word")) return "📝";
		return "📎";
	};

	// AI Feedback Generation (placeholder)
	const handleGenerateAIFeedback = async () => {
		if (uploadedFiles.length === 0 && tourData.feedbacks?.length === 0) {
			toast.error("Please upload feedback files or ensure there are existing feedbacks");
			return;
		}

		setIsGeneratingAI(true);
		// TODO: Integrate with Gemini API
		// This is a placeholder that simulates the API call
		await new Promise((resolve) => setTimeout(resolve, 2000));
		
		setAiGeneratedFeedback(
			`Based on the ${tourData.feedbacks?.length ?? 0} feedback(s) and ${uploadedFiles.length} uploaded file(s), here's the AI-generated summary:\n\n` +
			`**Overall Performance:** Excellent\n` +
			`**Key Highlights:**\n` +
			`• Professional tour guidance with strong communication skills\n` +
			`• Well-organized itinerary that met expectations\n` +
			`• Positive customer experiences noted across all feedback sources\n\n` +
			`**Areas for Improvement:**\n` +
			`• Consider providing more detailed historical context\n` +
			`• Time management could be optimized for photo stops\n\n` +
			`**Recommendation:** This tour demonstrates high quality service and is recommended for future assignments.`
		);
		setIsGeneratingAI(false);
		toast.success("AI feedback generated successfully!");
	};

	const StarRating = ({
		rating,
		onRatingChange,
		interactive = false,
	}: {
		rating: number;
		onRatingChange?: (rating: number) => void;
		interactive?: boolean;
	}) => {
		return (
			<div className="flex gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star
						key={star}
						className={`w-5 h-5 ${
							star <= rating
								? "fill-yellow-400 text-yellow-400"
								: "text-gray-300"
						} ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
						onClick={interactive ? () => onRatingChange?.(star) : undefined}
					/>
				))}
			</div>
		);
	};

	return (
		<>
			{/* Hero Image */}
			<div className="relative h-72 w-full overflow-hidden">
				<img
					src={tourData.thumbnailUrl}
					alt={tourData.name}
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
				<Badge className="absolute top-4 left-4 bg-green-600 text-white">
					Completed
				</Badge>
			</div>

			<main className="container mx-auto py-8 px-4 -mt-20 relative z-10">
				{/* Back Button */}
				<Button
					variant="ghost"
					onClick={() => router.back()}
					className="mb-4"
				>
					<ArrowLeft className="w-4 h-4 mr-2" />
					Back
				</Button>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Tour Header */}
						<Card>
							<CardContent className="p-6">
								<div className="flex items-start justify-between mb-4">
									<div>
										<h1 className="text-3xl font-bold mb-2">
											{tourData.name}
										</h1>
										<p className="text-muted-foreground">
											Completed on {formatter.format(tourData.completedAt)}
										</p>
									</div>
									<Badge className="text-base">
										<Star className="w-4 h-4 mr-1 fill-accent text-accent" />
										{tourData.averageRating ?? "N/A"}
									</Badge>
								</div>

								<div className="grid md:grid-cols-3 gap-4">
									<div className="flex items-center text-muted-foreground">
										<MapPin className="w-5 h-5 mr-2 text-primary" />
										<span>{tourData.location}</span>
									</div>
									<div className="flex items-center text-muted-foreground">
										<Calendar className="w-5 h-5 mr-2 text-primary" />
										<span>{formatter.format(tourData.date)}</span>
									</div>
									<div className="flex items-center text-muted-foreground">
										<Users className="w-5 h-5 mr-2 text-primary" />
										<span>Guide: {tourData.guideName ?? "N/A"}</span>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Photo Gallery */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<Camera className="w-5 h-5" />
									Photo Gallery
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
									{(tourData.galleries ?? []).map((image, index) => (
										<div
											key={index}
											className="relative aspect-video rounded-lg overflow-hidden"
										>
											<img
												src={image}
												alt={`Tour photo ${index + 1}`}
												className="w-full h-full object-cover"
											/>
										</div>
									))}
								</div>
							</CardContent>
						</Card>

						{/* About This Tour */}
						<Card>
							<CardHeader>
								<CardTitle>About This Tour</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-muted-foreground leading-relaxed">
									{tourData.description}
								</p>
							</CardContent>
						</Card>

						{/* Feedbacks Section */}
						<Card>
							<CardHeader>
								<CardTitle>
									Feedbacks ({tourData.feedbacks?.length ?? 0})
								</CardTitle>
							</CardHeader>
							<CardContent>
								{tourData.feedbacks && tourData.feedbacks.length > 0 ? (
									<div className="space-y-4">
										{tourData.feedbacks.map((feedback) => {
											const canDelete = isOwner || feedback.user?.id === session?.user?.id;
											return (
												<div
													key={feedback.id}
													className="flex gap-4 p-4 border rounded-lg"
												>
													<Avatar className="w-10 h-10">
														<AvatarImage
															src={feedback.user?.image ?? undefined}
														/>
														<AvatarFallback>
															{feedback.user?.name?.[0] ?? "U"}
														</AvatarFallback>
													</Avatar>
													<div className="flex-1">
														<div className="flex items-center gap-2 mb-1">
															<span className="font-medium">
																{feedback.user?.name ?? "Anonymous"}
															</span>
															<StarRating rating={feedback.rating} />
														</div>
														<p className="text-muted-foreground text-sm">
															{feedback.feedback}
														</p>
														<p className="text-xs text-muted-foreground mt-2">
															{formatter.format(feedback.createdAt)}
														</p>
													</div>
													{canDelete && (
														<Button
															variant="ghost"
															size="icon"
															className="h-8 w-8 text-muted-foreground hover:text-destructive"
															onClick={() => deleteFeedbackMutation.mutate(feedback.id)}
															disabled={deleteFeedbackMutation.isPending}
														>
															<Trash2 className="w-4 h-4" />
														</Button>
													)}
												</div>
											);
										})}
									</div>
								) : (
									<p className="text-muted-foreground text-center py-8">
										No feedbacks yet. Be the first to add one!
									</p>
								)}
							</CardContent>
						</Card>
					</div>

					{/* Sidebar - Analytics Card */}
					<div className="lg:col-span-1 space-y-6">
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<BarChart3 className="w-5 h-5" />
									Tour Analytics
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-4">
									<div className="flex justify-between items-center">
										<span className="text-muted-foreground">Price</span>
										<div className="flex items-center font-semibold">
											<DollarSign className="w-4 h-4" />
											{tourData.price}
										</div>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-muted-foreground">Total Travelers</span>
										{isEditingTravelers ? (
											<div className="flex items-center gap-1">
												<Input
													type="number"
													min="0"
													value={editTravelersValue}
													onChange={(e) => setEditTravelersValue(e.target.value)}
													className="w-20 h-7 text-right text-sm"
												/>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-green-600 hover:text-green-700"
													onClick={handleSaveTravelers}
													disabled={updateTravelersMutation.isPending}
												>
													<Check className="w-4 h-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="h-7 w-7 text-muted-foreground hover:text-destructive"
													onClick={() => setIsEditingTravelers(false)}
												>
													<X className="w-4 h-4" />
												</Button>
											</div>
										) : (
											<div className="flex items-center gap-1">
												<span className="font-semibold">
													{tourData.totalTravelers ?? 0}
												</span>
												{isOwner && (
													<Button
														variant="ghost"
														size="icon"
														className="h-6 w-6 text-muted-foreground hover:text-primary"
														onClick={handleStartEditTravelers}
													>
														<Pencil className="w-3 h-3" />
													</Button>
												)}
											</div>
										)}
									</div>
									<div className="flex justify-between items-center">
										<span className="text-muted-foreground">Average Rating</span>
										<div className="flex items-center gap-1">
											<Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
											<span className="font-semibold">
												{tourData.averageRating ?? "N/A"}
											</span>
										</div>
									</div>
									<div className="flex justify-between items-center">
										<span className="text-muted-foreground">Feedbacks</span>
										<span className="font-semibold">
											{tourData.feedbacks?.length ?? 0}
										</span>
									</div>
								</div>

								<div className="pt-4 border-t">
									<Button variant="outline" className="w-full mb-3">
										<BarChart3 className="w-4 h-4 mr-2" />
										View Full Analytics
									</Button>
									{userRole === "ORGANIZATION" && isOwner && (
										<Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
											<DialogTrigger asChild>
												<Button variant="gradient" className="w-full">
													<MessageSquarePlus className="w-4 h-4 mr-2" />
													Upload Feedback
												</Button>
											</DialogTrigger>
										</Dialog>
									)}
								</div>
							</CardContent>
						</Card>

						{/* AI-Generated Feedback Summary Section */}
						{userRole === "ORGANIZATION" && isOwner && (
							<Card className="border-2 border-dashed border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-base">
										<Sparkles className="w-5 h-5 text-primary" />
										AI Feedback Summary
										<Badge variant="secondary" className="ml-auto text-xs">
											Beta
										</Badge>
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<p className="text-xs text-muted-foreground">
										Upload feedback documents and use AI to generate a comprehensive summary.
									</p>

									{/* File Upload for AI Analysis */}
									<div
										onClick={() => fileInputRef.current?.click()}
										className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-3 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
									>
										<Upload className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
										<p className="text-xs">Drop files or click to upload</p>
										<input
											ref={fileInputRef}
											type="file"
											multiple
											accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
											onChange={handleFileSelect}
											className="hidden"
										/>
									</div>

									{/* Uploaded Files for AI */}
									{uploadedFiles.length > 0 && (
										<div className="flex flex-wrap gap-1">
											{uploadedFiles.map((file, index) => (
												<Badge
													key={index}
													variant="outline"
													className="flex items-center gap-1 py-0.5 text-xs"
												>
													<span>{getFileIcon(file)}</span>
													<span className="max-w-[60px] truncate">
														{file.name}
													</span>
													<button
														onClick={() => removeFile(index)}
														className="ml-1 hover:text-destructive"
													>
														<X className="h-3 w-3" />
													</button>
												</Badge>
											))}
										</div>
									)}

									{/* Generate Button */}
									<Button
										variant="gradient"
										className="w-full"
										size="sm"
										onClick={handleGenerateAIFeedback}
										disabled={isGeneratingAI}
									>
										{isGeneratingAI ? (
											<>
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												Analyzing...
											</>
										) : (
											<>
												<Sparkles className="w-4 h-4 mr-2" />
												Generate Summary
											</>
										)}
									</Button>

									{/* AI Generated Result */}
									{aiGeneratedFeedback && (
										<div className="space-y-2">
											<div className="flex items-center justify-between">
												<Label className="text-xs font-medium flex items-center gap-1">
													<FileText className="w-3 h-3" />
													Summary
												</Label>
												<Button
													variant="ghost"
													size="sm"
													className="h-6 px-2 text-xs"
													onClick={handleGenerateAIFeedback}
													disabled={isGeneratingAI}
												>
													<RefreshCw className={`w-3 h-3 mr-1 ${isGeneratingAI ? "animate-spin" : ""}`} />
													Redo
												</Button>
											</div>
											<div className="p-3 bg-muted/50 rounded-lg border max-h-48 overflow-y-auto">
												<div className="prose prose-sm dark:prose-invert max-w-none">
													{aiGeneratedFeedback.split("\n").map((line, index) => (
														<p key={index} className="text-xs mb-1 last:mb-0">
															{line.startsWith("**") ? (
																<strong>{line.replace(/\*\*/g, "")}</strong>
															) : line.startsWith("•") ? (
																<span className="pl-2">{line}</span>
															) : (
																line
															)}
														</p>
													))}
												</div>
											</div>
											<div className="flex gap-2">
												<Button variant="outline" size="sm" className="flex-1 text-xs h-7">
													<FileText className="w-3 h-3 mr-1" />
													Export PDF
												</Button>
												<Button variant="outline" size="sm" className="flex-1 text-xs h-7">
													Save
												</Button>
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</main>
		</>
	);
};

export default PreviousTourDetail;
