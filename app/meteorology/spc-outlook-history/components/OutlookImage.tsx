import { useState, useEffect } from 'react';
import { OutlookDay, HazardType } from '../lib/types';
import { getOutlookUrl, HAZARD_LABELS } from '../lib/config';
import { format } from 'date-fns';

interface OutlookImageProps {
  date: Date;
  selectedDay: OutlookDay;
  timeOption: string;
  hazardType: HazardType;
  showLabel?: boolean;
}

const OutlookImage = ({
  date,
  selectedDay,
  timeOption,
  hazardType,
  showLabel = true
}: OutlookImageProps) => {
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [directUrl, setDirectUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Effect to load the selected outlook image
  useEffect(() => {
    // Set loading state
    setIsLoading(true);
    setImageError(false);
    setErrorMessage("");
    
    // Format the date as YYYYMMDD
    const formattedDate = format(date, 'yyyyMMdd');
    
    // Construct the URL
    const originalUrl = getOutlookUrl(selectedDay, formattedDate, timeOption, hazardType);
    
    // Store the direct URL for "View Full Size" link
    setDirectUrl(originalUrl);
    
    // Use our internal API proxy for fetching the image
    const url = `/api/proxy?url=${encodeURIComponent(originalUrl)}`;
    
    // For debugging - log the URLs we're trying to access
    console.log(`Loading ${hazardType} outlook URL:`, originalUrl);
    
    // Preload the image to check if it exists
    const img = new Image();
    img.onload = () => {
      setImageUrl(url);
      setIsLoading(false);
      setImageError(false);
    };
    img.onerror = () => {
      console.error(`${hazardType} image failed to load:`, url);
      setImageError(true);
      setIsLoading(false);
    };
    img.src = url;
    
    // Cleanup function
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [date, timeOption, selectedDay, hazardType]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden h-full">
      {showLabel && (
        <div className="border-b border-gray-100 px-4 py-2 flex justify-between items-center">
          <h3 className="text-md font-medium text-gray-800">
            {HAZARD_LABELS[hazardType]} Outlook
          </h3>
          {!isLoading && !imageError && (
            <a 
              href={directUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs font-medium text-gray-600 hover:text-gray-800"
            >
              <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              Full Size
            </a>
          )}
        </div>
      )}
      
      <div className="p-2">
        {isLoading && (
          <div className="flex flex-col items-center justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700 mb-2"></div>
            <p className="text-xs text-gray-500">Loading...</p>
          </div>
        )}
        
        {!isLoading && imageUrl && !imageError && (
          <div className="flex justify-center">
            <img 
              src={imageUrl} 
              alt={`SPC ${selectedDay} ${hazardType} Outlook for ${format(date, 'MM/dd/yyyy')} at ${timeOption}Z`}
              onError={() => setImageError(true)}
              key={imageUrl}
              className="max-w-full h-auto rounded"
            />
          </div>
        )}
        
        {!isLoading && imageError && (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="mb-2 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-gray-700 mb-1">
              {errorMessage}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutlookImage;