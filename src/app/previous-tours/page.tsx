import { useState } from "react";
import { redirect } from "next/navigation";
import Header from "~/components/Header";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  MessageSquare,
  Send
} from "lucide-react";

type UserRole = "student" | "business" | "traveler";

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

interface TravelerTour {
  id: string;
  title: string;
  location: string;
  date: string;
  businessName: string;
  guide: string;
  price: number;
  rating: number;
  imageUrl: string;
  myReview: null | Review;
}

const PreviousTours = () => {
  // Mock user role - in real app this would come from auth context
  const [userRole] = useState<UserRole>("traveler");
  const [newReview, setNewReview] = useState("");
  const [tourRating, setTourRating] = useState(0);
  const [guideRating, setGuideRating] = useState(0);

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
    },
    traveler: {
      completedTours: [
        {
          id: "1",
          title: "Historic City Walking Tour",
          location: "Rome, Italy",
          date: "April 15, 2024",
          businessName: "Rome Adventures Co.",
          guide: "Marco Rossi",
          price: 150,
          rating: 4.8,
          imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=400&q=80",
          myReview: null // null means no review left yet
        }
      ] as TravelerTour[]
    }
  };

  const data = mockData[userRole];

  const getTypedTours = () => {
    if (userRole === "student") {
      return mockData.student.completedTours;
    } else if (userRole === "business") {
      return mockData.business.completedTours;
    } else {
      return mockData.traveler.completedTours;
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

  const handleSubmitReview = () => {
    if (!newReview.trim() || tourRating === 0 || guideRating === 0) {
      return;
    }
    
    console.log("Submitting review:", {
      review: newReview,
      tourRating,
      guideRating
    });
    
    // Reset form
    setNewReview("");
    setTourRating(0);
    setGuideRating(0);
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
                  <Button variant="outline" onClick={() => redirect(`/tour/${tour.id}`)}>
                    View Details
                  </Button>
                </div>

                {/* Total Ratings and Reviews Section */}
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

                <Button variant="outline" onClick={() => redirect(`/business/tour/${tour.id}`)}>
                  View Full Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderTravelerView = () => (
    <div className="space-y-6">
      {mockData.traveler.completedTours.map((tour: TravelerTour) => (
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
                      <DollarSign className="w-4 h-4" />
                      ${tour.price}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Guide: {tour.guide} • {tour.businessName}
                  </p>
                </div>

                <Button variant="outline" onClick={() => redirect(`/tour/${tour.id}`)}>
                  View Tour Details
                </Button>

                {/* Leave a Review Section */}
                {!tour.myReview && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold mb-4 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Leave a Review
                    </h4>
                    <div className="space-y-4">
                      <div className="flex gap-8">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Rate the Tour</label>
                          <StarRating 
                            rating={tourRating} 
                            onRatingChange={setTourRating} 
                            interactive 
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Rate the Guide</label>
                          <StarRating 
                            rating={guideRating} 
                            onRatingChange={setGuideRating} 
                            interactive 
                          />
                        </div>
                      </div>
                      <Textarea
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                        placeholder="Share your experience with other travelers..."
                        className="min-h-[80px]"
                      />
                      <Button 
                        onClick={handleSubmitReview}
                        disabled={!newReview.trim() || tourRating === 0 || guideRating === 0}
                        className="w-full sm:w-auto"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Submit Review
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header userRole={userRole} />
      
      <main className="container py-8 px-4">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => redirect(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">Previous Tours</h1>
          <p className="text-muted-foreground">
            {userRole === "student" && "Review your completed guide experiences and traveler feedback"}
            {userRole === "business" && "View your completed tours with revenue and performance data"}
            {userRole === "traveler" && "Rate and review your travel experiences"}
          </p>
        </div>

        {userRole === "student" && renderStudentView()}
        {userRole === "business" && renderBusinessView()}
        {userRole === "traveler" && renderTravelerView()}
      </main>
    </div>
  );
};

export default PreviousTours;