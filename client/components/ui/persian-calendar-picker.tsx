import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { cn } from '@/lib/utils';
import jalaali from 'jalaali-js';

interface PersianCalendarPickerProps {
  value?: string; // YYYY-MM-DD format for ISO date
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}

const persianMonths = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

const persianWeekDays = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];

interface JalaaliDate {
  jy: number;
  jm: number;
  jd: number;
}

export function PersianCalendarPicker({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  className,
  disabled,
  name,
  required
}: PersianCalendarPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState<JalaaliDate>({ jy: 1403, jm: 1, jd: 1 });
  const [selectedDate, setSelectedDate] = useState<JalaaliDate | null>(null);

  // Convert Gregorian to Jalaali
  const gregorianToJalaali = (gregorianDate: string): JalaaliDate | null => {
    if (!gregorianDate) return null;
    try {
      const date = new Date(gregorianDate);
      const jDate = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
      return { jy: jDate.jy, jm: jDate.jm, jd: jDate.jd };
    } catch (error) {
      console.error('Error converting to Jalaali:', error);
      return null;
    }
  };

  // Convert Jalaali to Gregorian
  const jalaaliToGregorian = (jDate: JalaaliDate): string => {
    try {
      const gDate = jalaali.toGregorian(jDate.jy, jDate.jm, jDate.jd);
      return `${gDate.gy}-${String(gDate.gm).padStart(2, '0')}-${String(gDate.gd).padStart(2, '0')}`;
    } catch (error) {
      console.error('Error converting to Gregorian:', error);
      return '';
    }
  };

  // Format Persian date for display
  const formatPersianDate = (jDate: JalaaliDate | null): string => {
    if (!jDate) return '';
    return `${jDate.jd} ${persianMonths[jDate.jm - 1]} ${jDate.jy}`;
  };

  // Get days in month
  const getDaysInMonth = (jy: number, jm: number): number => {
    if (jm <= 6) return 31;
    if (jm <= 11) return 30;
    return jalaali.isLeapJalaaliYear(jy) ? 30 : 29;
  };

  // Get first day of month (0 = Saturday, 6 = Friday)
  const getFirstDayOfMonth = (jy: number, jm: number): number => {
    const gDate = jalaali.toGregorian(jy, jm, 1);
    const date = new Date(gDate.gy, gDate.gm - 1, gDate.gd);
    return (date.getDay() + 1) % 7; // Convert Sunday=0 to Saturday=0
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(displayDate.jy, displayDate.jm);
    const firstDay = getFirstDayOfMonth(displayDate.jy, displayDate.jm);

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate && 
        selectedDate.jy === displayDate.jy && 
        selectedDate.jm === displayDate.jm && 
        selectedDate.jd === day;

      const isToday = (() => {
        const today = new Date();
        const todayJalaali = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
        return todayJalaali.jy === displayDate.jy && 
               todayJalaali.jm === displayDate.jm && 
               todayJalaali.jd === day;
      })();

      days.push(
        <button
          key={day}
          type="button"
          className={cn(
            "w-8 h-8 text-sm rounded-md hover:bg-brand-100 focus:bg-brand-100",
            isSelected && "bg-brand-600 text-white hover:bg-brand-700",
            isToday && !isSelected && "bg-brand-200 text-brand-800 font-semibold",
            "transition-colors"
          )}
          onClick={() => handleDateSelect(day)}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const handleDateSelect = (day: number) => {
    const newDate = { jy: displayDate.jy, jm: displayDate.jm, jd: day };
    setSelectedDate(newDate);
    const gregorianDate = jalaaliToGregorian(newDate);
    onChange?.(gregorianDate);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setDisplayDate(prev => {
      if (prev.jm === 1) {
        return { jy: prev.jy - 1, jm: 12, jd: 1 };
      } else {
        return { jy: prev.jy, jm: prev.jm - 1, jd: 1 };
      }
    });
  };

  const handleNextMonth = () => {
    setDisplayDate(prev => {
      if (prev.jm === 12) {
        return { jy: prev.jy + 1, jm: 1, jd: 1 };
      } else {
        return { jy: prev.jy, jm: prev.jm + 1, jd: 1 };
      }
    });
  };

  // Update display when value changes
  useEffect(() => {
    if (value) {
      const jDate = gregorianToJalaali(value);
      if (jDate) {
        setSelectedDate(jDate);
        setDisplayDate(jDate);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  // Initialize display date to current month
  useEffect(() => {
    const today = new Date();
    const todayJalaali = jalaali.toJalaali(today.getFullYear(), today.getMonth() + 1, today.getDate());
    setDisplayDate(todayJalaali);
  }, []);

  const displayValue = selectedDate ? formatPersianDate(selectedDate) : '';

  return (
    <div className={cn("relative", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-right font-normal",
              !selectedDate && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <Calendar className="ml-2 h-4 w-4" />
            {displayValue || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="p-3" dir="rtl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNextMonth}
                className="p-1"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <div className="text-sm font-semibold">
                {persianMonths[displayDate.jm - 1]} {displayDate.jy}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevMonth}
                className="p-1"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>

            {/* Week days */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {persianWeekDays.map((day) => (
                <div
                  key={day}
                  className="w-8 h-8 text-xs text-center flex items-center justify-center font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays()}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={value || ''}
        required={required}
      />
    </div>
  );
}
