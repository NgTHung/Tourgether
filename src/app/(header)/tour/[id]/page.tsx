"use client";
import { useState, use } from "react";
import { MapPin, Calendar, DollarSign, Clock, Star, User, Edit, Camera } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Badge } from "~/components/ui/badge";
import { useRouter } from "next/navigation";

const TourDetail = ({
  params,
}:{
  params: Promise<{ id: string }>;
}) => {
  const id = use(params).id;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");
  
  // Mock user role - in real app this would come from auth context
  const [userRole] = useState<"student" | "business">("business");
  const [isOwner] = useState(true); // Mock ownership check - in real app this would be based on business ID

  // Mock data
  const tour = {
    title: "Historic City Walking Tour",
    location: "Rome, Italy",
    date: "May 15, 2024",
    price: 150,
    rating: 4.8,
    businessName: "Rome Adventures Co.",
    imageUrl: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
      "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&q=80",
      "https://images.unsplash.com/photo-1515542622106-78bda8ba0e5b?w=800&q=80",
      "https://images.unsplash.com/photo-1525874684015-58379d421a52?w=800&q=80",
      "https://images.unsplash.com/photo-1539650116574-75c0c6d73f06?w=800&q=80",
      "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=800&q=80"
    ],
    description:
      "Experience the eternal city like never before with our comprehensive walking tour through Rome's most iconic landmarks and hidden gems.",
    itinerary: [
      { time: "09:00 AM", place: "Meeting Point - Piazza Navona", description: "Meet your guide and fellow travelers" },
      { time: "09:30 AM", place: "Pantheon", description: "Marvel at ancient Roman architecture" },
      { time: "10:30 AM", place: "Trevi Fountain", description: "Make a wish at Rome's most famous fountain" },
      { time: "11:30 AM", place: "Spanish Steps", description: "Climb the iconic steps" },
      { time: "12:30 PM", place: "Local Trattoria", description: "Enjoy authentic Italian lunch" },
      { time: "02:00 PM", place: "Colosseum", description: "Tour the ancient amphitheater" },
      { time: "03:30 PM", place: "Roman Forum", description: "Walk through ancient Rome" },
      { time: "05:00 PM", place: "End Tour", description: "Tour concludes at Colosseum" },
    ],
  };

  const appliedStudents = [
    { id: "1", name: "Sarah Johnson", rating: 4.9, tours: 24, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { id: "2", name: "Marco Rossi", rating: 4.8, tours: 18, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marco" },
    { id: "3", name: "Emma Chen", rating: 4.7, tours: 32, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
  ];

  return (
    <>
          {/* Hero Image */}
      <div className="relative h-96 w-full overflow-hidden">
        <img
          src={tour.imageUrl}
          alt={tour.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-background to-transparent" />
      </div>

      <main className="container mx-auto py-8 px-4 -mt-32 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tour Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold mb-2">{tour.title}</h1>
                    <p className="text-muted-foreground">{tour.businessName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="text-base">
                      <Star className="w-4 h-4 mr-1 fill-accent text-accent" />
                      {tour.rating}
                    </Badge>
                    {/* Edit Tour Button - Only visible to business owner */}
                    {userRole === "business" && isOwner && (
                      <Button 
                        onClick={() => router.push(`/business/edit-tour/${id}`)} 
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
                    <span>{tour.location}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="w-5 h-5 mr-2 text-primary" />
                    <span>{tour.date}</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Clock className="w-5 h-5 mr-2 text-primary" />
                    <span>8 hours</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full">
                <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                {/* Conditional Admin Tabs - Only visible to business owner */}
                {userRole === "business" && isOwner && (
                  <TabsTrigger value="students" className="flex-1">Applied Students</TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="details" className="mt-6 space-y-6">
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
                      {tour.gallery.map((image, index) => (
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
                    <p className="text-muted-foreground leading-relaxed mb-6">
                      {tour.description}
                    </p>
                    
                    {/* Itinerary */}
                    <div className="mb-6">
                      <h3 className="font-semibold mb-4">Itinerary</h3>
                      <div className="relative space-y-4 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                        {tour.itinerary.slice(0, 4).map((item, index) => (
                          <div key={index} className="relative pl-10">
                            <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                              {index + 1}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center gap-3">
                                <p className="text-sm font-semibold text-primary">{item.time}</p>
                                <p className="font-semibold">{item.place}</p>
                              </div>
                              <p className="text-sm text-muted-foreground">{item.description}</p>
                            </div>
                          </div>
                        ))}
                        {tour.itinerary.length > 4 && (
                          <p className="text-sm text-muted-foreground pl-10">
                            And {tour.itinerary.length - 4} more stops...
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="font-semibold">What&apos;s Included:</h3>
                      <ul className="space-y-2 text-muted-foreground">
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3" />
                          Professional English-speaking guide
                        </li>
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3" />
                          Skip-the-line tickets to attractions
                        </li>
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3" />
                          Traditional Italian lunch
                        </li>
                        <li className="flex items-start">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 mr-3" />
                          Water and snacks throughout the tour
                        </li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Admin Only Tabs */}
              {userRole === "business" && isOwner && (
                <>
                  <TabsContent value="students" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Applied Students ({appliedStudents.length})</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {appliedStudents.map((student) => (
                            <div
                              key={student.id}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center gap-4">
                                <Avatar className="w-12 h-12">
                                  <AvatarImage src={student.avatar} />
                                  <AvatarFallback>{student.name[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-semibold">{student.name}</p>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                    <span className="flex items-center">
                                      <Star className="w-3 h-3 mr-1 fill-accent text-accent" />
                                      {student.rating}
                                    </span>
                                    <span>{student.tours} tours completed</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  View Profile
                                </Button>
                                <Button variant="gradient" size="sm">
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
                  <p className="text-sm text-muted-foreground mb-1">Price per person</p>
                  <div className="flex items-baseline gap-1">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-3xl font-bold">{tour.price}</span>
                  </div>
                </div>

                {/* Show different actions based on user role */}
                {userRole === "student" && (
                  <>
                    <Button variant="gradient" size="lg" className="w-full mb-3">
                      Apply as Guide
                    </Button>
                    <Button variant="outline" className="w-full">
                      Contact Business
                    </Button>
                  </>
                )}

                {userRole === "business" && isOwner && (
                  <>
                    <Button 
                      variant="gradient" 
                      size="lg" 
                      className="w-full mb-3"
                      onClick={() => router.push(`/business/edit-tour/${id}`)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Tour
                    </Button>
                    <Button variant="outline" className="w-full">
                      View Analytics
                    </Button>
                  </>
                )}

                {userRole === "business" && !isOwner && (
                  <Button variant="outline" className="w-full">
                    Contact Business Owner
                  </Button>
                )}

                <div className="mt-6 pt-6 border-t space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-semibold">8 hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Group Size</span>
                    <span className="font-semibold">Max 15 people</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Languages</span>
                    <span className="font-semibold">English, Italian</span>
                  </div>
                  {userRole === "business" && isOwner && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Applicants</span>
                      <span className="font-semibold text-primary">{appliedStudents.length} pending</span>
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
