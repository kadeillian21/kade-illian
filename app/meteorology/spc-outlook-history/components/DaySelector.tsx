import { OutlookDay } from '../lib/types';
import { DAY_LABELS } from '../lib/config';

interface DaySelectorProps {
  selectedDay: OutlookDay;
  onSelectDay: (day: OutlookDay) => void;
}

const DaySelector = ({ selectedDay, onSelectDay }: DaySelectorProps) => {
  const days = Object.entries(DAY_LABELS).map(([value, label]) => ({
    value: value as OutlookDay,
    label
  }));

  return (
    <div className="flex flex-wrap mb-6 bg-white p-1 rounded-lg shadow-sm border border-gray-200 gap-1">
      {days.map((day) => (
        <button
          key={day.value}
          onClick={() => onSelectDay(day.value)}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
            selectedDay === day.value
              ? 'bg-gray-800 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {day.label}
        </button>
      ))}
    </div>
  );
};

export default DaySelector;