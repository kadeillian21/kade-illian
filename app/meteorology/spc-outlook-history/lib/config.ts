import { OutlookDay, HazardType } from './types';
import { format } from 'date-fns';

// All possible times the SPC might use
export const ALL_POSSIBLE_TIMES = [
  '0100', '0600', '0700', '0730', '0800', '0830', '0900', 
  '1000', '1100', '1200', '1300', '1400', '1500', '1600', 
  '1630', '1700', '1730', '1800', '1900', '1930', '2000', 
  '2100', '2200', '2300'
];

// Configuration for each outlook type and how to build URLs
export const getOutlookUrl = (
  day: OutlookDay, 
  date: string, 
  time: string, 
  hazard: HazardType = 'categorical'
): string => {
  const year = date.substring(0, 4);
  
  // Base URL parts
  const baseUrl = 'https://www.spc.noaa.gov/products';
  
  if (day === 'day4-8') {
    return `${baseUrl}/exper/day4-8/archive/${year}/day48prob_${date}_${time}.gif`;
  }
  
  // For prob outlooks (tornado, wind, hail)
  if (hazard !== 'categorical') {
    return `${baseUrl}/outlook/archive/${year}/${day}probotlk_${date}_${time}_${getHazardCode(hazard)}_prt.gif`;
  }
  
  // For categorical outlooks
  return `${baseUrl}/outlook/archive/${year}/${day}otlk_${date}_${time}_prt.gif`;
};

// Get the hazard code for the URL
const getHazardCode = (hazard: HazardType): string => {
  switch (hazard) {
    case 'tornado': return 'torn';
    case 'wind': return 'wind';
    case 'hail': return 'hail';
    default: return '';
  }
};

// Labels for display
export const HAZARD_LABELS: Record<HazardType, string> = {
  'categorical': 'Categorical',
  'tornado': 'Tornado',
  'wind': 'Wind',
  'hail': 'Hail'
};

export const DAY_LABELS: Record<OutlookDay, string> = {
  'day1': 'Day 1',
  'day2': 'Day 2',
  'day3': 'Day 3',
  'day4-8': 'Day 4-8'
};