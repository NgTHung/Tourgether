"use client";
import { useState } from "react";
import Header from "~/components/Header";
import TourCard from "~/components/TourCard";
import FilterBar, { type FilterState } from "~/components/FilterBar";
import { Button } from "~/components/ui/button";
import { GraduationCap, History } from "lucide-react";
import { useRouter } from "next/navigation";

const StudentDashboard = () => {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({ city: "" });
  const [activeTab, setActiveTab] = useState<"available" | "previous">("available");

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
    console.log("Applied filters:", newFilters);
  };

  // Mock data
  const availableTours = [
    {
      id: "1",
      title: "Historic City Walking Tour",
      location: "Rome, Italy",
      date: "May 15, 2024",
      price: 150,
      businessName: "Rome Adventures Co.",
      applicants: 5,
      imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    },
    {
      id: "2",
      title: "Mountain Hiking Experience",
      location: "Swiss Alps",
      date: "June 10, 2024",
      price: 200,
      businessName: "Alpine Tours",
      applicants: 3,
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    },
    {
      id: "3",
      title: "Coastal Sunset Cruise",
      location: "Santorini, Greece",
      date: "May 25, 2024",
      price: 120,
      businessName: "Greek Island Tours",
      applicants: 8,
      imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80",
    },
    {
      id: "4",
      title: "Cultural Food Tour",
      location: "Bangkok, Thailand",
      date: "June 5, 2024",
      price: 80,
      businessName: "Thai Experiences",
      applicants: 12,
      imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    },
  ];

  return (
    <>      
      <main className="container py-8 px-4">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <GraduationCap className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Student Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Browse opportunities and manage your tour guide career
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="flex gap-8">
          {/* Left Column - Fixed Filter Panel */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-8">
              <FilterBar userRole="student" onApplyFilters={handleApplyFilters} />
            </div>
          </div>

          {/* Right Column - Content Panel */}
          <div className="flex-1 min-w-0">
            {/* Tab Navigation */}
            <div className="mb-6">
              <div className="flex gap-2 bg-muted rounded-lg p-1 w-fit">
                <Button
                  variant={activeTab === "available" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab("available")}
                  className="rounded-md"
                >
                  Available Tours
                </Button>
                <Button
                  variant={activeTab === "previous" ? "default" : "ghost"}
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

            {/* Tours Grid */}
            {activeTab === "available" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {availableTours.map((tour) => (
                  <TourCard
                    key={tour.id}
                    {...tour}
                    action={{
                      label: "Apply Now",
                      variant: "gradient",
                      onClick: () => router.push(`/tour/${tour.id}`),
                    }}
                  />
                ))}
              </div>
            )}

            {/* Previous Tours Placeholder */}
            {activeTab === "previous" && (
              <div className="text-center py-12">
                <History className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Previous Tours</h3>
                <p className="text-muted-foreground mb-6">
                  You haven&apos;t completed any tours yet. Start applying for available opportunities!
                </p>
                <Button onClick={() => router.push("/previous-tours")} variant="outline">
                  View All Previous Tours
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default StudentDashboard;
