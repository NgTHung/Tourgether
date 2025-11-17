import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { redirect } from "next/navigation";
import Header from "~/components/Header";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import TagsInput from "~/components/TagsInput";
import FileUpload from "~/components/FileUpload";
import TourPreview from "~/components/TourPreview";
import ItineraryBuilder from "~/components/ItineraryBuilder";
import { ArrowLeft, Calendar, Plus } from "lucide-react";
import { toast } from "sonner";

interface ItineraryItem {
  id: string;
  time: string;
  activity: string;
  notes: string;
}

const CreateTour = () => {
  const { id } = useParams();
  const isEditing = !!id;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);

  // Auto-fill form when editing
  useEffect(() => {
    if (isEditing && id) {
      // In a real app, this would fetch data from an API
      // For now, using mock data to demonstrate auto-fill functionality
      const mockTourData = {
        title: "Historic City Walking Tour",
        description: "Experience the eternal city like never before with our comprehensive walking tour through Rome's most iconic landmarks and hidden gems.",
        price: "150",
        location: "Rome, Italy",
        tags: ["historical", "walking", "cultural"],
        images: [
          "https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800&q=80",
          "https://images.unsplash.com/photo-1531572753322-ad063cecc140?w=800&q=80"
        ],
        itinerary: [
          { id: "1", time: "09:00", activity: "Meeting Point - Piazza Navona", notes: "Meet your guide and fellow travelers" },
          { id: "2", time: "09:30", activity: "Pantheon", notes: "Marvel at ancient Roman architecture" },
          { id: "3", time: "10:30", activity: "Trevi Fountain", notes: "Make a wish at Rome's most famous fountain" },
          { id: "4", time: "11:30", activity: "Spanish Steps", notes: "Climb the iconic steps" }
        ]
      };

      setTitle(mockTourData.title);
      setDescription(mockTourData.description);
      setPrice(mockTourData.price);
      setLocation(mockTourData.location);
      setTags(mockTourData.tags);
      setImages(mockTourData.images);
      setItinerary(mockTourData.itinerary);
    }
  }, [isEditing, id]);

  const handleSave = () => {
    if (!title || !description || !price || !location) {
      toast.error("Please fill in all required fields");
      return;
    }

    toast.success(isEditing ? "Tour updated successfully!" : "Tour created successfully!");
    redirect("/business/dashboard");
  };

  const handleItinerarySave = (newItinerary: ItineraryItem[]) => {
    setItinerary(newItinerary);
    toast.success("Itinerary updated successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header userRole="business" />

      <main className="container py-6 px-4">
        <Button
          variant="ghost"
          onClick={() => redirect("/business/dashboard")}
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
              <FileUpload images={images} onImagesChange={setImages} />
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
                  onChange={(e) => setPrice(e.target.value)}
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
                        <span className="flex-1">{item.activity}</span>
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
