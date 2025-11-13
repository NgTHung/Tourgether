import { useState } from "react";
import Header from "@/components/Header";
import TourCard from "@/components/TourCard";
import FilterBar, { FilterState } from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TravelerDashboard = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<FilterState>({ city: "", priceRange: [0, 500] });
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
      rating: 4.8,
      businessName: "Rome Adventures Co.",
      imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
    },
    {
      id: "2",
      title: "Mountain Hiking Experience",
      location: "Swiss Alps",
      date: "June 10, 2024",
      price: 200,
      rating: 4.9,
      businessName: "Alpine Tours",
      imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    },
    {
      id: "3",
      title: "Coastal Sunset Cruise",
      location: "Santorini, Greece",
      date: "May 25, 2024",
      price: 120,
      rating: 4.7,
      businessName: "Greek Island Tours",
      imageUrl: "https://images.unsplash.com/photo-1613395877344-13d4a8e0d49e?w=800&q=80",
    },
    {
      id: "4",
      title: "Cultural Food Tour",
      location: "Bangkok, Thailand",
      date: "June 5, 2024",
      price: 80,
      rating: 4.6,
      businessName: "Thai Experiences",
      imageUrl: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&q=80",
    },
    {
      id: "5",
      title: "Desert Safari Adventure",
      location: "Dubai, UAE",
      date: "June 15, 2024",
      price: 180,
      rating: 4.8,
      businessName: "Desert Explorers",
      imageUrl: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800&q=80",
    },
    {
      id: "6",
      title: "Northern Lights Tour",
      location: "Reykjavik, Iceland",
      date: "July 1, 2024",
      price: 250,
      rating: 4.9,
      businessName: "Iceland Adventures",
      imageUrl: "https://images.unsplash.com/photo-1483347756197-71ef80e95f73?w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="traveler" />
      
      <main className="container py-8 px-4">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Compass className="w-6 h-6 text-accent" />
            </div>
            <h1 className="text-3xl font-bold">Discover Tours</h1>
          </div>
          <p className="text-muted-foreground">
            Browse amazing experiences around the world
          </p>
        </div>

        {/* 2-Column Layout */}
        <div className="flex gap-8">
          {/* Left Column - Fixed Filter Panel */}
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-8">
              <FilterBar userRole="traveler" onApplyFilters={handleApplyFilters} />
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
                      navigate("/previous-tours");
                    }
                  }}
                  className="rounded-md"
                >
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
                      label: "Book Now",
                      variant: "accent",
                      onClick: () => navigate(`/tour/${tour.id}`),
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TravelerDashboard;
