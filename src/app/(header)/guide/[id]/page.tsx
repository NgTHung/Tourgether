"use client";
import { use } from "react";
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
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";

const formatter = new Intl.DateTimeFormat("en-US", {
	month: "2-digit",
	day: "2-digit",
	year: "numeric",
});

const GuideProfilePage = ({ params }: { params: Promise<{ id: string }> }) => {
	const id = use(params).id;
	const router = useRouter();

	const [guideData] = api.guide.getGuideProfileById.useSuspenseQuery(id);

	// Calculate average rating from reviews (points is stored as decimal string)
	const averageRating =
		guideData.reviews.length > 0
			? guideData.reviews.reduce((sum, r) => sum + parseFloat(r.review.points), 0) /
			  guideData.reviews.length
			: 0;

	return (
		<div className="min-h-screen bg-background">
			{/* Hero Section */}
			<div className="relative h-48 bg-gradient-to-r from-primary/20 to-primary/10">
				<div className="absolute inset-0 bg-black/10" />
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

						{/* Profile Info */}
						<div className="flex-1 pt-4">
							<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
								<div>
									<h1 className="text-3xl font-bold">
										{guideData.user.name ?? "Guide"}
									</h1>
									<p className="text-muted-foreground">Tour Guide</p>
									<div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
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
											{guideData.reviews.length}
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

				{/* Main Content */}
				<Tabs defaultValue="about" className="mb-8">
					<TabsList className="mb-6">
						<TabsTrigger value="about">About</TabsTrigger>
						<TabsTrigger value="experience">Experience</TabsTrigger>
						<TabsTrigger value="tours">Current Tours</TabsTrigger>
						<TabsTrigger value="reviews">Reviews</TabsTrigger>
					</TabsList>

					{/* About Tab */}
					<TabsContent value="about" className="space-y-6">
						<div className="grid gap-6 md:grid-cols-2">
							{/* About Card */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<User className="size-5" />
										About
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-muted-foreground">
										{guideData.guide.description ?? "No description provided."}
									</p>
								</CardContent>
							</Card>

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
					</TabsContent>

					{/* Experience Tab */}
					<TabsContent value="experience" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Professional Summary</CardTitle>
							</CardHeader>
							<CardContent className="space-y-6">
								<div>
									<h4 className="mb-2 font-medium">Description</h4>
									<p className="text-muted-foreground">
										{guideData.guide.description ?? "No description provided."}
									</p>
								</div>

								<div>
									<h4 className="mb-2 font-medium">Work Experience</h4>
									<p className="text-muted-foreground">
										{guideData.guide.workExperience ??
											"No work experience provided."}
									</p>
								</div>

								<div>
									<h4 className="mb-2 font-medium">Certifications</h4>
									<p className="text-muted-foreground">
										{guideData.guide.certificates ??
											"No certificates provided."}
									</p>
								</div>

								<div className="flex items-center gap-2 text-sm">
									<CheckCircle className="size-4 text-green-500" />
									<span>
										Completed {guideData.completedToursCount} tours successfully
									</span>
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					{/* Current Tours Tab */}
					<TabsContent value="tours" className="space-y-6">
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
					</TabsContent>

					{/* Reviews Tab */}
					<TabsContent value="reviews" className="space-y-6">
						{guideData.reviews.length > 0 ? (
							<div className="space-y-4">
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
							</div>
						) : (
							<Card>
								<CardContent className="py-12 text-center">
									<p className="text-muted-foreground">No reviews yet</p>
								</CardContent>
							</Card>
						)}
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
};

export default GuideProfilePage;
