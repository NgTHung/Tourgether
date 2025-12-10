"use client"

import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Plus, Trash2, Clock } from "lucide-react";

// Generate time options in 15-minute intervals
const generateTimeOptions = () => {
  const times: string[] = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      times.push(`${h}:${m}`);
    }
  }
  return times;
};

const TIME_OPTIONS = generateTimeOptions();

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

interface ItineraryBuilderProps {
  children: React.ReactNode;
  initialItinerary?: ItineraryItem[];
  onSave: (itinerary: ItineraryItem[]) => void;
}

const ItineraryBuilder = ({ children, initialItinerary = [], onSave }: ItineraryBuilderProps) => {
  const [open, setOpen] = useState(false);
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([]);

  useEffect(() => {
    if (open) {
      if (initialItinerary.length > 0) {
        setItinerary(initialItinerary);
      } else {
        setItinerary([{ 
          id: '1', 
          title: '', 
          location: '', 
          duration: 0, 
          time: '', 
          description: '', 
          activities: 1, 
          createdAt: new Date(), 
          updatedAt: new Date() 
        }]);
      }
    }
  }, [open, initialItinerary]);

  const addRow = () => {
    const newId = (Math.max(0, ...itinerary.map(item => parseInt(item.id) || 0)) + 1).toString();
    setItinerary([...itinerary, { 
      id: newId, 
      title: '', 
      location: '', 
      duration: 0, 
      time: '', 
      description: '', 
      activities: itinerary.length + 1, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    }]);
  };

  const removeRow = (id: string) => {
    if (itinerary.length > 1) {
      const newItinerary = itinerary.filter(item => item.id !== id);
      // Re-index activities
      const reindexed = newItinerary.map((item, index) => ({
        ...item,
        activities: index + 1
      }));
      setItinerary(reindexed);
    }
  };

  const updateRow = (id: string, field: keyof ItineraryItem, value: string | number) => {
    setItinerary(itinerary.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = () => {
    // Ensure activities are correct indices and filter if needed
    const validItinerary = itinerary.map((item, index) => ({
      ...item,
      activities: index + 1
    }));
    
    onSave(validItinerary);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-7xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Itinerary Builder
          </DialogTitle>
          <DialogDescription>
            Create a detailed schedule for your tour. Add times, locations, and descriptions for each stop.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead className="w-52">Time</TableHead>
                  <TableHead className="w-40">Title</TableHead>
                  <TableHead className="w-40">Location</TableHead>
                  <TableHead className="w-28">Duration (min)</TableHead>
                  <TableHead className="min-w-48">Description</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {itinerary.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2 items-center">
                        <Select
                          value={item.time}
                          onValueChange={(value) => updateRow(item.id, 'time', value)}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {TIME_OPTIONS.map((time) => (
                              <SelectItem key={time} value={time}>
                                {time}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="text-muted-foreground text-sm">or</span>
                        <Input
                          type="time"
                          value={item.time}
                          onChange={(e) => updateRow(item.id, 'time', e.target.value)}
                          className="w-[90px]"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.title}
                        onChange={(e) => updateRow(item.id, 'title', e.target.value)}
                        placeholder="Activity Title"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        value={item.location}
                        onChange={(e) => updateRow(item.id, 'location', e.target.value)}
                        placeholder="Location"
                        className="w-full"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.duration}
                        onChange={(e) => updateRow(item.id, 'duration', parseInt(e.target.value) || 0)}
                        className="w-full"
                        min={0}
                      />
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={item.description}
                        onChange={(e) => updateRow(item.id, 'description', e.target.value)}
                        placeholder="Description"
                        className="w-full min-h-10 resize-none"
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
            <Button variant="outline" onClick={() => setOpen(false)}>
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