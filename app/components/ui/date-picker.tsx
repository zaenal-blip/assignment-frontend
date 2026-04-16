import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  setDate: (date?: Date) => void;
  placeholder?: string;
  className?: string;
}

export function DatePicker({
  date,
  setDate,
  placeholder = "Pick a date",
  className,
}: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <div className="relative w-full group">
          <Button
            variant="outline"
            data-slot="date-picker-trigger"
            className={cn(
              "w-full justify-start text-left font-normal pr-10 min-h-[44px] transition-all",
              "border-slate-300 hover:border-primary focus-visible:ring-primary/20",
              "bg-gray-600 text-white shadow-sm hover:bg-slate-50",
              !date && "text-muted-foreground",
              className,
            )}
            aria-label="Open date picker"
          >
            {date ? format(date, "PPP") : <span>{placeholder}</span>}
          </Button>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <CalendarIcon className="h-4 w-4 text-gray-600 group-hover:text-primary transition-colors" />
          </div>
        </div>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-0 border-none shadow-2xl z-[100]"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
          className="rounded-lg border border-slate-200"
        />
      </PopoverContent>
    </Popover>
  );
}
