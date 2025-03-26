export type OutlookDay = 'day1' | 'day2' | 'day3' | 'day4-8';

export type HazardType = 'categorical' | 'tornado' | 'wind' | 'hail';

export interface DiscoveredTime {
  time: string;
  hazards: HazardType[];
}

export interface TimeCache {
  [key: string]: DiscoveredTime[];
}