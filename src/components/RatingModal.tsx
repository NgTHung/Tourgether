import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { Star } from "lucide-react";

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourName: string;
  studentName?: string;
  onSubmit: (data: { tourRating: number; studentRating?: number; review: string }) => void;
}

const RatingModal = ({ open, onOpenChange, tourName, studentName, onSubmit }: RatingModalProps) => {
  const [tourRating, setTourRating] = useState(0);
  const [studentRating, setStudentRating] = useState(0);
  const [review, setReview] = useState("");
  const [hoveredTourStar, setHoveredTourStar] = useState(0);
  const [hoveredStudentStar, setHoveredStudentStar] = useState(0);

  const handleSubmit = () => {
    if (tourRating === 0) return;
    
    onSubmit({
      tourRating,
      studentRating: studentName ? studentRating : undefined,
      review,
    });
    
    // Reset form
    setTourRating(0);
    setStudentRating(0);
    setReview("");
    onOpenChange(false);
  };

  const StarRating = ({
    rating,
    setRating,
    hovered,
    setHovered,
    label,
  }: {
    rating: number;
    setRating: (rating: number) => void;
    hovered: number;
    setHovered: (hovered: number) => void;
    label: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`w-8 h-8 ${
                star <= (hovered || rating)
                  ? "fill-accent text-accent"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Rate Your Experience</DialogTitle>
          <DialogDescription>
            Share your thoughts about {tourName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <StarRating
            rating={tourRating}
            setRating={setTourRating}
            hovered={hoveredTourStar}
            setHovered={setHoveredTourStar}
            label="Tour Experience"
          />

          {studentName && (
            <StarRating
              rating={studentRating}
              setRating={setStudentRating}
              hovered={hoveredStudentStar}
              setHovered={setHoveredStudentStar}
              label={`Rate ${studentName} (Guide)`}
            />
          )}

          <div className="space-y-2">
            <Label htmlFor="review">Written Review (Optional)</Label>
            <Textarea
              id="review"
              placeholder="Share more details about your experience..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="gradient"
            onClick={handleSubmit}
            disabled={tourRating === 0}
          >
            Submit Review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RatingModal;
