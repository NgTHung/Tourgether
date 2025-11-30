"use client"

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Header from "~/components/Header";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import TagsInput from "~/components/TagsInput";
import ImageUpload from "~/components/ImageUpload";
import TourPreview from "~/components/TourPreview";
import ItineraryBuilder from "~/components/ItineraryBuilder";
import { ArrowLeft, Calendar } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";

interface ItineraryItem {
  id: string;
  title: string;
  location: string;
  duration: number;
  description: string;
  time: string;
  activities: number;
  createdAt: Date;
  updatedAt: Date;
}

const CreateTour = ({  params,
}:{
  params: Promise<{ id: string }>;
}) => {
  const id = use(params).id;
  const isEditing = !!id;
  const router = useRouter();

  const [tourData, tourDataQuery] = isEditing
    ? api.tour.getTourById.useSuspenseQuery({id: id, shouldGetTags: true})
    : [{ title: "", description: "", price: 0, location: "", tags: [], images: [], itinerary: [] }];

  const [title, setTitle] = useState(tourData.tour?.name || "");
  const [description, setDescription] = useState(tourData.tour?.description || "");
  const [price, setPrice] = useState(tourData.tour?.price || 0);
  const [location, setLocation] = useState(tourData.tour?.location || "");
  const [tags, setTags] = useState(tourData.tags);
  const [images, setImages] = useState<string[]>(tourData.tour?.thumbnailUrl ? [tourData.tour.thumbnailUrl] : []);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(tourData.tour?.itineraries || []);

  const handleSave = () => {
    if (!title || !description || !price || !location) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success(isEditing ? "Tour updated successfully!" : "Tour created successfully!");
    router.push("/business/dashboard");
  };

  const handleItinerarySave = (newItinerary: ItineraryItem[]) => {
    setItinerary(newItinerary);
    toast.success("Itinerary updated successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <Header userRole="business" /> */}

      <main className="container py-6 px-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/business/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-6">
          {isEditing ? "Edit Tour" : "Create New Tour"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-250px)]">
          {/* Left Column: Form */}
          <div className="overflow-y-auto pr-4 space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Basic Information</h2>
              
              <div className="space-y-2">
                <Label htmlFor="title">Tour Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Historic City Walking Tour"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Tour Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your tour experience..."
                  rows={6}
                />
              </div>
            </div>

            {/* Gallery Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Tour Gallery</h2>
              <ImageUpload images={images} onImagesChange={setImages} />
              <p className="text-sm text-muted-foreground">
                First image will be the cover. Drag to reorder.
              </p>
            </div>

            {/* Details Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Details</h2>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price (USD) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(parseInt(e.target.value))}
                  placeholder="150"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location/City *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Rome, Italy"
                />
              </div>

              <div className="space-y-2">
                <Label>Tags/Keywords</Label>
                <TagsInput
                  tags={tags}
                  onTagsChange={setTags}
                  placeholder="Type a tag and press Enter (e.g., adventure, historical)"
                />
              </div>
            </div>

            {/* Itinerary Section */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold border-b pb-2">Tour Itinerary</h2>
              
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-muted-foreground">
                    {itinerary.length > 0 
                      ? `${itinerary.length} stops planned` 
                      : "No itinerary created yet"
                    }
                  </p>
                  <ItineraryBuilder
                    initialItinerary={itinerary}
                    onSave={handleItinerarySave}
                  >
                    <Button variant="outline" size="sm">
                      <Calendar className="w-4 h-4 mr-2" />
                      {itinerary.length > 0 ? "Edit Itinerary" : "Add Itinerary"}
                    </Button>
                  </ItineraryBuilder>
                </div>
                
                {itinerary.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {itinerary.slice(0, 3).map((item, index) => (
                      <div key={item.id} className="flex items-center text-sm">
                        <span className="w-16 font-mono text-primary">{item.time}</span>
                        <span className="flex-1">{item.title}</span>
                      </div>
                    ))}
                    {itinerary.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{itinerary.length - 3} more stops...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleSave} size="lg" className="w-full" variant="gradient">
              {isEditing ? "Update Tour" : "Create Tour"}
            </Button>
          </div>

          {/* Right Column: Preview */}
          <div className="hidden lg:block sticky top-6 h-[calc(100vh-250px)]">
            <div className="h-full border rounded-lg overflow-hidden">
              <div className="bg-primary text-primary-foreground px-4 py-2 font-semibold">
                Preview (Traveler View)
              </div>
              <TourPreview
                title={title}
                description={description}
                images={images}
                price={price}
                location={location}
                tags={tags}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateTour;
