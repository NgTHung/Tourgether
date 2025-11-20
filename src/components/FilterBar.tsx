"use client";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Calendar } from "~/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Calendar as CalendarIcon, SlidersHorizontal } from "lucide-react";
import { format } from "date-fns";
import { cn } from "~/lib/utils";
import { type DateRange } from "react-day-picker";

interface FilterBarProps {
  userRole: "student" | "business";
  onApplyFilters: (filters: FilterState) => void;
}

export interface FilterState {
  dateRange?: DateRange;
  city: string;
}

const FilterBar = ({ onApplyFilters }: FilterBarProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [city, setCity] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const handleApply = () => {
    onApplyFilters({
      dateRange,
      city,
    });
  };

  const handleReset = () => {
    setDateRange(undefined);
    setCity("");
  };

  return (
    <div className="bg-card border rounded-lg p-4 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden"
        >
          {showFilters ? "Hide" : "Show"}
        </Button>
      </div>

      <div className={cn("space-y-4", !showFilters && "hidden lg:block")}>
        {/* Date Range Filter - Row 1 */}
        <div className="space-y-2">
          <Label>Date Range</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "LLL dd, y")} -{" "}
                      {format(dateRange.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 bg-popover" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* City/Province Filter - Row 2 */}
        <div className="space-y-2">
          <Label htmlFor="city">City/Province</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g., Rome, Italy"
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={handleApply} className="flex-1" variant="default">
            Apply Filters
          </Button>
          <Button onClick={handleReset} variant="outline">
            Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
