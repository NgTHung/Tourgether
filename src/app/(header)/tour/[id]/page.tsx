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
	Check,
	X,
	FileText,
	ExternalLink,
	GraduationCap,
	Loader2,
	LogOut,
	AlertTriangle,
	Phone,
	Mail,
	Building2,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
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
	const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
	const [leaveReason, setLeaveReason] = useState("");
	const [contactDialogOpen, setContactDialogOpen] = useState(false);

	const {
		data: session,
		isPending, //loading state
		error, //error object
		refetch, //refetch the session
	} = useSession();

	const applyMutation = api.guide.applyAsGuideToTour.useMutation({
		onSuccess: () => {
			toast.success("Applied successfully!");
			void tourQuery.refetch();
		},
		onError: (error) => {
			toast.error(`Failed to apply: ${error.message}`);
		},
	});

	const leaveTourMutation = api.guide.requestLeaveTour.useMutation({
		onSuccess: () => {
			toast.success("Leave request submitted! The organization will review it.");
			setLeaveDialogOpen(false);
			setLeaveReason("");
		},
		onError: (error) => {
			toast.error(`Failed to submit leave request: ${error.message}`);
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

	const isOwner = tourData.tour.ownerUserID === session?.user?.id;
	const isAssignedGuide = session?.user?.id === tourData.tour.guideID;

	// Get applicants for this tour (only for organization owners)
	const applicantsQuery = api.organization.getTourApplicants.useQuery(id, {
		enabled: userRole === "ORGANIZATION" && isOwner,
	});

	// Approve mutation
	const approveMutation = api.organization.approveGuiderApplication.useMutation({
		onSuccess: () => {
			toast.success("Guide approved successfully!");
			void applicantsQuery.refetch();
			void tourQuery.refetch();
		},
		onError: (error) => {
			toast.error(`Failed to approve: ${error.message}`);
		},
	});

	// Reject mutation
	const rejectMutation = api.organization.rejectGuiderApplication.useMutation({
		onSuccess: () => {
			toast.success("Application rejected");
			void applicantsQuery.refetch();
		},
		onError: (error) => {
			toast.error(`Failed to reject: ${error.message}`);
		},
	});

	const pendingApplicants = applicantsQuery.data?.applicants.filter(a => a.status === "PENDING") ?? [];
	const reviewedApplicants = applicantsQuery.data?.applicants.filter(a => a.status !== "PENDING") ?? [];

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
										className="mt-6 space-y-6"
									>
										{/* Pending Applications */}
										<Card>
											<CardHeader>
												<CardTitle className="flex items-center justify-between">
													<span>Pending Applications ({pendingApplicants.length})</span>
													{tourData.tour.guideID && (
														<Badge variant="secondary" className="ml-2">
															<Check className="w-3 h-3 mr-1" />
															Guide Assigned
														</Badge>
													)}
												</CardTitle>
											</CardHeader>
											<CardContent>
												{applicantsQuery.isLoading ? (
													<div className="flex items-center justify-center py-8">
														<Loader2 className="w-6 h-6 animate-spin" />
													</div>
												) : pendingApplicants.length === 0 ? (
													<p className="text-muted-foreground text-center py-8">
														No pending applications
													</p>
												) : (
													<div className="space-y-4">
														{pendingApplicants.map((applicant) => (
															<div
																key={applicant.guideID}
																className="flex flex-col lg:flex-row lg:items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors gap-4"
															>
																<div className="flex items-start gap-4 flex-1">
																	<Avatar className="w-12 h-12">
																		<AvatarImage
																			src={applicant.user.image ?? undefined}
																		/>
																		<AvatarFallback>
																			{applicant.user.name?.[0] ?? "U"}
																		</AvatarFallback>
																	</Avatar>
																	<div className="flex-1 min-w-0">
																		<div className="flex items-center gap-2 mb-1">
																			<p className="font-semibold truncate">
																				{applicant.user.name}
																			</p>
																			<Badge variant="outline" className="text-xs">
																				Applied {new Date(applicant.appliedAt).toLocaleDateString()}
																			</Badge>
																		</div>
																		<p className="text-sm text-muted-foreground mb-2">
																			{applicant.user.email}
																		</p>
																		
																		{/* Guide Details */}
																		<div className="space-y-2 text-sm">
																			{applicant.guide.school && (
																				<div className="flex items-center gap-2 text-muted-foreground">
																					<GraduationCap className="w-4 h-4" />
																					<span>{applicant.guide.school}</span>
																				</div>
																			)}
																			{applicant.guide.description && (
																				<p className="text-muted-foreground line-clamp-2">
																					{applicant.guide.description}
																				</p>
																			)}
																			{applicant.guide.certificates && applicant.guide.certificates.length > 0 && (
																				<div className="flex flex-wrap gap-1">
																					{applicant.guide.certificates.slice(0, 3).map((cert, idx) => (
																						<Badge key={idx} variant="secondary" className="text-xs">
																							{cert}
																						</Badge>
																					))}
																					{applicant.guide.certificates.length > 3 && (
																						<Badge variant="secondary" className="text-xs">
																							+{applicant.guide.certificates.length - 3} more
																						</Badge>
																					)}
																				</div>
																			)}
																			{applicant.guide.cvUrl && (
																				<a
																					href={applicant.guide.cvUrl}
																					target="_blank"
																					rel="noopener noreferrer"
																					className="inline-flex items-center gap-1 text-primary hover:underline"
																				>
																					<FileText className="w-4 h-4" />
																					View CV
																					<ExternalLink className="w-3 h-3" />
																				</a>
																			)}
																		</div>
																	</div>
																</div>
																<div className="flex gap-2 lg:flex-col xl:flex-row">
																	<Button
																		variant="outline"
																		size="sm"
																		onClick={() => router.push(`/guide/${applicant.guideID}`)}
																	>
																		<User className="w-4 h-4 mr-1" />
																		View Profile
																	</Button>
																	<Button
																		variant="destructive"
																		size="sm"
																		disabled={rejectMutation.isPending || !!tourData.tour.guideID}
																		onClick={() => rejectMutation.mutate({
																			tourID: id,
																			guideID: applicant.guideID!,
																		})}
																	>
																		{rejectMutation.isPending ? (
																			<Loader2 className="w-4 h-4 animate-spin" />
																		) : (
																			<>
																				<X className="w-4 h-4 mr-1" />
																				Reject
																			</>
																		)}
																	</Button>
																	<Button
																		variant="default"
																		size="sm"
																		disabled={approveMutation.isPending || !!tourData.tour.guideID}
																		onClick={() => approveMutation.mutate({
																			tourID: id,
																			guideID: applicant.guideID!,
																		})}
																	>
																		{approveMutation.isPending ? (
																			<Loader2 className="w-4 h-4 animate-spin" />
																		) : (
																			<>
																				<Check className="w-4 h-4 mr-1" />
																				Approve
																			</>
																		)}
																	</Button>
																</div>
															</div>
														))}
													</div>
												)}
											</CardContent>
										</Card>

										{/* Reviewed Applications */}
										{reviewedApplicants.length > 0 && (
											<Card>
												<CardHeader>
													<CardTitle>Previously Reviewed ({reviewedApplicants.length})</CardTitle>
												</CardHeader>
												<CardContent>
													<div className="space-y-3">
														{reviewedApplicants.map((applicant) => (
															<div
																key={applicant.guideID}
																className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
															>
																<div className="flex items-center gap-3">
																	<Avatar className="w-10 h-10">
																		<AvatarImage
																			src={applicant.user.image ?? undefined}
																		/>
																		<AvatarFallback>
																			{applicant.user.name?.[0] ?? "U"}
																		</AvatarFallback>
																	</Avatar>
																	<div>
																		<p className="font-medium">{applicant.user.name}</p>
																		<p className="text-xs text-muted-foreground">
																			{applicant.guide.school}
																		</p>
																	</div>
																</div>
																<Badge
																	variant={applicant.status === "APPROVED" ? "default" : "destructive"}
																>
																	{applicant.status === "APPROVED" ? (
																		<><Check className="w-3 h-3 mr-1" /> Approved</>
																	) : (
																		<><X className="w-3 h-3 mr-1" /> Rejected</>
																	)}
																</Badge>
															</div>
														))}
													</div>
												</CardContent>
											</Card>
										)}
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
								{userRole === "GUIDE" && !isAssignedGuide && (
									<>
										<Button
											variant="gradient"
											size="lg"
											className="w-full mb-3"
											disabled={
												!!tourData.tour.guideID ||
												applyMutation.isPending
											}
											onClick={() =>
												applyMutation.mutate(tourData.tour.id)
											}
										>
											{tourData.tour.guideID
												? "Guide Assigned"
												: applyMutation.isPending
													? "Applying..."
													: "Apply as Guide"}
										</Button>
										<Button
											variant="outline"
											className="w-full"
											onClick={() => setContactDialogOpen(true)}
										>
											Contact Business
										</Button>
									</>
								)}

								{/* Assigned Guide Actions */}
								{userRole === "GUIDE" && isAssignedGuide && (
									<>
										<Badge className="w-full justify-center py-2 mb-3" variant="default">
											<CheckCircle className="w-4 h-4 mr-2" />
											You are assigned to this tour
										</Badge>
										<Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
											<DialogTrigger asChild>
												<Button
													variant="destructive"
													size="lg"
													className="w-full mb-3"
												>
													<LogOut className="w-4 h-4 mr-2" />
													Request to Leave
												</Button>
											</DialogTrigger>
											<DialogContent>
												<DialogHeader>
													<DialogTitle className="flex items-center gap-2">
														<AlertTriangle className="w-5 h-5 text-destructive" />
														Request to Leave Tour
													</DialogTitle>
													<DialogDescription>
														Please provide a valid reason for leaving this tour.
														The organization will review your request and may
														criticize your departure if the reason is not valid,
														which could affect your rating.
													</DialogDescription>
												</DialogHeader>
												<div className="space-y-4 py-4">
													<div className="space-y-2">
														<Label htmlFor="leave-reason">
															Reason for leaving (minimum 20 characters)
														</Label>
														<Textarea
															id="leave-reason"
															placeholder="Explain why you need to leave this tour..."
															value={leaveReason}
															onChange={(e) => setLeaveReason(e.target.value)}
															rows={4}
														/>
														<p className="text-xs text-muted-foreground">
															{leaveReason.length}/20 characters minimum
														</p>
													</div>
												</div>
												<DialogFooter>
													<Button
														variant="outline"
														onClick={() => {
															setLeaveDialogOpen(false);
															setLeaveReason("");
														}}
													>
														Cancel
													</Button>
													<Button
														variant="destructive"
														disabled={leaveReason.length < 20 || leaveTourMutation.isPending}
														onClick={() =>
															leaveTourMutation.mutate({
																tourID: id,
																reason: leaveReason,
															})
														}
													>
														{leaveTourMutation.isPending ? (
															<>
																<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																Submitting...
															</>
														) : (
															"Submit Request"
														)}
													</Button>
												</DialogFooter>
											</DialogContent>
										</Dialog>
										<Button
											variant="outline"
											className="w-full"
											onClick={() => setContactDialogOpen(true)}
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
										onClick={() => setContactDialogOpen(true)}
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
									{userRole === "ORGANIZATION" && isOwner && (
										<div className="flex justify-between">
											<span className="text-muted-foreground">
												Applicants
											</span>
											<span className="font-semibold text-primary">
												{pendingApplicants.length} pending
											</span>
										</div>
									)}
								</div>

								{/* Assigned Guide Section - Only visible when guide is assigned and for organization owners */}
								{userRole === "ORGANIZATION" && isOwner && tourData.tour.guide && (
									<div className="mt-6 pt-6 border-t">
										<h3 className="font-semibold mb-3 flex items-center gap-2">
											<User className="w-4 h-4" />
											Assigned Guide
										</h3>
										<div className="space-y-3">
											<div className="flex items-center gap-3">
												<Avatar className="w-12 h-12">
													<AvatarImage
														src={"user" in tourData.tour.guide ? tourData.tour.guide.user?.image ?? undefined : undefined}
													/>
													<AvatarFallback>
														{"user" in tourData.tour.guide ? tourData.tour.guide.user?.name?.[0] ?? "G" : "G"}
													</AvatarFallback>
												</Avatar>
												<div className="flex-1 min-w-0">
													<p className="font-semibold truncate">
														{"user" in tourData.tour.guide ? tourData.tour.guide.user?.name ?? "Unknown Guide" : "Unknown Guide"}
													</p>
													<p className="text-sm text-muted-foreground truncate">
														{"user" in tourData.tour.guide ? tourData.tour.guide.user?.email : ""}
													</p>
												</div>
											</div>
											
											{tourData.tour.guide.school && (
												<div className="flex items-center gap-2 text-sm text-muted-foreground">
													<GraduationCap className="w-4 h-4" />
													<span>{tourData.tour.guide.school}</span>
												</div>
											)}

											{tourData.tour.guide.description && (
												<p className="text-sm text-muted-foreground line-clamp-2">
													{tourData.tour.guide.description}
												</p>
											)}

											{tourData.tour.guide.certificates && tourData.tour.guide.certificates.length > 0 && (
												<div className="flex flex-wrap gap-1">
													{tourData.tour.guide.certificates.slice(0, 2).map((cert, idx) => (
														<Badge key={idx} variant="secondary" className="text-xs">
															{cert}
														</Badge>
													))}
													{tourData.tour.guide.certificates.length > 2 && (
														<Badge variant="secondary" className="text-xs">
															+{tourData.tour.guide.certificates.length - 2} more
														</Badge>
													)}
												</div>
											)}

											<div className="flex gap-2 pt-2">
												{tourData.tour.guide.cvUrl && (
													<Button
														variant="outline"
														size="sm"
														className="flex-1"
														asChild
													>
														<a
															href={tourData.tour.guide.cvUrl}
															target="_blank"
															rel="noopener noreferrer"
														>
															<FileText className="w-4 h-4 mr-1" />
															View CV
														</a>
													</Button>
												)}
												<Button
													variant="outline"
													size="sm"
													className="flex-1"
													onClick={() => router.push(`/guide/${tourData.tour.guideID}`)}
												>
													<User className="w-4 h-4 mr-1" />
													Full Profile
												</Button>
											</div>
										</div>
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</main>

			{/* Contact Business Dialog */}
			<Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<Building2 className="w-5 h-5" />
							Contact Business
						</DialogTitle>
						<DialogDescription>
							Get in touch with the tour organizer
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-4 py-4">
						{tourData.tour.owner && (
							<>
								<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
									<User className="w-5 h-5 text-muted-foreground" />
									<div>
										<p className="text-sm text-muted-foreground">Business Name</p>
										<p className="font-medium">{tourData.tour.owner.name}</p>
									</div>
								</div>
								{tourData.tour.owner.phonenumber && (
									<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
										<Phone className="w-5 h-5 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">Hotline</p>
											<a 
												href={`tel:${tourData.tour.owner.phonenumber}`}
												className="font-medium text-primary hover:underline"
											>
												{tourData.tour.owner.phonenumber}
											</a>
										</div>
									</div>
								)}
								{tourData.tour.owner.email && (
									<div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
										<Mail className="w-5 h-5 text-muted-foreground" />
										<div>
											<p className="text-sm text-muted-foreground">Email</p>
											<a 
												href={`mailto:${tourData.tour.owner.email}`}
												className="font-medium text-primary hover:underline"
											>
												{tourData.tour.owner.email}
											</a>
										</div>
									</div>
								)}
							</>
						)}
					</div>
					<DialogFooter>
						<Button variant="outline" onClick={() => setContactDialogOpen(false)}>
							Close
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};

export default TourDetail;
