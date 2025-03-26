// components/DateSelector.tsx
import { format } from 'date-fns';

interface DateSelectorProps {
  date: Date;
  onDateChange: (date: Date) => void;
}

const DateSelector = ({ date, onDateChange }: DateSelectorProps) => {
  // Get today's date as string for limiting the date picker
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Generate a date for calendar input (YYYY-MM-DD format)
  const calendarDate = format(date, 'yyyy-MM-dd');

  return (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Date:
      </label>
      <div className="flex items-center">
        <button 
          onClick={() => {
            const prevDay = new Date(date);
            prevDay.setDate(date.getDate() - 1);
            onDateChange(prevDay);
          }}
          aria-label="Previous day"
          className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        <input
          type="date"
          value={calendarDate}
          max={today}
          onChange={(e) => {
            if (e.target.value) {
              // Create date with LOCAL timezone interpretation by using parts
              const [year, month, day] = e.target.value.split('-').map(Number);
              const newDate = new Date(year, month - 1, day); // month is 0-indexed in JS
              onDateChange(newDate);
            }
          }}
          className="mx-2 p-2 border border-gray-300 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
        />
        
        <button 
          onClick={() => {
            // Only go to next day if it's not in the future
            const nextDay = new Date(date);
            nextDay.setDate(date.getDate() + 1);
            
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Remove time component
            
            if (nextDay <= today) {
              onDateChange(nextDay);
            }
          }}
          aria-label="Next day"
          disabled={format(date, 'yyyy-MM-dd') === today}
          className="p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </>
  );
};

export default DateSelector;
