import { MapPin, DollarSign } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "~/components/ui/carousel";

interface TourPreviewProps {
  title: string;
  description: string;
  images: string[];
  price: string;
  location: string;
  tags: string[];
}

const TourPreview = ({ title, description, images, price, location, tags }: TourPreviewProps) => {
  return (
    <div className="h-full overflow-y-auto bg-muted/30 rounded-lg p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">{title || "Tour Title"}</h2>
          <div className="flex items-center gap-4 text-muted-foreground">
            {location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{location}</span>
              </div>
            )}
            {price && (
              <div className="flex items-center gap-1 font-semibold text-primary">
                <DollarSign className="w-4 h-4" />
                <span>{price}</span>
              </div>
            )}
          </div>
        </div>

        {images.length > 0 ? (
          <Carousel className="w-full">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="relative rounded-lg overflow-hidden h-96">
                    <img
                      src={image}
                      alt={`Tour image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="left-4" />
                <CarouselNext className="right-4" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">No images uploaded</p>
          </div>
        )}

        {description && (
          <div className="prose prose-sm max-w-none">
            <p className="text-foreground whitespace-pre-wrap">{description}</p>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TourPreview;
