import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export interface CalendarProps {
  mode?: "single" | "range";
  selected?: Date | null;
  onSelect?: (date: Date | null) => void;
  className?: string;
  disabled?: (date: Date) => boolean;
  initialFocus?: boolean;
}

function Calendar({
  className,
  mode = "single",
  selected,
  onSelect,
  disabled,
  ...props
}: CalendarProps) {
  return (
    <div className={cn("p-3 pointer-events-auto", className)}>
      <DatePicker
        selected={selected}
        onChange={onSelect}
        inline
        calendarClassName="react-datepicker__calendar-custom"
        dayClassName={(date) => {
          const isToday = new Date().toDateString() === date.toDateString();
          const isSelected = selected && selected.toDateString() === date.toDateString();
          const isDisabled = disabled && disabled(date);
          
          return cn(
            "react-datepicker__day-custom",
            "h-9 w-9 text-center text-sm font-normal cursor-pointer",
            "hover:bg-accent hover:text-accent-foreground rounded-md",
            isToday && "bg-accent text-accent-foreground",
            isSelected && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
            isDisabled && "text-muted-foreground opacity-50 cursor-not-allowed"
          );
        }}
        formatWeekDay={(nameOfDay) => nameOfDay.slice(0, 3)}
        showPopperArrow={false}
        {...props}
      />
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
