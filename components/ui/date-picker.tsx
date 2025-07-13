"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DatePickerProps {
  label: string;
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  className?: string;
  minDate?: string; // Minimum selectable date in YYYY-MM-DD format
}

export function DatePicker({
  label,
  value,
  onChange,
  error,
  className,
  minDate
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(
    value ? new Date(value + 'T00:00:00') : undefined
  );
  const [isFocused, setIsFocused] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Update selectedDate when value prop changes
  React.useEffect(() => {
    setSelectedDate(value ? new Date(value + 'T00:00:00') : undefined);
  }, [value]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      // Format date in local timezone to avoid timezone issues
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      onChange?.(formattedDate);
    } else {
      onChange?.('');
    }
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleButtonClick = () => {
    setIsOpen(!isOpen);
    setIsFocused(true);
  };

  const hasValue = !!selectedDate;
  const isLabelFloating = isFocused || hasValue;

  const displayValue = selectedDate
    ? format(selectedDate, 'MMM dd, yyyy')
    : '';

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        <Button
          variant="outline"
          onClick={handleButtonClick}
          className={cn(
            "w-full h-14 px-4 pt-6 pb-2 text-base bg-background border-2 rounded-xl transition-all duration-200 justify-start text-left font-normal hover:bg-background",
            error
              ? "border-red-500 focus:border-red-500"
              : "border-border focus:border-primary hover:border-primary/50",
            !hasValue && "text-muted-foreground",
            className
          )}
        >
          <span className="flex-1 text-left">
            {displayValue || ""}
          </span>
          <CalendarIcon className="w-4 h-4 text-muted-foreground" />
        </Button>

        <label
          className={cn(
            "absolute left-4 transition-all duration-200 pointer-events-none",
            isLabelFloating
              ? "top-2 text-xs font-medium text-foreground"
              : "top-1/2 -translate-y-1/2 text-base text-muted-foreground"
          )}
        >
          {label}
        </label>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 z-50 mt-2 w-auto min-w-[280px] bg-popover/95 backdrop-blur-md border rounded-xl shadow-lg animate-in fade-in-0 zoom-in-95 slide-in-from-top-2">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            initialFocus
            className="rounded-xl border-0"
            disabled={(date) => {
              // Disable dates in the past
              const today = new Date();
              today.setHours(0, 0, 0, 0);

              // Check if date is in the past
              if (date < today) {
                return true;
              }

              // Check if date is before or equal to minDate
              if (minDate) {
                const minDateObj = new Date(minDate + 'T00:00:00');
                if (date <= minDateObj) {
                  return true;
                }
              }

              return false;
            }}
          />
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}