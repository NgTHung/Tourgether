"use client";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Star, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  TrendingUp,
  MessageSquarePlus,
  BarChart3
} from "lucide-react";
import { useSession } from "~/components/AuthProvider";
import { api } from "~/trpc/react";
import ReactMarkdown from "react-markdown";
import { parseRating } from "~/lib/rating-utils";
import Image from "next/image";

const formatter = new Intl.DateTimeFormat("en-US", {
	month: "2-digit",
	day: "2-digit",
	year: "numeric",
});

const PreviousTours = () => {
  const router = useRouter();
  const {
    data: session,
  } = useSession();

  // Use the new previousTours API
  const [previousTours] = api.previousTours.getMyPreviousTours.useSuspenseQuery();
  const [guidedTours] = session?.user.role === "GUIDE" 
    ? api.previousTours.getMyGuidedPreviousTours.useSuspenseQuery()
    : [[]];

  const StarRating = ({ 
    rating, 
  }: { 
    rating: string | number; 
  }) => {
    const ratingNum = parseRating(rating);
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= ratingNum ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  const renderStudentView = () => (
    <div className="space-y-6">
      {guidedTours.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Completed Tours</h3>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t guided any completed tours yet.
            </p>
            <Button onClick={() => router.push("/student/dashboard")}>
              Browse Available Tours
            </Button>
          </CardContent>
        </Card>
      ) : (
        guidedTours.map((tour) => (
          <Card key={tour.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="relative w-32 h-32 shrink-0">
                  <Image
                    fill
                    src={tour.thumbnailUrl}
                    alt={tour.name}
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{tour.name}</h3>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Completed
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-muted-foreground text-sm">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {tour.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatter.format(tour.date)}
                      </span>
                      {tour.averageRating && (
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          {tour.averageRating}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/previous-tours/${tour.id}`)}
                    >
                      View Details
                    </Button>
                  </div>

                  {/* Feedbacks Preview */}
                  {tour.feedbacks && tour.feedbacks.length > 0 && (
                    <div className="pt-4 border-t">
                      <h4 className="font-semibold mb-3">
                        Recent Feedbacks ({tour.feedbacks.length})
                      </h4>
                      <div className="space-y-3">
                        {tour.feedbacks.slice(0, 2).map((feedback) => (
                          <div key={feedback.id} className="flex gap-3">
                            <Avatar className="w-8 h-8">
                              <AvatarImage src={feedback.user?.image ?? undefined} />
                              <AvatarFallback>
                                {feedback.user?.name?.[0] ?? "U"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {feedback.user?.name ?? "Anonymous"}
                                </span>
                                <StarRating rating={feedback.rating} />
                              </div>
                              <div className="text-sm text-muted-foreground line-clamp-2 prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown>
                                  {feedback.feedback}
                                </ReactMarkdown>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  const renderBusinessView = () => (
    <div className="space-y-6">
      {previousTours.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <TrendingUp className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Completed Tours</h3>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t completed any tours yet. Mark a tour as finished to see it here.
            </p>
            <Button onClick={() => router.push("/business/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      ) : (
        previousTours.map((tour) => (
          <Card key={tour.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="relative w-32 h-32 shrink-0">
                  <Image
                    fill
                    src={tour.thumbnailUrl}
                    alt={tour.name}
                    className="rounded-lg object-cover"
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{tour.name}</h3>
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Completed
                      </Badge>
                    </div>
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
                        Guide: {tour.guideName ?? "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Business Analytics Summary */}
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Summary
                    </h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <DollarSign className="w-4 h-4 text-green-600" />
                          <span className="text-xl font-bold">{tour.price}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Price</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xl font-bold">{tour.totalTravelers ?? 0}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Travelers</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xl font-bold">{tour.averageRating ?? "N/A"}</span>
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        </div>
                        <div className="text-xs text-muted-foreground">Rating</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-xl font-bold">{tour.feedbacks?.length ?? 0}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Feedbacks</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => router.push(`/previous-tours/${tour.id}`)}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button 
                      variant="gradient"
                      onClick={() => router.push(`/previous-tours/${tour.id}`)}
                    >
                      <MessageSquarePlus className="w-4 h-4 mr-2" />
                      Upload Feedback
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
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
            {session?.user.role === "ORGANIZATION" && "View your completed tours with analytics and feedback data"}
          </p>
        </div>

        {session?.user.role === "GUIDE" && renderStudentView()}
        {session?.user.role === "ORGANIZATION" && renderBusinessView()}
      </main>
    </>
  );
};

export default PreviousTours;