import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Plus, Trash2, Clock } from "lucide-react";

interface ItineraryItem {
  id: string;
  time: string;
  activity: string;
  notes: string;
}

interface ItineraryBuilderProps {
  children: React.ReactNode;
  initialItinerary?: ItineraryItem[];
  onSave: (itinerary: ItineraryItem[]) => void;
}

const ItineraryBuilder = ({ children, initialItinerary = [], onSave }: ItineraryBuilderProps) => {
  const [open, setOpen] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>(
    initialItinerary.length > 0 
      ? initialItinerary 
      : [{ id: '1', time: '09:00', activity: '', notes: '' }]
  );

  const addRow = () => {
    const newId = (Math.max(...itinerary.map(item => parseInt(item.id))) + 1).toString();
    setItinerary([...itinerary, { id: newId, time: '', activity: '', notes: '' }]);
  };

  const removeRow = (id: string) => {
    if (itinerary.length > 1) {
      setItinerary(itinerary.filter(item => item.id !== id));
    }
  };

  const updateRow = (id: string, field: keyof ItineraryItem, value: string) => {
    setItinerary(itinerary.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = () => {
    // Filter out empty rows
    const validItinerary = itinerary.filter(item => 
      item.time.trim() && item.activity.trim()
    );
    onSave(validItinerary);
    setOpen(false);
  };

  const handleCancel = () => {
    // Reset to initial state
    setItinerary(
      initialItinerary.length > 0 
        ? initialItinerary 
        : [{ id: '1', time: '09:00', activity: '', notes: '' }]
    );
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Itinerary Builder
          </DialogTitle>
          <DialogDescription>
            Create a detailed schedule for your tour. Add times, activities, and notes for each stop.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Time</TableHead>
                  <TableHead>Activity</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="w-16">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itinerary.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Input
                        type="time"
                        value={item.time}
                        onChange={(e) => updateRow(item.id, 'time', e.target.value)}
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.activity}
                        onChange={(e) => updateRow(item.id, 'activity', e.target.value)}
                        placeholder="Meeting Point - Piazza Navona"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={item.notes}
                        onChange={(e) => updateRow(item.id, 'notes', e.target.value)}
                        placeholder="Meet your guide and fellow travelers"
                        className="w-full min-h-[60px] resize-none"
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRow(item.id)}
                        disabled={itinerary.length === 1}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button 
            onClick={addRow} 
            variant="outline" 
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Row
          </Button>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave} variant="gradient">
              Save Itinerary
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ItineraryBuilder;