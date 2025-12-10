"use client";
import { useState, use } from "react";
import {
	MapPin,
	Calendar,
	DollarSign,
	Clock,
	Star,
	User,
	Edit,
	Camera,
	CheckCircle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { useRouter } from "next/navigation";
import { useSession } from "~/components/AuthProvider";
import { api } from "~/trpc/react";
import { toast } from "sonner";

const formatter = new Intl.DateTimeFormat("en-US", {
	month: "2-digit",
	day: "2-digit",
	year: "numeric",
});

const TourDetail = ({ params }: { params: Promise<{ id: string }> }) => {
	const id = use(params).id;
	const router = useRouter();
	const [activeTab, setActiveTab] = useState("details");

	const {
		data: session,
		isPending, //loading state
		error, //error object
		refetch, //refetch the session
	} = useSession();

	const applyMutation = api.guide.applyAsGuideToTour.useMutation({
		onSuccess: () => {
			toast.success("Applied successfully!");
		},
		onError: (error) => {
			toast.error(`Failed to apply: ${error.message}`);
		},
	});

	const markCompletedMutation = api.tour.markTourAsCompleted.useMutation({
		onSuccess: (data) => {
			toast.success("Tour marked as completed!");
			router.push(`/previous-tours/${data?.id}`);
		},
		onError: (error) => {
			toast.error(`Failed to complete tour: ${error.message}`);
		},
	});

	const userRole = session?.user?.role ?? "GUIDE";

	const [tourData, tourQuery] = api.tour.getTourById.useSuspenseQuery({
		id: id,
		shouldGetOwner: true,
		shouldGetGuide: true,
		shouldGetItineraries: true,
		shouldGetTags: true,
	});
	let appliedStudents;
	const isOwner = tourData.tour.ownerUserID === session?.user?.id;
	if (userRole === "ORGANIZATION" && isOwner) {
		appliedStudents = api.tour.getAppliedGuidesForTour.useQuery(id);
		if (appliedStudents.isLoading) return <div>Loading...</div>;
		if (appliedStudents.error || !appliedStudents.data) {
			return (
				<div>
					Error:{" "}
					{appliedStudents.error?.message ||
						"Failed to load applied guides"}
				</div>
			);
		}
	}

	return (
		<>
			{/* Hero Image */}
			<div className="relative h-96 w-full overflow-hidden">
				<img
					src={tourData.tour.thumbnailUrl}
					alt={tourData.tour.name}
					className="w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
			</div>

			<main className="container mx-auto py-8 px-4 -mt-32 relative z-10">
				<div className="grid lg:grid-cols-3 gap-8 justify-center">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Tour Header */}
						<Card>
							<CardContent className="p-6">
								<div className="flex items-start justify-between mb-4">
									<div>
										<h1 className="text-3xl font-bold mb-2">
											{tourData.tour.name}
										</h1>
										<p className="text-muted-foreground">
											{}
										</p>
									</div>
									<div className="flex items-center gap-3">
										<Badge className="text-base">
											<Star className="w-4 h-4 mr-1 fill-accent text-accent" />
											{tourData.averageRating ??
												"N/A"}
										</Badge>
										{/* Edit Tour Button - Only visible to ORGANIZATION owner */}
										{userRole === "ORGANIZATION" &&
											isOwner && (
												<Button
													onClick={() =>
														router.push(
															`/business/edit-tour/${id}`,
														)
													}
													variant="outline"
													size="sm"
												>
													<Edit className="w-4 h-4 mr-2" />
													Edit Tour
												</Button>
											)}
									</div>
								</div>

								<div className="grid md:grid-cols-3 gap-4">
									<div className="flex items-center text-muted-foreground">
										<MapPin className="w-5 h-5 mr-2 text-primary" />
										<span>{tourData.tour.location}</span>
									</div>
									<div className="flex items-center text-muted-foreground">
										<Calendar className="w-5 h-5 mr-2 text-primary" />
										<span>
											{formatter.format(tourData.tour.date)}
										</span>
									</div>
									<div className="flex items-center text-muted-foreground">
										<Clock className="w-5 h-5 mr-2 text-primary" />
										<span>
											{tourData.tour.duration && tourData.tour.duration >= 60
												? `${Math.floor(tourData.tour.duration / 60)} ${Math.floor(tourData.tour.duration / 60) === 1 ? "hour" : "hours"}${tourData.tour.duration % 60 > 0 ? ` ${tourData.tour.duration % 60} min` : ""}`
												: `${tourData.tour.duration ?? 0} min`}
										</span>
									</div>
								</div>

								{/* Tags */}
								{tourData.tags && tourData.tags.length > 0 && (
									<div className="flex flex-wrap gap-2 mt-4">
										{tourData.tags.map((tag) => (
											<Badge key={tag} variant="secondary">
												{tag}
											</Badge>
										))}
									</div>
								)}
							</CardContent>
						</Card>

						{/* Tabs */}
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList className="w-full">
								<TabsTrigger value="details" className="flex-1">
									Details
								</TabsTrigger>
								{/* Conditional Admin Tabs - Only visible to ORGANIZATION owner */}
								{userRole === "ORGANIZATION" && isOwner && (
									<TabsTrigger
										value="students"
										className="flex-1"
									>
										Applied Students
									</TabsTrigger>
								)}
							</TabsList>

							<TabsContent
								value="details"
								className="mt-6 space-y-6"
							>
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
											{(tourData.tour.galleries ?? []).map(
												(image, index) => (
													<div
														key={index}
														className="relative aspect-video rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
													>
														<img
															src={image}
															alt={`Tour photo ${index + 1}`}
															className="w-full h-full object-cover"
														/>
													</div>
												),
											)}
										</div>
									</CardContent>
								</Card>

								{/* About This Tour */}
								<Card>
									<CardHeader>
										<CardTitle>About This Tour</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="text-muted-foreground leading-relaxed mb-6">
											{tourData.tour.description}
										</p>

										{/* Itinerary */}
										<div className="mb-6">
											<h3 className="font-semibold mb-4">
												Itinerary
											</h3>
											<div className="relative space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
												{(tourData.tour.itineraries ?? [])
													.map((item, index) => (
														<div
															key={index}
															className="relative pl-10"
														>
															<div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
																{index + 1}
															</div>
															<div className="space-y-1">
																<div className="flex items-center gap-3">
																	<p className="text-sm font-semibold text-primary">
																		{
																			item.time
																		}
																	</p>
																	<p className="font-semibold">
																		{
																			item.location
																		}
																	</p>
																</div>
																<p className="text-sm text-muted-foreground">
																	{
																		item.description
																	}
																</p>
															</div>
														</div>
													))}
											</div>
										</div>

										<div className="space-y-3">
											<h3 className="font-semibold">
												What&apos;s Included:
											</h3>
											<ul className="space-y-2 text-muted-foreground">
												{(tourData.tour.inclusions ?? []).length > 0 ? (
													(tourData.tour.inclusions ?? []).map((item, index) => (
														<li key={index} className="flex items-start">
															<span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3" />
															{item}
														</li>
													))
												) : (
													<li className="text-sm italic">
														No inclusions specified
													</li>
												)}
											</ul>
										</div>
									</CardContent>
								</Card>
							</TabsContent>

							{/* Admin Only Tabs */}
							{userRole === "ORGANIZATION" && isOwner && (
								<>
									<TabsContent
										value="students"
										className="mt-6"
									>
										<Card>
											<CardHeader>
												<CardTitle>
													Applied Students (
													{(appliedStudents!).data.size})
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="space-y-4">
													{Array.from(
														(appliedStudents!).data.values(),
													).map((student) => (
														<div
															key={
																student.user.id
															}
															className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
														>
															<div className="flex items-center gap-4">
																<Avatar className="w-12 h-12">
																	<AvatarImage
																		src={
																			student
																				.user
																				.image ??
																			undefined
																		}
																	/>
																	<AvatarFallback>
																		{
																			student
																				.user
																				.name[0]
																		}
																	</AvatarFallback>
																</Avatar>
																<div>
																	<p className="font-semibold">
																		{
																			student
																				.user
																				.name
																		}
																	</p>
																	<div className="flex items-center gap-4 text-sm text-muted-foreground">
																		<span className="flex items-center">
																			<Star className="w-3 h-3 mr-1 fill-accent text-accent" />
																			{
																				student
																					.user
																					.rating
																			}
																		</span>
																		<span>
																			{
																				student.tours
																			}{" "}
																			tours
																			completed
																		</span>
																	</div>
																</div>
															</div>
															<div className="flex gap-2">
																<Button
																	variant="outline"
																	size="sm"
																>
																	View Profile
																</Button>
																<Button
																	variant="gradient"
																	size="sm"
																>
																	Accept
																</Button>
															</div>
														</div>
													))}
												</div>
											</CardContent>
										</Card>
									</TabsContent>
								</>
							)}
						</Tabs>
					</div>

					{/* Booking Card */}
					<div className="lg:col-span-1">
						<Card className="sticky top-20">
							<CardContent className="p-6">
								<div className="mb-6">
									<p className="text-sm text-muted-foreground mb-1">
										Price per person
									</p>
									<div className="flex items-baseline gap-1">
										<DollarSign className="w-5 h-5 text-primary" />
										<span className="text-3xl font-bold">
											{tourData.tour.price}
										</span>
									</div>
								</div>

								{/* Show different actions based on user role */}
								{userRole === "student" && (
									<>
										<Button
											variant="gradient"
											size="lg"
											className="w-full mb-3"
											disabled={
												!!tourData.tour.guide ||
												applyMutation.isPending
											}
											onClick={() =>
												applyMutation.mutate(tourData.tour.id)
											}
										>
											{tourData.tour.guide
												? "Guide Assigned"
												: "Apply as Guide"}
										</Button>
										<Button
											variant="outline"
											className="w-full"
										>
											Contact Business
										</Button>
									</>
								)}

								{userRole === "ORGANIZATION" && isOwner && (
									<>
										<Button
											variant="outline"
											className="w-full mb-3"
										>
											View Analytics
										</Button>
										{tourData.tour.status !== "COMPLETED" && (
											<Button
												variant="default"
												className="w-full"
												disabled={markCompletedMutation.isPending}
												onClick={() =>
													markCompletedMutation.mutate(tourData.tour.id)
												}
											>
												<CheckCircle className="w-4 h-4 mr-2" />
												{markCompletedMutation.isPending
													? "Marking..."
													: "Mark as Finished"}
											</Button>
										)}
									</>
								)}

								{userRole === "ORGANIZATION" && !isOwner && (
									<Button
										variant="outline"
										className="w-full"
									>
										Contact Business Owner
									</Button>
								)}

								<div className="mt-6 pt-6 border-t space-y-3 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											Duration
										</span>
										<span className="font-semibold">
											{tourData.tour.duration && tourData.tour.duration >= 60
												? `${Math.floor(tourData.tour.duration / 60)} ${Math.floor(tourData.tour.duration / 60) === 1 ? "hour" : "hours"}${tourData.tour.duration % 60 > 0 ? ` ${tourData.tour.duration % 60} min` : ""}`
												: `${tourData.tour.duration ?? 0} min`}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											Group Size
										</span>
										<span className="font-semibold">
											Max {tourData.tour.groupSize ?? 15} people
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground">
											Languages
										</span>
										<span className="font-semibold">
											{(tourData.tour.languages ?? ["English"]).join(", ")}
										</span>
									</div>
									{userRole === "OGRANIZATION" && isOwner && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Applicants
											</span>
											<span className="font-semibold text-primary">
												{appliedStudents!.data.size}{" "}
												pending
											</span>
										</div>
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

export default TourDetail;
