import { MapPin, Calendar, DollarSign, Star, Users } from "lucide-react";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

interface TourCardProps {
  id: string;
  title: string;
  location: string;
  date: string;
  price: number;
  rating?: number;
  imageUrl: string;
  businessName?: string;
  applicants?: number;
  travelers?: number;
  action: {
    label: string;
    onClick: () => void;
    variant?: "default" | "gradient" | "accent";
  };
}

const TourCard = ({
  title,
  location,
  date,
  price,
  rating,
  imageUrl,
  businessName,
  applicants,
  travelers,
  action,
}: TourCardProps) => {
  return (
    <Card className="overflow-hidden cursor-pointer group hover:shadow-elevated transition-all duration-300">{" "}
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {rating && (
          <Badge className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm text-foreground">
            <Star className="w-3 h-3 mr-1 fill-accent text-accent" />
            {rating.toFixed(1)}
          </Badge>
        )}
      </div>
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {businessName && (
            <p className="text-sm text-muted-foreground">{businessName}</p>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mr-2" />
            {location}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <Calendar className="w-4 h-4 mr-2" />
            {date}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm font-semibold text-primary">
              <DollarSign className="w-4 h-4" />
              {price}
            </div>
            {(applicants !== undefined || travelers !== undefined) && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="w-4 h-4 mr-1" />
                {applicants !== undefined ? `${applicants} applied` : `${travelers} joined`}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          onClick={action.onClick}
          variant={action.variant || "default"}
          className="w-full"
        >
          {action.label}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TourCard;
