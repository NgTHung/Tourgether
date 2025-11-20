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

type UserRole = "student" | "business";

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
  const [userRole] = useState<UserRole>("student");

  // Mock data for different views
  const mockData = {
    student: {
      completedTours: [
        {
          id: "1",
          title: "Historic City Walking Tour",
          location: "Rome, Italy",
          date: "April 15, 2024",
          businessName: "Rome Adventures Co.",
          earnings: 120,
          rating: 4.8,
          travelers: 12,
          imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80",
          reviews: [
            { id: "1", traveler: "John Doe", rating: 5, comment: "Amazing guide! Very knowledgeable and friendly." },
            { id: "2", traveler: "Sarah Johnson", rating: 4, comment: "Great tour, learned so much about Roman history." }
          ]
        }
      ] as StudentTour[]
    },
    business: {
      completedTours: [
        {
          id: "1",
          title: "Historic City Walking Tour",
          location: "Rome, Italy",
          date: "April 15, 2024",
          guide: "Marco Rossi",
          finalRevenue: 1800,
          travelers: 12,
          rating: 4.8,
          imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80"
        }
      ] as BusinessTour[]
    }
  };

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
      {mockData.student.completedTours.map((tour: StudentTour) => (
        <Card key={tour.id}>
          <CardContent className="p-6">
            <div className="flex gap-6">
              <img
                src={tour.imageUrl}
                alt={tour.title}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{tour.title}</h3>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {tour.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {tour.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {tour.travelers} travelers
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <StarRating rating={tour.rating} />
                      <span className="font-medium">{tour.rating}</span>
                    </div>
                    <div className="flex items-center gap-2 text-green-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-semibold">${tour.earnings} earned</span>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => router.push(`/tour/${tour.id}`)}>
                    View Details
                  </Button>
                </div>

                {/* Reviews Section */}
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Traveler Reviews ({tour.reviews.length})</h4>
                  <div className="space-y-3">
                    {tour.reviews.map((review: Review) => (
                      <div key={review.id} className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>{review.traveler[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{review.traveler}</span>
                            <StarRating rating={review.rating} />
                          </div>
                          <p className="text-sm text-muted-foreground">{review.comment}</p>
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
      {mockData.business.completedTours.map((tour: BusinessTour) => (
        <Card key={tour.id}>
          <CardContent className="p-6">
            <div className="flex gap-6">
              <img
                src={tour.imageUrl}
                alt={tour.title}
                className="w-32 h-32 rounded-lg object-cover"
              />
              <div className="flex-1 space-y-4">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{tour.title}</h3>
                  <div className="flex items-center gap-4 text-muted-foreground text-sm">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {tour.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {tour.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      Guide: {tour.guide}
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
                      <div className="text-2xl font-bold text-green-600">${tour.finalRevenue}</div>
                      <div className="text-xs text-muted-foreground">Final Revenue</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{tour.travelers}</div>
                      <div className="text-xs text-muted-foreground">Travelers Joined</div>
                    </div>
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
            {userRole === "student" && "Review your completed guide experiences and traveler feedback"}
            {userRole === "business" && "View your completed tours with revenue and performance data"}
          </p>
        </div>

        {userRole === "student" && renderStudentView()}
        {userRole === "business" && renderBusinessView()}
      </main>
    </>
  );
};

export default PreviousTours;