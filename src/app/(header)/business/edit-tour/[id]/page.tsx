 "use client"

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Calendar } from "~/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Checkbox } from "~/components/ui/checkbox";
import TagsInput from "~/components/TagsInput";
import ImageUpload from "~/components/ImageUpload";
import TourPreview from "~/components/TourPreview";
import ItineraryBuilder from "~/components/ItineraryBuilder";
import { ArrowLeft, CalendarIcon, ListOrdered, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";
import { format } from "date-fns";

const PRESET_INCLUSIONS = [
  "Professional English-speaking guide",
  "Skip-the-line tickets to attractions",
  "Water and snacks throughout the tour",
];

const COMMON_LANGUAGES = ["English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Korean", "Arabic"];

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

const EditTour = ({ params }: { params: Promise<{ id: string }> }) => {
  const id = use(params).id;
  const router = useRouter();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tourData, tourDataQuery] = api.tour.getTourById.useSuspenseQuery({
    id: id,
    shouldGetTags: true,
    shouldGetItineraries: true,
  });

  const [title, setTitle] = useState(tourData.tour?.name || "");
  const [description, setDescription] = useState(tourData.tour?.description || "");
  const [price, setPrice] = useState(tourData.tour?.price || 0);
  const [location, setLocation] = useState(tourData.tour?.location || "");
  const [date, setDate] = useState<Date | undefined>(
    tourData.tour?.date ? new Date(tourData.tour.date) : new Date(),
  );
  const [tags, setTags] = useState<string[]>(tourData.tags || []);
  const [images, setImages] = useState<string[]>(
    tourData.tour?.thumbnailUrl ? [tourData.tour.thumbnailUrl, ...(tourData.tour.galleries ?? [])] : []
  );
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(tourData.tour?.itineraries || []);
  const [duration, setDuration] = useState(tourData.tour?.duration ?? 480);
  const [groupSize, setGroupSize] = useState(tourData.tour?.groupSize ?? 15);
  const [languages, setLanguages] = useState<string[]>(tourData.tour?.languages ?? ["English"]);
  const [inclusions, setInclusions] = useState<string[]>(tourData.tour?.inclusions ?? []);
  const [customInclusion, setCustomInclusion] = useState("");

  const updateTourMutation = api.tour.updateTour.useMutation({
    onSuccess: () => {
      toast.success("Tour updated successfully!");
      router.push("/business/dashboard");
    },
    onError: (error) => {
      toast.error(`Failed to update tour: ${error.message}`);
    },
  });

  const handleSave = () => {
    if (!title || !description || !price || !location || !date) {
      toast.error("Please fill in all required fields");
      return;
    }

    updateTourMutation.mutate({
      id: id,
      name: title,
      description: description,
      price: price,
      location: location,
      date: date.toISOString(),
      images: images,
      tags: tags,
      itineraries: itinerary.map((item, index) => ({
        title: item.title,
        location: item.location,
        duration: item.duration,
        activities: index + 1,
        description: item.description,
        time: item.time,
      })),
      duration: duration,
      groupSize: groupSize,
      languages: languages,
      inclusions: inclusions,
    });
  };

  const handleItinerarySave = (newItinerary: ItineraryItem[]) => {
    setItinerary(newItinerary);
    toast.success("Itinerary updated successfully!");
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto py-6 px-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/business/dashboard")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-6">Edit Tour</h1>

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
                <Label>Schedule Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      disabled={(day) => day < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Tags/Keywords</Label>
                <TagsInput
                  tags={tags}
                  onTagsChange={setTags}
                  placeholder="Type a tag and press Enter (e.g., adventure, historical)"
                />
              </div>

              {/* Duration and Group Size */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (minutes) *</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                    placeholder="480"
                    min={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    {duration >= 60
                      ? `${Math.floor(duration / 60)} hour${Math.floor(duration / 60) !== 1 ? "s" : ""}${duration % 60 > 0 ? ` ${duration % 60} min` : ""}`
                      : `${duration} minutes`}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="groupSize">Max Group Size *</Label>
                  <Input
                    id="groupSize"
                    type="number"
                    value={groupSize}
                    onChange={(e) => setGroupSize(parseInt(e.target.value) || 1)}
                    placeholder="15"
                    min={1}
                  />
                </div>
              </div>

              {/* Languages */}
              <div className="space-y-2">
                <Label>Languages</Label>
                <div className="flex flex-wrap gap-2">
                  {COMMON_LANGUAGES.map((lang) => (
                    <Button
                      key={lang}
                      type="button"
                      variant={languages.includes(lang) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (languages.includes(lang)) {
                          setLanguages(languages.filter((l) => l !== lang));
                        } else {
                          setLanguages([...languages, lang]);
                        }
                      }}
                    >
                      {lang}
                    </Button>
                  ))}
                </div>
              </div>

              {/* What's Included */}
              <div className="space-y-2">
                <Label>What&apos;s Included</Label>
                <div className="space-y-2">
                  {PRESET_INCLUSIONS.map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox
                        id={`inclusion-${item}`}
                        checked={inclusions.includes(item)}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setInclusions([...inclusions, item]);
                          } else {
                            setInclusions(inclusions.filter((i) => i !== item));
                          }
                        }}
                      />
                      <label
                        htmlFor={`inclusion-${item}`}
                        className="text-sm cursor-pointer"
                      >
                        {item}
                      </label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Input
                    placeholder="Add custom inclusion..."
                    value={customInclusion}
                    onChange={(e) => setCustomInclusion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && customInclusion.trim()) {
                        e.preventDefault();
                        if (!inclusions.includes(customInclusion.trim())) {
                          setInclusions([...inclusions, customInclusion.trim()]);
                        }
                        setCustomInclusion("");
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      if (customInclusion.trim() && !inclusions.includes(customInclusion.trim())) {
                        setInclusions([...inclusions, customInclusion.trim()]);
                        setCustomInclusion("");
                      }
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {/* Show custom inclusions (non-preset) */}
                {inclusions.filter((i) => !PRESET_INCLUSIONS.includes(i)).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {inclusions
                      .filter((i) => !PRESET_INCLUSIONS.includes(i))
                      .map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-md text-sm"
                        >
                          {item}
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 p-0"
                            onClick={() => setInclusions(inclusions.filter((i) => i !== item))}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                  </div>
                )}
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
                      <ListOrdered className="w-4 h-4 mr-2" />
                      {itinerary.length > 0 ? "Edit Itinerary" : "Add Itinerary"}
                    </Button>
                  </ItineraryBuilder>
                </div>
                
                {itinerary.length > 0 && (
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {itinerary.slice(0, 3).map((item) => (
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

            <Button 
              onClick={handleSave} 
              size="lg" 
              className="w-full" 
              variant="gradient"
              disabled={updateTourMutation.isPending}
            >
              {updateTourMutation.isPending ? "Updating..." : "Update Tour"}
            </Button>
          </div>

          {/* Right Column: Preview */}
          <div className="hidden lg:block sticky top-6 h-[calc(100vh-250px)]">
            <div className="h-full border rounded-lg overflow-hidden flex flex-col">
              <div className="bg-primary text-primary-foreground px-4 py-2 font-semibold shrink-0">
                Preview (Traveler View)
              </div>
              <div className="flex-1 overflow-y-auto">
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
        </div>
      </main>
    </div>
  );
};

export default EditTour;
