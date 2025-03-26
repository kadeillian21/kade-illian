'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { OutlookDay, HazardType } from './lib/types';
import { useOutlookDiscovery } from './hooks/useOutlookDiscovery';
import { HAZARD_LABELS } from './lib/config';

// Components
import DaySelector from './components/DaySelector';
import TimeSelector from './components/TimeSelector';
import DateSelector from './components/DateSelector';
import OutlookImage from './components/OutlookImage';
import RiskLegend from './components/RiskLegend';

const SpcOutlookHistory = () => {
  // Start with yesterday's date since today's outlook may not be available yet
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  // State
  const [date, setDate] = useState(yesterday);
  const [selectedDay, setSelectedDay] = useState<OutlookDay>('day1');
  const [timeOption, setTimeOption] = useState('1200'); // Default time
  const [selectedHazard, setSelectedHazard] = useState<HazardType>('categorical');
  
  // Use our custom hook for time discovery
  const { 
    availableTimes, 
    isDiscovering, 
    discoveryAttempted,
    rediscover 
  } = useOutlookDiscovery(date, selectedDay);
  
  // Handle day selection change
  const handleDayChange = (day: OutlookDay) => {
    setSelectedDay(day);
    // The hook will automatically discover available times
  };
  
  // Reset function
  const handleReset = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setDate(yesterday);
    setTimeOption('1200');
    setSelectedHazard('categorical');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">SPC Outlook History</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Browse historical Storm Prediction Center convective outlooks by date, time, and forecast day.
            </p>
          </header>
          
          {/* Day Selector Component */}
          <DaySelector 
            selectedDay={selectedDay} 
            onSelectDay={handleDayChange} 
          />
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
            <div className="border-b border-gray-100 px-6 py-4">
              <h2 className="text-lg font-medium text-gray-900">Select Date & Time</h2>
            </div>
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex-1">
                  <DateSelector 
                    date={date}
                    onDateChange={setDate}
                  />
                </div>
                
                <div className="flex-1">
                  <TimeSelector
                    availableTimes={availableTimes}
                    timeOption={timeOption}
                    onTimeChange={setTimeOption}
                    isDiscovering={isDiscovering}
                    discoveryAttempted={discoveryAttempted}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Risk Legend Component */}
          <RiskLegend />

          {/* Outlook Display Area */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2 md:mb-0">
                SPC {selectedDay.replace('day', 'Day ')} Outlook - {format(date, 'MMMM d, yyyy')} at {timeOption}Z
              </h2>
              
              {/* Reset button */}
              <button 
                onClick={handleReset}
                className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-md transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reset
              </button>
            </div>
            <>
              {/* Main categorical outlook (larger) */}
              <div className="mb-4">
                <OutlookImage
                  date={date}
                  selectedDay={selectedDay}
                  timeOption={timeOption}
                  hazardType="categorical"
                />
              </div>
              
              {/* Grid of hazard-specific outlooks */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <OutlookImage
                  date={date}
                  selectedDay={selectedDay}
                  timeOption={timeOption}
                  hazardType="tornado"
                />
                <OutlookImage
                  date={date}
                  selectedDay={selectedDay}
                  timeOption={timeOption}
                  hazardType="wind"
                />
                <OutlookImage
                  date={date}
                  selectedDay={selectedDay}
                  timeOption={timeOption}
                  hazardType="hail"
                />
              </div>
            </>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpcOutlookHistory;
