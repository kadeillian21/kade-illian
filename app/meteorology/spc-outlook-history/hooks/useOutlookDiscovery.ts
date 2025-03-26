import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { OutlookDay, HazardType, DiscoveredTime, TimeCache } from '../lib/types';
import { ALL_POSSIBLE_TIMES, getOutlookUrl } from '../lib/config';

export function useOutlookDiscovery(
  date: Date,
  selectedDay: OutlookDay
) {
  const [availableTimes, setAvailableTimes] = useState<DiscoveredTime[]>([]);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryAttempted, setDiscoveryAttempted] = useState(false);
  const [timeCache, setTimeCache] = useState<TimeCache>({});

  // Function to discover available times and hazards for a given date and day
  const discoverAvailableTimes = async () => {
    const formattedDate = format(date, 'yyyyMMdd');
    const cacheKey = `${formattedDate}-${selectedDay}`;
    
    // Check cache first
    if (timeCache[cacheKey]) {
      setAvailableTimes(timeCache[cacheKey]);
      return;
    }
    
    setIsDiscovering(true);
    setDiscoveryAttempted(true);
    
    // Try to discover available times for the categorical outlook first
    const discoveredTimes: DiscoveredTime[] = [];
    
    // Create an array of promises that resolve to a time if the image exists
    const checkPromises = ALL_POSSIBLE_TIMES.map(time => {
      return new Promise<string | null>(resolve => {
        const url = getOutlookUrl(selectedDay, formattedDate, time);
        const img = new Image();
        
        // Set a timeout to avoid hanging
        const timeoutId = setTimeout(() => {
          img.src = '';
          resolve(null);
        }, 2000);
        
        img.onload = () => {
          clearTimeout(timeoutId);
          resolve(time); // Image exists
        };
        
        img.onerror = () => {
          clearTimeout(timeoutId);
          resolve(null); // Image doesn't exist
        };
        
        // Start loading the image
        img.src = `/api/proxy?url=${encodeURIComponent(url)}`;
      });
    });
    
    try {
      // Wait for all checks to complete
      const results = await Promise.all(checkPromises);
      
      // Filter out nulls to get valid times
      const validTimes = results.filter(time => time !== null) as string[];
      
      // For each discovered time, check which hazard types are available
      await Promise.all(validTimes.map(async (time) => {
        const hazards: HazardType[] = ['categorical'];
        
        // Check each hazard type
        const hazardTypes: HazardType[] = ['tornado', 'wind', 'hail'];
        
        await Promise.all(hazardTypes.map(async (hazard) => {
          const hazardUrl = getOutlookUrl(selectedDay, formattedDate, time, hazard);
          
          try {
            const response = await new Promise<boolean>((resolve) => {
              const img = new Image();
              const timeoutId = setTimeout(() => {
                img.src = '';
                resolve(false);
              }, 2000);
              
              img.onload = () => {
                clearTimeout(timeoutId);
                resolve(true);
              };
              
              img.onerror = () => {
                clearTimeout(timeoutId);
                resolve(false);
              };
              
              img.src = `/api/proxy?url=${encodeURIComponent(hazardUrl)}`;
            });
            
            if (response) {
              hazards.push(hazard);
            }
          } catch (error) {
            console.error(`Error checking hazard ${hazard}:`, error);
          }
        }));
        
        discoveredTimes.push({
          time,
          hazards
        });
      }));
      
      // Sort times chronologically
      discoveredTimes.sort((a, b) => a.time.localeCompare(b.time));
      
      // Cache the results
      setTimeCache(prev => ({
        ...prev,
        [cacheKey]: discoveredTimes
      }));
      
      setAvailableTimes(discoveredTimes);
    } catch (error) {
      console.error('Error discovering times:', error);
    } finally {
      setIsDiscovering(false);
    }
  };

  // Effect to discover available times when date or day changes
  useEffect(() => {
    discoverAvailableTimes();
  }, [date, selectedDay]);

  return {
    availableTimes,
    isDiscovering,
    discoveryAttempted,
    timeCache,
    rediscover: discoverAvailableTimes
  };
}
