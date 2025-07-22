import { useState, useRef, useEffect } from 'react';
import DatePicker, { Day } from 'react-modern-calendar-datepicker';
import moment from 'moment-jalaali';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';

interface PersianCalendarProps {
  value?: string; // YYYY-MM-DD format for ISO date
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}

export function PersianCalendar({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  className,
  disabled,
  name,
  required
}: PersianCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Convert ISO date to Persian Day object
  const convertISOToPersianDay = (isoDate: string): Day | null => {
    if (!isoDate) return null;
    try {
      const gregorianMoment = moment(isoDate);
      const persianMoment = moment(gregorianMoment.format('YYYY-MM-DD'));
      
      return {
        year: persianMoment.jYear(),
        month: persianMoment.jMonth() + 1, // moment-jalaali uses 0-based months
        day: persianMoment.jDate()
      };
    } catch (error) {
      console.error('Error converting ISO to Persian:', error);
      return null;
    }
  };

  // Convert Persian Day object to ISO date
  const convertPersianDayToISO = (day: Day): string => {
    try {
      const persianMoment = moment.from(`${day.year}/${day.month}/${day.day}`, 'fa', 'YYYY/M/D');
      return persianMoment.format('YYYY-MM-DD');
    } catch (error) {
      console.error('Error converting Persian to ISO:', error);
      return '';
    }
  };

  // Format Persian date for display
  const formatPersianDate = (day: Day | null): string => {
    if (!day) return '';
    try {
      const persianMoment = moment.from(`${day.year}/${day.month}/${day.day}`, 'fa', 'YYYY/M/D');
      return persianMoment.format('jYYYY/jMM/jDD');
    } catch (error) {
      console.error('Error formatting Persian date:', error);
      return '';
    }
  };

  // Update selectedDay when value changes
  useEffect(() => {
    if (value) {
      const persianDay = convertISOToPersianDay(value);
      setSelectedDay(persianDay);
    } else {
      setSelectedDay(null);
    }
  }, [value]);

  const handleDayChange = (day: Day) => {
    setSelectedDay(day);
    const isoDate = convertPersianDayToISO(day);
    onChange?.(isoDate);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow only Persian digits and slashes
    const persianPattern = /^[\u06F0-\u06F9\/]*$/;
    if (persianPattern.test(inputValue) || inputValue === '') {
      // Try to parse the input as Persian date
      if (inputValue.length === 10 && inputValue.match(/^\d{4}\/\d{2}\/\d{2}$/)) {
        try {
          const parts = inputValue.split('/');
          const day: Day = {
            year: parseInt(parts[0]),
            month: parseInt(parts[1]),
            day: parseInt(parts[2])
          };
          
          // Validate the date
          const testMoment = moment.from(`${day.year}/${day.month}/${day.day}`, 'fa', 'YYYY/M/D');
          if (testMoment.isValid()) {
            setSelectedDay(day);
            const isoDate = convertPersianDayToISO(day);
            onChange?.(isoDate);
          }
        } catch (error) {
          console.error('Error parsing input date:', error);
        }
      }
    }
  };

  const displayValue = selectedDay ? formatPersianDate(selectedDay) : '';

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-right font-normal",
              !selectedDay && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <Calendar className="ml-2 h-4 w-4" />
            {displayValue || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3" dir="rtl">
            <DatePicker
              value={selectedDay}
              onChange={handleDayChange}
              locale="fa"
              shouldHighlightWeekends
              colorPrimary="#22c55e" // Green color matching our theme
              colorPrimaryLight="rgba(34, 197, 94, 0.1)"
              calendarClassName="custom-calendar"
              calendarTodayClassName="today-highlight"
              calendarSelectedDayClassName="selected-day"
              renderInput={() => null} // We're using our own trigger
            />
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Hidden input for form submission */}
      <input
        ref={inputRef}
        type="hidden"
        name={name}
        value={value || ''}
        required={required}
      />
    </div>
  );
}
