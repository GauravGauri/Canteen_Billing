import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const DatePicker = ({ value, onChange, label, required = false, minDate = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Initialize view year & month based on value, fallback to today
  const initialDate = value ? new Date(value) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  // Close calendar popup if click is outside the container
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format date for UI display
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = MONTH_NAMES[date.getMonth()].slice(0, 3);
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Convert Date object to YYYY-MM-DD string with local timezone preservation
  const toYYYYMMDD = (year, month, day) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Days in month calculation
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // First day of month weekday index (0-6)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayIndex = getFirstDayOfMonth(viewYear, viewMonth);

  // Build grid of days
  const calendarDays = [];
  // Empty slots for preceding month
  for (let i = 0; i < firstDayIndex; i++) {
    calendarDays.push(null);
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(d);
  }

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day) => {
    if (day === null) return;
    const dateStr = toYYYYMMDD(viewYear, viewMonth, day);
    
    // Check minDate constraint if any
    if (minDate && dateStr < minDate) return;

    onChange(dateStr);
    setIsOpen(false);
  };

  const yearsRange = [];
  const currentYear = new Date().getFullYear();
  for (let y = currentYear - 5; y <= currentYear + 10; y++) {
    yearsRange.push(y);
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-200 cursor-pointer transition-all focus-within:border-brand-500"
      >
        <span className={value ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
          {value ? formatDateForDisplay(value) : 'Select Date'}
        </span>
        <CalendarIcon className="w-4 h-4 text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl space-y-3">
          {/* Header selectors */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1.5">
              {/* Month Selector */}
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-0.5 outline-none cursor-pointer hover:border-slate-700"
              >
                {MONTH_NAMES.map((name, index) => (
                  <option key={name} value={index}>
                    {name.slice(0, 3)}
                  </option>
                ))}
              </select>
              {/* Year Selector */}
              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value))}
                className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2 py-0.5 outline-none cursor-pointer hover:border-slate-700"
              >
                {yearsRange.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday Titles */}
          <div className="grid grid-cols-7 text-center gap-y-1">
            {WEEKDAYS.map((day) => (
              <span key={day} className="text-[10px] font-bold text-slate-500 uppercase">
                {day}
              </span>
            ))}
          </div>

          {/* Day Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {calendarDays.map((day, idx) => {
              if (day === null) {
                return <div key={`empty-${idx}`} />;
              }

              const dateStr = toYYYYMMDD(viewYear, viewMonth, day);
              const isSelected = value === dateStr;
              const isDisabled = minDate ? dateStr < minDate : false;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  disabled={isDisabled}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-brand-600 text-white font-bold'
                      : isDisabled
                      ? 'opacity-20 cursor-not-allowed'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          <div className="border-t border-slate-800/80 pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                const todayStr = toYYYYMMDD(today.getFullYear(), today.getMonth(), today.getDate());
                if (!minDate || todayStr >= minDate) {
                  setViewYear(today.getFullYear());
                  setViewMonth(today.getMonth());
                  onChange(todayStr);
                  setIsOpen(false);
                }
              }}
              className="text-[10px] font-bold text-brand-400 hover:text-brand-350 cursor-pointer"
            >
              Select Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
