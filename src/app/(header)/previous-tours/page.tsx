"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback } from "~/components/ui/avatar";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp
} from "lucide-react";
import { useSession } from "~/components/AuthProvider";
import { api } from "~/trpc/react";

const formatter = new Intl.DateTimeFormat("en-US", {
	month: "2-digit",
	day: "2-digit",
	year: "numeric",
});

interface Review {
  id: string;
  traveler: string;
  rating: number;
  comment: string;
}

interface StudentTour {
  id: string;
  title: string;
  location: string;
  date: string;
  businessName: string;
  earnings: number;
  rating: number;
  travelers: number;
  imageUrl: string;
  reviews: Review[];
}

interface BusinessTour {
  id: string;
  title: string;
  location: string;
  date: string;
  guide: string;
  finalRevenue: number;
  travelers: number;
  rating: number;
  imageUrl: string;
}

const PreviousTours = () => {
  const router = useRouter();
  // Mock user role - in real app this would come from auth context
  const {
    data: session,
    isPending, //loading state
    error, //error object
    refetch, //refetch the session
  } = useSession();

  const [cTour, cTourQuery] = api.tour.getCompletedTours.useSuspenseQuery();
  const StarRating = ({ 
    rating, 
    onRatingChange, 
    interactive = false 
  }: { 
    rating: number; 
    onRatingChange?: (rating: number) => void; 
    interactive?: boolean 
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={interactive ? () => onRatingChange?.(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const renderStudentView = () => (
    <div className="space-y-6">
      {cTour.map((tour) => (
        <Card key={tour.id}>
          <CardContent className="p-6">
            <div className="flex gap-6">
              <img
                src={tour.thumbnailUrl}
                alt={tour.name}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{tour.name}</h3>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {tour.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatter.format(tour.date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="outline" onClick={() => router.push(`/tour/${tour.id}`)}>
                    View Details
                  </Button>
                </div>

                {/* Reviews Section */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Traveler Reviews ({tour.reviews.length})</h4>
                  <div className="space-y-3">
                    {tour.reviews.map((review) => (
                      <div key={review.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{review.user?.name[0] ?? "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{review.user?.name ?? "Anonymous"}</span>
                            <StarRating rating={review.rating} />
                          </div>
                          <p className="text-sm text-muted-foreground">{review.review}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderBusinessView = () => (
    <div className="space-y-6">
      {cTour.map((tour) => (
        <Card key={tour.id}>
          <CardContent className="p-6">
            <div className="flex gap-6">
              <img
                src={tour.thumbnailUrl}
                alt={tour.name}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{tour.name}</h3>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {tour.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatter.format(tour.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Guide: {tour.guide?.user.name || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Business Admin Section */}
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Business Summary
                  </h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <span className="text-2xl font-bold">{tour.rating}</span>
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </div>
                      <div className="text-xs text-muted-foreground">Average Rating</div>
                    </div>
                  </div>
                </div>

                <Button variant="outline" onClick={() => router.push(`/business/tour/${tour.id}`)}>
                  View Full Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <main className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Previous Tours</h1>
          <p className="text-muted-foreground">
            {session?.user.role === "GUIDE" && "Review your completed guide experiences and traveler feedback"}
            {session?.user.role === "ORGANIZATION" && "View your completed tours with revenue and performance data"}
          </p>
        </div>

        {session?.user.role === "GUIDE" && renderStudentView()}
        {session?.user.role === "ORGANIZATION" && renderBusinessView()}
      </main>
    </>
  );
};

export default PreviousTours;