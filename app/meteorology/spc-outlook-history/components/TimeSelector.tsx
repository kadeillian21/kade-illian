import { DiscoveredTime } from '../lib/types';

interface TimeSelectorProps {
  availableTimes: DiscoveredTime[];
  timeOption: string;
  onTimeChange: (time: string) => void;
  isDiscovering: boolean;
  discoveryAttempted: boolean;
}

const TimeSelector = ({
  availableTimes,
  timeOption,
  onTimeChange,
  isDiscovering,
  discoveryAttempted,
}: TimeSelectorProps) => {
  return (
    <>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Time (Z/UTC):
      </label>

      {/* Loading state during time discovery */}
      {isDiscovering ? (
        <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-center justify-center">
            <div className="animate-spin mr-3 h-4 w-4 text-gray-700 border-2 border-gray-300 border-t-gray-700 rounded-full"></div>
            <p className="text-sm text-gray-600">Discovering available times...</p>
          </div>
        </div>
      ) : (
        <>
          {discoveryAttempted && availableTimes.length === 0 ? (
            <div className="p-3 bg-yellow-50 rounded-md border border-yellow-200">
              <p className="text-sm text-yellow-700">
                No standard times found for this day. Try checking "special outlook" or selecting a different date.
              </p>
            </div>
          ) : (
            <select
              value={availableTimes.some(t => t.time === timeOption) ? timeOption : availableTimes[0]?.time || ''}
              onChange={(e) => onTimeChange(e.target.value)}
              className="p-2 w-full border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            >
              {availableTimes.map(({time}) => (
                <option key={time} value={time}>
                  {time}Z
                </option>
              ))}
            </select>
          )}
        </>
      )}
    </>
  );
};

export default TimeSelector;