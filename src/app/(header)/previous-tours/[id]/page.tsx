"use client";
import { useState, use } from "react";
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
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "~/components/ui/dialog";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
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
	const [feedbackText, setFeedbackText] = useState("");
	const [feedbackRating, setFeedbackRating] = useState(5);

	const {
		data: session,
	} = useSession();

	const [tourData, tourQuery] = api.previousTours.getPreviousTourById.useSuspenseQuery(id);

	const addFeedbackMutation = api.previousTours.addFeedback.useMutation({
		onSuccess: () => {
			toast.success("Feedback added successfully!");
			setFeedbackOpen(false);
			setFeedbackText("");
			setFeedbackRating(5);
			void tourQuery.refetch();
		},
		onError: (error) => {
			toast.error(`Failed to add feedback: ${error.message}`);
		},
	});

	const userRole = session?.user?.role ?? "GUIDE";
	const isOwner = tourData.ownerUserID === session?.user?.id;

	const handleSubmitFeedback = () => {
		if (!feedbackText.trim()) {
			toast.error("Please enter feedback text");
			return;
		}
		addFeedbackMutation.mutate({
			previousTourId: id,
			rating: feedbackRating,
			feedback: feedbackText,
		});
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
							<CardHeader className="flex flex-row items-center justify-between">
								<CardTitle>
									Feedbacks ({tourData.feedbacks?.length ?? 0})
								</CardTitle>
								{userRole === "ORGANIZATION" && isOwner && (
									<Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
										<DialogTrigger asChild>
											<Button variant="outline" size="sm">
												<MessageSquarePlus className="w-4 h-4 mr-2" />
												Add Feedback
											</Button>
										</DialogTrigger>
										<DialogContent>
											<DialogHeader>
												<DialogTitle>Add Feedback</DialogTitle>
												<DialogDescription>
													Share your feedback about this completed tour.
												</DialogDescription>
											</DialogHeader>
											<div className="space-y-4 py-4">
												<div className="space-y-2">
													<Label>Rating</Label>
													<StarRating
														rating={feedbackRating}
														onRatingChange={setFeedbackRating}
														interactive
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="feedback">Feedback</Label>
													<Textarea
														id="feedback"
														value={feedbackText}
														onChange={(e) => setFeedbackText(e.target.value)}
														placeholder="Write your feedback here..."
														rows={4}
													/>
												</div>
											</div>
											<div className="flex justify-end gap-2">
												<Button
													variant="outline"
													onClick={() => setFeedbackOpen(false)}
												>
													Cancel
												</Button>
												<Button
													onClick={handleSubmitFeedback}
													disabled={addFeedbackMutation.isPending}
												>
													{addFeedbackMutation.isPending
														? "Submitting..."
														: "Submit Feedback"}
												</Button>
											</div>
										</DialogContent>
									</Dialog>
								)}
							</CardHeader>
							<CardContent>
								{tourData.feedbacks && tourData.feedbacks.length > 0 ? (
									<div className="space-y-4">
										{tourData.feedbacks.map((feedback) => (
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
											</div>
										))}
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
					<div className="lg:col-span-1">
						<Card className="sticky top-20">
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
										<span className="text-muted-foreground">Total Revenue</span>
										<div className="flex items-center font-semibold text-green-600">
											<DollarSign className="w-4 h-4" />
											{tourData.totalRevenue ?? 0}
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
					</div>
				</div>
			</main>
		</>
	);
};

export default PreviousTourDetail;
