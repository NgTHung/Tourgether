"use client";

import { useState } from "react";
import TourCard from "~/components/TourCard";
import FilterBar, { type FilterState } from "~/components/FilterBar";
import { Plus, Building2, History } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { useSession } from "~/components/AuthProvider";

const BusinessDashboard = () => {
	const router = useRouter();
	const {
		data: session, //refetch the session
	} = useSession();
	const [filters, setFilters] = useState<FilterState>({ city: "" });
	const [activeTab, setActiveTab] = useState<"active" | "previous">("active");

	const handleApplyFilters = (newFilters: FilterState) => {
		setFilters(newFilters);
		console.log("Applied filters:", newFilters);
	};

	// Mock data
	// const myTours = [
	//   {
	//     id: "1",
	//     title: "Historic City Walking Tour",
	//     location: "Rome, Italy",
	//     date: "May 15, 2024",
	//     price: 150,
	//     applicants: 5,
	//     travelers: 12,
	//     imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
	//   },
	//   {
	//     id: "2",
	//     title: "Vatican Museums Private Tour",
	//     location: "Vatican City",
	//     date: "May 20, 2024",
	//     price: 200,
	//     applicants: 3,
	//     travelers: 8,
	//     imageUrl: "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&q=80",
	//   },
	// ];

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [myTours, myToursQuery] =
		api.tour.getOwnedTours.useSuspenseQuery(filters);

	return (
		<div className="min-h-screen bg-background">
			<main className="container mx-auto py-8 px-4">
				{/* Page Header */}
				<div className="mb-8 flex items-center justify-between">
					<div>
						<div className="flex items-center gap-3 mb-2">
							<div className="p-2 bg-primary/10 rounded-lg">
								<Building2 className="w-6 h-6 text-primary" />
							</div>
							<h1 className="text-3xl font-bold">
								Business Dashboard
							</h1>
						</div>
						<p className="text-muted-foreground">
							Manage your tours, view applicants, and grow your
							business
						</p>
					</div>
					<Button
						onClick={() => router.push("/business/create-tour")}
						variant="gradient"
						size="lg"
					>
						<Plus className="w-5 h-5 mr-2" />
						Create New Tour
					</Button>
				</div>

				{/* 2-Column Layout */}
				<div className="flex gap-8">
					{/* Left Column - Fixed Filter Panel */}
					<div className="w-80 shrink-0">
						<div className="sticky top-8">
							<FilterBar onApplyFilters={handleApplyFilters} />
						</div>
					</div>

					{/* Right Column - Content Panel */}
					<div className="flex-1 min-w-0">
						{/* Tab Navigation */}
						<div className="mb-6">
							<div className="flex gap-2 bg-muted rounded-lg p-1 w-fit">
								<Button
									variant={
										activeTab === "active"
											? "default"
											: "ghost"
									}
									size="sm"
									onClick={() => setActiveTab("active")}
									className="rounded-md"
								>
									Active Tours
								</Button>
								<Button
									variant={
										activeTab === "previous"
											? "default"
											: "ghost"
									}
									size="sm"
									onClick={() => {
										if (activeTab !== "previous") {
											router.push("/previous-tours");
										}
									}}
									className="rounded-md flex items-center gap-2"
								>
									<History className="w-4 h-4" />
									Previous Tours
								</Button>
							</div>
						</div>

						{/* Active Tours */}
						{activeTab === "active" && (
							<>
								{myTours.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
										{myTours.map((tour) => (
											<TourCard
												key={tour.id}
												id={tour.id}
												title={tour.name}
												imageUrl={tour.thumbnailUrl}
												location={tour.location}
												date={new Date(
													tour.date,
												).toLocaleDateString()}
												price={tour.price}
												businessName={
													session?.user.name ??
													"Your Business"
												}
												applicants={tour.applicantsCount}
												action={{
													label: "View Tour",
													variant: "default",
													onClick: () =>
														router.push(
															`/tour/${tour.id}`,
														),
												}}
											/>
										))}
									</div>
								) : (
									<div className="text-center py-16">
										<Building2 className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
										<h3 className="text-xl font-semibold mb-2">
											No active tours
										</h3>
										<p className="text-muted-foreground mb-6">
											Create your first tour to start
											connecting with students and
											travelers
										</p>
										<Button
											onClick={() =>
												router.push(
													"/business/create-tour",
												)
											}
											variant="gradient"
										>
											<Plus className="w-5 h-5 mr-2" />
											Create Your First Tour
										</Button>
									</div>
								)}
							</>
						)}

						{/* Previous Tours Placeholder */}
						{activeTab === "previous" && (
							<div className="text-center py-12">
								<History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
								<h3 className="text-xl font-semibold mb-2">
									No Previous Tours
								</h3>
								<p className="text-muted-foreground mb-6">
									Your completed tours will appear here with
									revenue and review data.
								</p>
								<Button
									onClick={() =>
										router.push("/previous-tours")
									}
									variant="outline"
								>
									View All Previous Tours
								</Button>
							</div>
						)}
					</div>
				</div>
			</main>
		</div>
	);
};

export default BusinessDashboard;
