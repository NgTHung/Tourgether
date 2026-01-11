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
	AlertTriangle,
	Pencil,
	UserPlus,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
	Dialog,
	DialogTrigger,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { useRouter } from "next/navigation";
import { useSession } from "~/components/AuthProvider";
import { api } from "~/trpc/react";
import { toast } from "sonner";
import { getPresignedUrl } from "~/actions/upload";
import type { FeedbackAnalysis } from "~/lib/gemini";
import { ratingToSentimentScore, sentimentScoreToRating, toInteger, parseRating } from "~/lib/rating-utils";
import ReactMarkdown from "react-markdown";
import Image from "next/image";

const formatter = new Intl.DateTimeFormat("en-US", {
	day: "2-digit",
	month: "2-digit",
	year: "numeric",
});

const PreviousTourDetail = ({ params }: { params: Promise<{ id: string }> }) => {
	const id = use(params).id;
	const router = useRouter();
	const [feedbackOpen, setFeedbackOpen] = useState(false);
	const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
	const [isGeneratingAI, setIsGeneratingAI] = useState(false);
	const [aiGeneratedFeedback, setAiGeneratedFeedback] = useState<FeedbackAnalysis | null>(null);
	const [activeTab, setActiveTab] = useState("details");
	const [editDialogOpen, setEditDialogOpen] = useState(false);
	const [editTotalTravelers, setEditTotalTravelers] = useState<number>(0);
	const [isDraggingFile, setIsDraggingFile] = useState(false);
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const {
		data: session,
	} = useSession();

	const [tourData, { refetch }] = api.previousTours.getPreviousTourById.useSuspenseQuery(id);

	const generateAIMutation = api.aiFeedback.generateSummary.useMutation({
		onSuccess: (data) => {
			setAiGeneratedFeedback(data);
			toast.success("AI feedback generated successfully!");
		},
		onError: (error) => {
			toast.error(error.message ?? "Failed to generate AI feedback");
		},
	});

	const deleteFeedbackMutation = api.previousTours.deleteFeedback.useMutation({
		onSuccess: () => {
			toast.success("Feedback deleted successfully");
			void refetch();
		},
		onError: (error) => {
			toast.error(error.message ?? "Failed to delete feedback");
		},
	});

	const deleteTourMutation = api.previousTours.deletePreviousTour.useMutation({
		onSuccess: () => {
			toast.success("Previous tour deleted successfully");
			router.push("/previous-tours");
		},
		onError: (error) => {
			toast.error(error.message ?? "Failed to delete tour");
		},
	});

	const addFeedbackMutation = api.previousTours.addFeedback.useMutation({
		onSuccess: () => {
			toast.success("AI summary pushed to feedbacks successfully!");
			void refetch();
		},
		onError: (error) => {
			toast.error(error.message ?? "Failed to push feedback");
		},
	});

	const updateTotalTravelersMutation = api.previousTours.updateTotalTravelers.useMutation({
		onSuccess: () => {
			toast.success("Total travelers updated successfully!");
			setEditDialogOpen(false);
			void refetch();
		},
		onError: (error) => {
			toast.error(error.message ?? "Failed to update total travelers");
		},
	});

	const pushReviewToGuideMutation = api.previousTours.pushReviewToGuide.useMutation({
		onSuccess: (data) => {
			toast.success(`Review pushed to guide's profile! New rating: ${data.newRating} (${data.totalReviews} reviews)`);
			void refetch();
		},
		onError: (error) => {
			toast.error(error.message ?? "Failed to push review to guide");
		},
	});

	const handleOpenEditDialog = () => {
		setEditTotalTravelers(tourData.totalTravelers ?? 0);
		setEditDialogOpen(true);
	};

	const handleSaveTotalTravelers = () => {
		updateTotalTravelersMutation.mutate({
			previousTourId: id,
			totalTravelers: editTotalTravelers,
		});
	};

	const handlePushAIFeedback = () => {
		if (!aiGeneratedFeedback) return;
		
		// Create a formatted feedback from the AI summary with clear sections
		const feedbackText = `📊 **AI-Generated Summary**

${aiGeneratedFeedback.summary}

✅ **Strengths:**
${aiGeneratedFeedback.strengths.map(s => `• ${s}`).join("\n")}

💡 **Areas for Improvement:**
${aiGeneratedFeedback.improvements}

📈 Sentiment Score: ${aiGeneratedFeedback.sentiment_score}/100${aiGeneratedFeedback.red_flags ? "\n\n⚠️ Red Flags Detected" : ""}`;
		
		// Use the sentiment score to determine rating (convert from 0-100 to 1-5)
		const rating = Math.max(1, Math.min(5, Math.round(aiGeneratedFeedback.sentiment_score / 20)));
		
		addFeedbackMutation.mutate({
			previousTourId: id,
			rating,
			feedback: feedbackText,
		});
	};

	const handlePushReviewToGuide = () => {
		if (!aiGeneratedFeedback) return;
		if (!tourData.guideID) {
			toast.error("No guide assigned to this tour");
			return;
		}
		
		// Convert sentiment score (0-100) to rating (1-5)
		const rating = sentimentScoreToRating(aiGeneratedFeedback.sentiment_score);
		
		pushReviewToGuideMutation.mutate({
			previousTourId: id,
			guideId: tourData.guideID,
			summary: aiGeneratedFeedback.summary,
			strengths: aiGeneratedFeedback.strengths,
			improvements: aiGeneratedFeedback.improvements,
			sentimentScore: toInteger(aiGeneratedFeedback.sentiment_score),
			rating,
			redFlags: aiGeneratedFeedback.red_flags ? 1 : 0,
			tourName: tourData.name,
			tourLocation: tourData.location ?? undefined,
			tourDate: tourData.date ?? undefined,
		});
	};

	const handlePushFeedbackToGuide = (feedback: { rating: string | number; feedback: string }) => {
		if (!tourData.guideID) {
			toast.error("No guide assigned to this tour");
			return;
		}
		
		// Parse rating from string (database decimal) to number
		const ratingNum = parseRating(feedback.rating);
		
		// Convert rating (1-5) to sentiment score (0-100) as integer
		const sentimentScore = ratingToSentimentScore(ratingNum);
		
		pushReviewToGuideMutation.mutate({
			previousTourId: id,
			guideId: tourData.guideID,
			summary: feedback.feedback,
			strengths: [],
			improvements: undefined,
			sentimentScore,
			rating: ratingNum,
			redFlags: 0,
			tourName: tourData.name,
			tourLocation: tourData.location ?? undefined,
			tourDate: tourData.date ?? undefined,
		});
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
			];
			return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024; // 10MB limit
		});
		setUploadedFiles((prev) => [...prev, ...validFiles]);
	};

	const handleFileDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingFile(true);
	};

	const handleFileDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingFile(false);
	};

	const handleFileDrop = (e: React.DragEvent) => {
		e.preventDefault();
		e.stopPropagation();
		setIsDraggingFile(false);

		const files = Array.from(e.dataTransfer.files);
		const validTypes = [
			"application/pdf",
			"text/plain",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		];
		const validFiles = files.filter((file) => {
			return validTypes.includes(file.type) && file.size <= 10 * 1024 * 1024;
		});

		if (validFiles.length === 0) {
			toast.error("No valid files. Allowed: PDF, DOC, DOCX, TXT (max 10MB)");
			return;
		}

		setUploadedFiles((prev) => [...prev, ...validFiles]);
	};

	const removeFile = (index: number) => {
		setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const getFileIcon = (file: File) => {
		if (file.type === "application/pdf") return "📄";
		if (file.type.includes("word")) return "📝";
		if (file.type === "text/plain") return "📝";
		return "📎";
	};

	// AI Feedback Generation
	const handleGenerateAIFeedback = async () => {
		if (uploadedFiles.length === 0 && (!tourData.feedbacks || tourData.feedbacks.length === 0)) {
			toast.error("Please upload feedback files or ensure there are existing feedbacks");
			return;
		}

		setIsGeneratingAI(true);
		
		try {
			// Upload files to S3 and get URLs
			const fileUrls: string[] = [];
			for (const file of uploadedFiles) {
				const { uploadUrl, fileUrl } = await getPresignedUrl(
					file.name,
					file.type,
					file.size,
					"document"
				);
				
				// Upload file to S3
				await fetch(uploadUrl, {
					method: "PUT",
					body: file,
					headers: {
						"Content-Type": file.type,
					},
				});
				
				fileUrls.push(fileUrl);
			}

			// Get feedback texts from existing feedbacks
			const feedbackTexts = tourData.feedbacks?.map((f) => 
				`Rating: ${f.rating}/5\nFeedback: ${f.feedback}`
			) ?? [];

			// Call AI mutation
			generateAIMutation.mutate({
				tourId: id,
				fileUrls: fileUrls.length > 0 ? fileUrls : undefined,
				feedbackTexts: feedbackTexts.length > 0 ? feedbackTexts : undefined,
			});
		} catch (error) {
			console.error("Error generating AI feedback:", error);
			toast.error("Failed to generate AI feedback");
		} finally {
			setIsGeneratingAI(false);
		}
	};

	const StarRating = ({
		rating,
		onRatingChange,
		interactive = false,
	}: {
		rating: string | number;
		onRatingChange?: (rating: number) => void;
		interactive?: boolean;
	}) => {
		const ratingNum = parseRating(rating);
		return (
			<div className="flex gap-1">
				{[1, 2, 3, 4, 5].map((star) => (
					<Star
						key={star}
						className={`w-5 h-5 ${
							star <= ratingNum
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
			{/* AI Generation Loading Overlay */}
			{(isGeneratingAI || generateAIMutation.isPending) && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
					<div className="flex flex-col items-center gap-4 p-8 rounded-lg bg-card border shadow-lg">
						<div className="relative">
							<Sparkles className="w-12 h-12 text-primary animate-pulse" />
							<Loader2 className="w-16 h-16 text-primary animate-spin absolute -top-2 -left-2" />
						</div>
						<div className="text-center space-y-2">
							<h3 className="text-lg font-semibold">Analyzing Reviews</h3>
							<p className="text-sm text-muted-foreground max-w-xs">
								Our AI is generating a comprehensive summary of all feedback...
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Hero Image */}
			<div className="relative h-72 w-full overflow-hidden">
				<Image
					fill
					src={tourData.thumbnailUrl}
					alt={tourData.name}
					className="object-cover"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
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
									<div className="flex items-center gap-2">
										<Badge className="text-base">
											<Star className="w-4 h-4 mr-1 fill-accent text-accent" />
											{tourData.averageRating ?? "N/A"}
										</Badge>
										{isOwner && (
											<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
												<DialogTrigger asChild>
													<Button variant="destructive" size="icon">
														<Trash2 className="w-4 h-4" />
													</Button>
												</DialogTrigger>
												<DialogContent>
													<DialogHeader>
														<DialogTitle className="flex items-center gap-2">
															<AlertTriangle className="w-5 h-5 text-destructive" />
															Delete Previous Tour
														</DialogTitle>
														<DialogDescription>
															Are you sure you want to delete &quot;{tourData.name}&quot;? This action cannot be undone and will permanently remove the tour along with all its feedbacks.
														</DialogDescription>
													</DialogHeader>
													<DialogFooter className="gap-2 sm:gap-0">
														<Button
															variant="outline"
															onClick={() => setDeleteDialogOpen(false)}
														>
															Cancel
														</Button>
														<Button
															variant="destructive"
															onClick={() => deleteTourMutation.mutate(id)}
															disabled={deleteTourMutation.isPending}
														>
															{deleteTourMutation.isPending ? (
																<>
																	<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																	Deleting...
																</>
															) : (
																<>
																	<Trash2 className="w-4 h-4 mr-2" />
																	Delete Tour
																</>
															)}
														</Button>
													</DialogFooter>
												</DialogContent>
											</Dialog>
										)}
									</div>
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

						{/* Tabs for Details vs Feedbacks */}
						<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="details">Tour Details</TabsTrigger>
								<TabsTrigger value="feedbacks">
									Feedbacks & AI
									{(tourData.feedbacks?.length ?? 0) > 0 && (
										<Badge variant="secondary" className="ml-2 text-xs">
											{tourData.feedbacks?.length}
										</Badge>
									)}
								</TabsTrigger>
							</TabsList>

							{/* Tour Details Tab */}
							<TabsContent value="details" className="space-y-6 mt-6">
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
													<Image
														fill
														src={image}
														alt={`Tour photo ${index + 1}`}
														className="object-cover"
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
							</TabsContent>

							{/* Feedbacks Tab */}
							<TabsContent value="feedbacks" className="space-y-6 mt-6">
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
														<div className="text-muted-foreground text-sm prose prose-sm dark:prose-invert max-w-none">
															<ReactMarkdown>
																{feedback.feedback}
															</ReactMarkdown>
														</div>
														<p className="text-xs text-muted-foreground mt-2">
															{formatter.format(feedback.createdAt)}
														</p>
													</div>
													<div className="flex flex-col gap-1">
														{isOwner && tourData.guideID && (
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8 text-muted-foreground hover:text-primary"
																onClick={() => handlePushFeedbackToGuide(feedback)}
																disabled={pushReviewToGuideMutation.isPending}
																title="Push to Guide Profile"
															>
																<UserPlus className="w-4 h-4" />
															</Button>
														)}
														{canDelete && (
															<Button
																variant="ghost"
																size="icon"
																className="h-8 w-8 text-muted-foreground hover:text-destructive"
																onClick={() => deleteFeedbackMutation.mutate(feedback.id)}
																disabled={deleteFeedbackMutation.isPending}
																title="Delete Feedback"
															>
																<Trash2 className="w-4 h-4" />
															</Button>
														)}
													</div>
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

						{/* AI-Generated Feedback Summary Section */}
						{userRole === "ORGANIZATION" && isOwner && (
							<Card className="border-2 border-dashed border-primary/30 bg-linear-to-br from-primary/5 to-transparent">
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Sparkles className="w-5 h-5 text-primary" />
										AI Feedback Summary
										<Badge variant="secondary" className="ml-auto text-xs">
											Beta
										</Badge>
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									<p className="text-sm text-muted-foreground">
										Upload feedback documents and use AI to generate a comprehensive summary.
									</p>

									{/* File Upload for AI Analysis */}
									<div
										onClick={() => fileInputRef.current?.click()}
										onDragOver={handleFileDragOver}
										onDragLeave={handleFileDragLeave}
										onDrop={handleFileDrop}
										className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
											isDraggingFile 
												? "border-primary bg-primary/5" 
												: "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
										}`}
									>
										<Upload className={`w-8 h-8 mx-auto mb-2 ${isDraggingFile ? "text-primary" : "text-muted-foreground"}`} />
										<p className="text-sm font-medium">Drop files or click to upload</p>
										<p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX, TXT</p>
										<input
											ref={fileInputRef}
											type="file"
											multiple
											accept=".pdf,.doc,.docx,.txt"
											onChange={handleFileSelect}
											className="hidden"
										/>
									</div>

									{/* Uploaded Files for AI */}
									{uploadedFiles.length > 0 && (
										<div className="flex flex-wrap gap-2">
											{uploadedFiles.map((file, index) => (
												<Badge
													key={index}
													variant="outline"
													className="flex items-center gap-1.5 py-1 px-2"
												>
													<span>{getFileIcon(file)}</span>
													<span className="max-w-30 truncate text-sm">
														{file.name}
													</span>
													<button
														onClick={() => removeFile(index)}
														className="ml-1 hover:text-destructive"
													>
														<X className="h-3.5 w-3.5" />
													</button>
												</Badge>
											))}
										</div>
									)}

									{/* Generate Button */}
									<Button
										variant="gradient"
										className="w-full"
										onClick={handleGenerateAIFeedback}
										disabled={isGeneratingAI || generateAIMutation.isPending}
									>
										{isGeneratingAI || generateAIMutation.isPending ? (
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
										<div className="space-y-4 pt-4 border-t">
											<div className="flex items-center justify-between">
												<Label className="text-sm font-medium flex items-center gap-2">
													<FileText className="w-4 h-4" />
													AI Summary
												</Label>
												<Button
													variant="ghost"
													size="sm"
													onClick={handleGenerateAIFeedback}
													disabled={isGeneratingAI || generateAIMutation.isPending}
												>
													<RefreshCw className={`w-4 h-4 mr-1 ${isGeneratingAI || generateAIMutation.isPending ? "animate-spin" : ""}`} />
													Redo
												</Button>
											</div>
											
											{/* Sentiment Score */}
											<div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border">
												<span className="text-sm text-muted-foreground">Sentiment Score</span>
												<Badge 
													variant={aiGeneratedFeedback.sentiment_score >= 70 ? "default" : aiGeneratedFeedback.sentiment_score >= 40 ? "secondary" : "destructive"}
												>
													{aiGeneratedFeedback.sentiment_score}/100
												</Badge>
											</div>

											{/* Red Flags Warning */}
											{aiGeneratedFeedback.red_flags && (
												<div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
													<AlertTriangle className="w-5 h-5 text-destructive" />
													<span className="text-sm text-destructive font-medium">Safety concerns detected</span>
												</div>
											)}

											{/* Summary */}
											<div className="p-4 bg-muted/50 rounded-lg border">
												<p className="text-sm text-muted-foreground mb-2 font-medium">Summary</p>
												<p className="text-sm">{aiGeneratedFeedback.summary}</p>
											</div>

											{/* Strengths */}
											<div className="space-y-2">
												<p className="text-sm text-muted-foreground font-medium">Strengths</p>
												<div className="flex flex-wrap gap-2">
													{aiGeneratedFeedback.strengths.map((strength, index) => (
														<Badge key={index} variant="secondary">
															{strength}
														</Badge>
													))}
												</div>
											</div>

											{/* Improvements */}
											<div className="p-4 bg-muted/50 rounded-lg border">
												<p className="text-sm text-muted-foreground mb-2 font-medium">Areas for Improvement</p>
												<p className="text-sm">{aiGeneratedFeedback.improvements}</p>
											</div>

											<div className="flex gap-3">
												<Button 
													variant="gradient" 
													className="flex-1"
													onClick={handlePushAIFeedback}
													disabled={addFeedbackMutation.isPending}
												>
													{addFeedbackMutation.isPending ? (
														<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													) : (
														<MessageSquarePlus className="w-4 h-4 mr-2" />
													)}
													Push to Feedbacks
												</Button>
												{tourData.guideID && (
													<Button 
														variant="default" 
														className="flex-1"
														onClick={handlePushReviewToGuide}
														disabled={pushReviewToGuideMutation.isPending}
													>
														{pushReviewToGuideMutation.isPending ? (
															<Loader2 className="w-4 h-4 mr-2 animate-spin" />
														) : (
															<UserPlus className="w-4 h-4 mr-2" />
														)}
														Push to Guide Profile
													</Button>
												)}
											</div>
										</div>
									)}
								</CardContent>
							</Card>
						)}
							</TabsContent>
						</Tabs>
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
										<span className="font-semibold">
											{tourData.totalTravelers ?? 0}
										</span>
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

								<div className="pt-4 border-t space-y-3">
									{userRole === "ORGANIZATION" && isOwner && (
										<Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
											<DialogTrigger asChild>
												<Button variant="outline" className="w-full" onClick={handleOpenEditDialog}>
													<Pencil className="w-4 h-4 mr-2" />
													Edit Tour Details
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle>Edit Tour Details</DialogTitle>
													<DialogDescription>
														Update the details for this previous tour.
													</DialogDescription>
												</DialogHeader>
												<div className="space-y-4 py-4">
													<div className="space-y-2">
														<Label htmlFor="totalTravelers">Total Travelers</Label>
														<Input
															id="totalTravelers"
															type="number"
															min={0}
															value={editTotalTravelers}
															onChange={(e) => setEditTotalTravelers(Number(e.target.value))}
															placeholder="Enter total number of travelers"
														/>
														<p className="text-xs text-muted-foreground">
															The total number of travelers who joined this tour.
														</p>
													</div>
												</div>
												<DialogFooter>
													<Button variant="outline" onClick={() => setEditDialogOpen(false)}>
														Cancel
													</Button>
													<Button 
														onClick={handleSaveTotalTravelers}
														disabled={updateTotalTravelersMutation.isPending}
													>
														{updateTotalTravelersMutation.isPending ? (
															<Loader2 className="w-4 h-4 mr-2 animate-spin" />
														) : null}
														Save Changes
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
									)}
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
					</div>
				</div>
			</main>
		</>
	);
};

export default PreviousTourDetail;
