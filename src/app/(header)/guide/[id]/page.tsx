"use client";
import { use, useRef, useState } from "react";
import {
	MapPin,
	Calendar,
	Star,
	User,
	FileText,
	ExternalLink,
	GraduationCap,
	Briefcase,
	Award,
	Mail,
	Clock,
	CheckCircle,
	Building2,
	TrendingUp,
	AlertTriangle,
	Camera,
	Loader2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { authClient } from "~/server/better-auth/client";
import { getPresignedUrl } from "~/actions/upload";
import { toast } from "sonner";
import Image from "next/image";

const formatter = new Intl.DateTimeFormat("en-US", {
	month: "2-digit",
	day: "2-digit",
	year: "numeric",
});

const GuideProfilePage = ({ params }: { params: Promise<{ id: string }> }) => {
	const id = use(params).id;
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isUploadingBackground, setIsUploadingBackground] = useState(false);

	const { data: session } = authClient.useSession();
	const isOwnProfile = session?.user?.id === id;

	const [guideData] = api.guide.getGuideProfileById.useSuspenseQuery(id);
	const utils = api.useUtils();

	const updateBackgroundMutation = api.guide.updateBackground.useMutation({
		onSuccess: () => {
			toast.success("Background updated successfully");
			void utils.guide.getGuideProfileById.invalidate(id);
		},
		onError: (error) => {
			toast.error(error.message || "Failed to update background");
		},
	});

	const handleBackgroundUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// Validate file type
		if (!file.type.startsWith("image/")) {
			toast.error("Please select an image file");
			return;
		}

		// Validate file size (max 5MB)
		if (file.size > 5 * 1024 * 1024) {
			toast.error("Image must be less than 5MB");
			return;
		}

		setIsUploadingBackground(true);

		try {
			const { uploadUrl, fileUrl } = await getPresignedUrl(
				file.name,
				file.type,
				file.size,
				"image"
			);

			const response = await fetch(uploadUrl, {
				method: "PUT",
				body: file,
				headers: {
					"Content-Type": file.type,
				},
			});

			if (!response.ok) {
				throw new Error("Upload failed");
			}

			await updateBackgroundMutation.mutateAsync({ backgroundUrl: fileUrl });
		} catch (error) {
			console.error("Background upload failed:", error);
			toast.error("Failed to upload background image");
		} finally {
			setIsUploadingBackground(false);
			if (fileInputRef.current) {
				fileInputRef.current.value = "";
			}
		}
	};

	// Use the stored average rating from performance reviews if available, 
	// otherwise calculate from user reviews
	const averageRating = guideData.guide.averageRating 
		? parseFloat(guideData.guide.averageRating)
		: guideData.reviews.length > 0
			? guideData.reviews.reduce((sum, r) => sum + parseFloat(r.review.points), 0) /
			  guideData.reviews.length
			: 0;

	const totalReviewsCount = guideData.guide.totalReviews ?? 0;

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="relative h-48 bg-gradient-to-r from-primary/20 to-primary/10 overflow-hidden">
				{guideData.guide.backgroundUrl ? (
					<Image
						src={guideData.guide.backgroundUrl}
						alt="Profile background"
						fill
						className="object-cover"
					/>
				) : null}
				<div className="absolute inset-0 bg-black/10" />
				
				{/* Edit Background Button - Only visible to profile owner */}
				{isOwnProfile && (
					<>
						<input
							ref={fileInputRef}
							type="file"
							accept="image/*"
							onChange={handleBackgroundUpload}
							className="hidden"
						/>
						<Button
							variant="secondary"
							size="sm"
							className="absolute bottom-4 right-4 gap-2"
							onClick={() => fileInputRef.current?.click()}
							disabled={isUploadingBackground}
						>
							{isUploadingBackground ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Camera className="size-4" />
							)}
							{isUploadingBackground ? "Uploading..." : "Edit Background"}
						</Button>
					</>
				)}
			</div>

			{/* Profile Header */}
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="relative -mt-24 pb-8">
					<div className="flex flex-col items-start gap-6 md:flex-row">
						{/* Profile Picture */}
						<Avatar className="size-32 border-4 border-background shadow-lg">
							<AvatarImage src={guideData.user.image ?? ""} />
							<AvatarFallback className="text-3xl">
								{guideData.user.name?.charAt(0)?.toUpperCase() ?? "G"}
							</AvatarFallback>
						</Avatar>

						{/* Profile Info - with backdrop for better visibility */}
						<div className="flex-1 rounded-xl bg-background/80 backdrop-blur-sm p-4 shadow-lg border">
							<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
								<div>
									<h1 className="text-3xl font-bold">
										{guideData.user.name ?? "Guide"}
									</h1>
									<p className="text-muted-foreground">Tour Guide</p>
									<div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
										{guideData.user.email && (
											<span className="flex items-center gap-1">
												<Mail className="size-4" />
												{guideData.user.email}
											</span>
										)}
										<span className="flex items-center gap-1">
											<Clock className="size-4" />
											Member since{" "}
											{formatter.format(new Date(guideData.user.createdAt))}
										</span>
									</div>
								</div>

								{/* Rating & Stats */}
								<div className="flex items-center gap-6">
									<div className="text-center">
										<div className="flex items-center gap-1">
											<Star className="size-5 fill-yellow-400 text-yellow-400" />
											<span className="text-xl font-bold">
												{averageRating > 0 ? averageRating.toFixed(1) : "N/A"}
											</span>
										</div>
										<p className="text-sm text-muted-foreground">Rating</p>
									</div>
									<div className="text-center">
										<span className="text-xl font-bold">
											{guideData.completedToursCount}
										</span>
										<p className="text-sm text-muted-foreground">
											Completed Tours
										</p>
									</div>
									<div className="text-center">
										<span className="text-xl font-bold">
											{guideData.reviews.length + guideData.performanceReviews.length}
										</span>
										<p className="text-sm text-muted-foreground">Reviews</p>
									</div>
								</div>
							</div>

							{/* Tags */}
							{guideData.tags.length > 0 && (
								<div className="mt-4 flex flex-wrap gap-2">
									{guideData.tags.map((tag) => (
										<Badge key={tag.id} variant="secondary">
											{tag.name}
										</Badge>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Main Content - Scrollable Single Page */}
				<div className="mb-8 space-y-10">
					{/* Biography Section */}
					<section className="space-y-6">
						<h2 className="text-xl font-semibold">Biography</h2>
						
						{/* About Me Card - Full width with vibrant styling */}
						<Card className="bg-gradient-to-br from-primary/5 via-background to-primary/10 border-primary/20">
							<CardHeader>
								<CardTitle className="flex items-center gap-2 text-primary">
									<User className="size-5" />
									About Me
								</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-base leading-relaxed text-foreground/90 italic">
									{guideData.guide.description ? (
										<>&ldquo;{guideData.guide.description}&rdquo;</>
									) : (
										<span className="text-muted-foreground not-italic">No description provided.</span>
									)}
								</p>
							</CardContent>
						</Card>

						<div className="grid gap-6 md:grid-cols-2">
							{/* Education Card */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<GraduationCap className="size-5" />
										Education
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="font-medium">
										{guideData.guide.school ?? "Not specified"}
									</p>
								</CardContent>
							</Card>

							{/* Work Experience Card */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Briefcase className="size-5" />
										Work Experience
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">
										{guideData.guide.workExperience ??
											"No work experience provided."}
									</p>
								</CardContent>
							</Card>

							{/* Certificates Card */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Award className="size-5" />
										Certificates
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">
										{guideData.guide.certificates ??
											"No certificates provided."}
									</p>
								</CardContent>
							</Card>

							{/* Completed Tours Card */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<CheckCircle className="size-5" />
										Completed Tours
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-2xl font-bold text-green-600 dark:text-green-400">
										{guideData.completedToursCount}
									</p>
									<p className="text-sm text-muted-foreground">
										Tours completed successfully
									</p>
								</CardContent>
							</Card>
						</div>

						{/* CV Link */}
						{guideData.guide.cvUrl && (
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<FileText className="size-5" />
										Curriculum Vitae
									</CardTitle>
								</CardHeader>
								<CardContent>
									<Button variant="outline" asChild>
										<a
											href={guideData.guide.cvUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center gap-2"
										>
											<ExternalLink className="size-4" />
											View CV
										</a>
									</Button>
								</CardContent>
							</Card>
						)}
					</section>

					{/* Current Tours Section */}
					<section>
						<h2 className="mb-6 text-xl font-semibold">Current Tours</h2>
						{guideData.currentTours.length > 0 ? (
							<div className="grid gap-4 md:grid-cols-2">
								{guideData.currentTours.map((tour) => (
									<Card
										key={tour.id}
										className="cursor-pointer transition-shadow hover:shadow-md"
										onClick={() => router.push(`/tour/${tour.id}`)}
									>
										<CardContent className="p-4">
											<div className="mb-2 flex items-start justify-between">
												<h3 className="font-semibold">{tour.name}</h3>
												<Badge variant="outline">{tour.status}</Badge>
											</div>
											<div className="space-y-1 text-sm text-muted-foreground">
												<p className="flex items-center gap-1">
													<MapPin className="size-4" />
													{tour.location}
												</p>
												<p className="flex items-center gap-1">
													<Calendar className="size-4" />
													{formatter.format(new Date(tour.date))}
												</p>
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<Card>
								<CardContent className="py-12 text-center">
									<p className="text-muted-foreground">
										No current tours assigned
									</p>
								</CardContent>
							</Card>
						)}
					</section>

					{/* Reviews Section */}
					<section>
						<h2 className="mb-6 text-xl font-semibold">Reviews</h2>
						{guideData.reviews.length > 0 || guideData.performanceReviews.length > 0 ? (
							<div className="space-y-4">
								{/* User Reviews */}
								{guideData.reviews.map((reviewItem) => (
									<Card key={reviewItem.review.id}>
										<CardContent className="p-4">
											<div className="mb-3 flex items-start justify-between">
												<div className="flex items-center gap-3">
													<Avatar className="size-10">
														<AvatarImage
															src={reviewItem.reviewer.image ?? ""}
														/>
														<AvatarFallback>
															{reviewItem.reviewer.name?.charAt(0)?.toUpperCase() ??
																"U"}
														</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium">
															{reviewItem.reviewer.name ?? "Anonymous"}
														</p>
														<p className="text-sm text-muted-foreground">
															{formatter.format(
																new Date(reviewItem.review.createdAt),
															)}
														</p>
													</div>
												</div>
												<div className="flex items-center gap-1">
													<Star className="size-4 fill-yellow-400 text-yellow-400" />
													<span className="font-medium">
														{parseFloat(reviewItem.review.points).toFixed(1)}
													</span>
												</div>
											</div>
											{reviewItem.review.review && (
												<p className="text-muted-foreground">
													{reviewItem.review.review}
												</p>
											)}
										</CardContent>
									</Card>
								))}

								{/* Performance Review Summaries */}
								{guideData.performanceReviews.map((review) => (
									<Card key={`summary-${review.id}`}>
										<CardContent className="p-4">
											<div className="mb-3 flex items-start justify-between">
												<div className="flex items-center gap-3">
													<Avatar className="size-10">
														<AvatarImage src={review.organization.image ?? ""} />
														<AvatarFallback>
															<Building2 className="size-5" />
														</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium flex items-center gap-2">
															{review.organization.name ?? "Organization"}
															<Badge variant="outline" className="text-xs">
																Verified Business
															</Badge>
														</p>
														<p className="text-sm text-muted-foreground">
															{review.tourName}
															{review.tourLocation && ` • ${review.tourLocation}`}
														</p>
													</div>
												</div>
												<div className="flex items-center gap-1">
													<Star className="size-4 fill-yellow-400 text-yellow-400" />
													<span className="font-medium">
														{parseFloat(review.rating).toFixed(1)}
													</span>
												</div>
											</div>
											<p className="text-muted-foreground">{review.summary}</p>
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<Card>
								<CardContent className="py-12 text-center">
									<p className="text-muted-foreground">No reviews yet</p>
								</CardContent>
							</Card>
						)}
					</section>

					{/* Performance Reviews Section */}
					<section>
						<h2 className="mb-6 flex items-center gap-2 text-xl font-semibold">
							Performance Reviews
							{totalReviewsCount > 0 && (
								<Badge variant="secondary">
									{totalReviewsCount}
								</Badge>
							)}
						</h2>
						{guideData.performanceReviews.length > 0 ? (
							<div className="space-y-4">
								{guideData.performanceReviews.map((review) => (
									<Card key={review.id} className="overflow-hidden">
										<CardHeader className="pb-3">
											<div className="flex items-start justify-between">
												<div className="flex items-center gap-3">
													<Avatar className="size-10">
														<AvatarImage src={review.organization.image ?? ""} />
														<AvatarFallback>
															<Building2 className="size-5" />
														</AvatarFallback>
													</Avatar>
													<div>
														<p className="font-medium flex items-center gap-2">
															{review.organization.name ?? "Organization"}
															<Badge variant="outline" className="text-xs">
																Verified Business
															</Badge>
														</p>
														<p className="text-sm text-muted-foreground">
															{review.tourName}
															{review.tourLocation && ` • ${review.tourLocation}`}
														</p>
													</div>
												</div>
												<div className="text-right">
													<div className="flex items-center gap-1">
														<Star className="size-4 fill-yellow-400 text-yellow-400" />
														<span className="font-semibold">
															{parseFloat(review.rating).toFixed(1)}
														</span>
													</div>
													<p className="text-xs text-muted-foreground">
														{review.tourDate 
															? formatter.format(new Date(review.tourDate))
															: formatter.format(new Date(review.createdAt))
														}
													</p>
												</div>
											</div>
										</CardHeader>
										<CardContent className="space-y-4">
											{/* Sentiment Score */}
											<div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
												<TrendingUp className="size-5 text-primary" />
												<div className="flex-1">
													<div className="flex items-center justify-between mb-1">
														<span className="text-sm font-medium">Sentiment Score</span>
														<Badge 
															variant={review.sentimentScore >= 70 ? "default" : review.sentimentScore >= 40 ? "secondary" : "destructive"}
														>
															{review.sentimentScore}/100
														</Badge>
													</div>
													<div className="w-full bg-muted rounded-full h-2">
														<div 
															className={`h-2 rounded-full transition-all ${
																review.sentimentScore >= 70 ? "bg-green-500" : 
																review.sentimentScore >= 40 ? "bg-yellow-500" : "bg-red-500"
															}`}
															style={{ width: `${review.sentimentScore}%` }}
														/>
													</div>
												</div>
											</div>

											{/* Red Flags Warning */}
											{review.redFlags === 1 && (
												<div className="flex items-center gap-2 p-3 bg-destructive/10 rounded-lg border border-destructive/30">
													<AlertTriangle className="size-5 text-destructive" />
													<span className="text-sm text-destructive font-medium">
														Safety concerns were noted
													</span>
												</div>
											)}

											{/* Strengths */}
											{review.strengths && review.strengths.length > 0 && (
												<div>
													<p className="text-sm font-medium mb-2">Strengths</p>
													<div className="flex flex-wrap gap-2">
														{review.strengths.map((strength, index) => (
															<Badge key={index} variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400">
																{strength}
															</Badge>
														))}
													</div>
												</div>
											)}

											{/* Areas for Improvement */}
											{review.improvements && (
												<div>
													<p className="text-sm font-medium mb-2">Areas for Improvement</p>
													<p className="text-sm text-muted-foreground">{review.improvements}</p>
												</div>
											)}
										</CardContent>
									</Card>
								))}
							</div>
						) : (
							<Card>
								<CardContent className="py-12 text-center">
									<Building2 className="size-12 mx-auto mb-4 text-muted-foreground/50" />
									<p className="text-muted-foreground">No performance reviews from organizations yet</p>
									<p className="text-sm text-muted-foreground mt-1">
										Performance reviews are added by verified businesses after completing tours
									</p>
								</CardContent>
							</Card>
						)}
					</section>
				</div>
			</div>
		</div>
	);
};

export default GuideProfilePage;
