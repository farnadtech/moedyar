import { useState, useEffect } from 'react';
import moment from 'moment-jalaali';
import { Calendar } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/lib/utils';

interface PersianDateInputProps {
  value?: string; // YYYY-MM-DD format for ISO date
  onChange?: (date: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}

export function PersianDateInput({
  value,
  onChange,
  placeholder = "انتخاب تاریخ",
  className,
  disabled,
  name,
  required
}: PersianDateInputProps) {
  const [persianDisplay, setPersianDisplay] = useState('');

  // Convert Gregorian date to Persian display
  const updatePersianDisplay = (gregorianDate: string) => {
    if (!gregorianDate) {
      setPersianDisplay('');
      return;
    }
    
    try {
      const persianDate = moment(gregorianDate).format('jYYYY/jMM/jDD');
      setPersianDisplay(persianDate);
    } catch (error) {
      console.error('Error converting to Persian date:', error);
      setPersianDisplay('');
    }
  };

  useEffect(() => {
    updatePersianDisplay(value || '');
  }, [value]);

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const gregorianDate = e.target.value;
    onChange?.(gregorianDate);
    updatePersianDisplay(gregorianDate);
  };

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Input
          type="date"
          value={value || ''}
          onChange={handleDateChange}
          className="pr-10"
          disabled={disabled}
          name={name}
          required={required}
        />
        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      
      {persianDisplay && (
        <div className="mt-1 text-sm text-gray-600 text-right">
          📅 {persianDisplay} (تقویم شمسی)
        </div>
      )}
      
      {!persianDisplay && value && (
        <div className="mt-1 text-sm text-gray-500 text-right">
          {placeholder}
        </div>
      )}
    </div>
  );
}
