"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const hebrewNavItems = [
  { label: "Hub", href: "/hebrew", exact: true },
  { label: "Lessons", href: "/hebrew/lessons", exact: false },
  { label: "Vocab", href: "/hebrew/vocabulary", exact: false },
  { label: "Bible", href: "/hebrew/bible", exact: false },
  { label: "Review", href: "/hebrew/review", exact: false },
];

interface Stats {
  streak: number;
  wordsLearned: number;
  totalWords: number;
  notLearned: number;
}

interface TimeStats {
  day: { seconds: number; minutes: number };
  week: { seconds: number; minutes: number };
  month: { seconds: number; minutes: number; hours: number };
  year: { seconds: number; minutes: number; hours: number };
  total: { seconds: number; minutes: number; hours: number };
}

export default function HebrewStatsNavbar() {
  const pathname = usePathname();

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [dailyTotalSeconds, setDailyTotalSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef(0);

  // Time history dropdown state
  const [showTimeHistory, setShowTimeHistory] = useState(false);
  const [timeStats, setTimeStats] = useState<TimeStats | null>(null);
  const [loadingTimeStats, setLoadingTimeStats] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Stats state
  const [stats, setStats] = useState<Stats>({
    streak: 0,
    wordsLearned: 0,
    totalWords: 0,
    notLearned: 0,
  });

  // Format seconds to MM:SS or HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Format seconds to human readable (e.g., "15m", "1h 30m")
  const formatHumanTime = (seconds: number): string => {
    if (seconds === 0) return "0m";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);

    if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
    if (hrs > 0) return `${hrs}h`;
    return `${mins}m`;
  };

  // Track current date to detect day changes
  const [currentDate, setCurrentDate] = useState(new Date().toDateString());

  // Fetch initial timer data and refetch periodically
  useEffect(() => {
    async function fetchTimer() {
      try {
        // Get user's timezone offset in minutes
        const tzOffset = new Date().getTimezoneOffset();
        const res = await fetch(`/api/timer?tzOffset=${tzOffset}`);
        if (res.ok) {
          const data = await res.json();
          setDailyTotalSeconds(data.totalSeconds || 0);
        }
      } catch (error) {
        console.error("Failed to fetch timer:", error);
      }
    }

    // Check if day changed
    const checkDayChange = () => {
      const now = new Date().toDateString();
      if (now !== currentDate) {
        setCurrentDate(now);
        setDailyTotalSeconds(0);
        setSessionSeconds(0);
        setIsRunning(false);
        fetchTimer();
      }
    };

    // Fetch immediately
    fetchTimer();

    // Check for day changes every minute
    const interval = setInterval(() => {
      checkDayChange();
      fetchTimer();
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [currentDate]);

  // Fetch stats data
  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch vocab sets first to get active sets
        const setsRes = await fetch("/api/vocab/sets");
        if (!setsRes.ok) return;

        const setsData = await setsRes.json();

        // Get only active sets
        const activeSets = setsData.filter((set: any) => set.isActive);

        // Get all words from active sets with their progress
        const activeWords = activeSets.flatMap((set: any) =>
          (set.groups || []).flatMap((group: any) => group.words || [])
        );

        // Calculate stats from active sets only
        const totalWords = activeWords.length;
        const learned = activeWords.filter((w: any) => (w.level || 0) >= 1).length;
        const notLearned = activeWords.filter((w: any) => !w.level || w.level === 0).length;

        // Fetch user stats for streak
        const progressRes = await fetch("/api/vocab/progress");
        let streak = 0;
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          streak = progressData.stats?.streak || 0;
        }

        setStats({
          streak,
          wordsLearned: learned,
          totalWords,
          notLearned,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    }

    // Fetch on mount
    fetchStats();

    // Refetch when window regains focus
    const handleFocus = () => fetchStats();
    window.addEventListener("focus", handleFocus);

    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  // Save time to database
  const saveTime = useCallback(async (seconds: number) => {
    if (seconds <= 0) return;
    try {
      await fetch("/api/timer/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ additionalSeconds: seconds }),
      });
    } catch (error) {
      console.error("Failed to save timer:", error);
    }
  }, []);

  // Fetch time history stats
  const fetchTimeStats = async () => {
    if (loadingTimeStats) return;
    setLoadingTimeStats(true);
    try {
      const res = await fetch("/api/vocab/stats/time");
      if (res.ok) {
        const data = await res.json();
        setTimeStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch time stats:", error);
    } finally {
      setLoadingTimeStats(false);
    }
  };

  // Toggle time history dropdown
  const toggleTimeHistory = () => {
    if (!showTimeHistory) {
      fetchTimeStats();
    }
    setShowTimeHistory(!showTimeHistory);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTimeHistory(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Format time for display in dropdown
  const formatTimeDisplay = (minutes: number, hours?: number): string => {
    if (hours && hours > 0) {
      const remainingMins = minutes % 60;
      if (remainingMins > 0) return `${hours}h ${remainingMins}m`;
      return `${hours}h`;
    }
    return `${minutes}m`;
  };

  // Timer interval effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSessionSeconds((prev) => {
          const newSeconds = prev + 1;
          // Save every 30 seconds
          if (newSeconds - lastSaveRef.current >= 30) {
            saveTime(30);
            // Don't increment dailyTotalSeconds here - it will be updated by the periodic fetch
            lastSaveRef.current = newSeconds;
          }
          return newSeconds;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, saveTime]);

  // Save remaining time when stopping
  const handleToggle = async () => {
    if (isRunning) {
      // Stopping - save any unsaved time
      const unsaved = sessionSeconds - lastSaveRef.current;
      if (unsaved > 0) {
        await saveTime(unsaved);
        // Refetch the daily total immediately to show updated time
        const tzOffset = new Date().getTimezoneOffset();
        const res = await fetch(`/api/timer?tzOffset=${tzOffset}`);
        if (res.ok) {
          const data = await res.json();
          setDailyTotalSeconds(data.totalSeconds || 0);
        }
      }
      lastSaveRef.current = 0;
      setSessionSeconds(0);
    }
    setIsRunning(!isRunning);
  };

  return (
    <div className="sticky top-16 z-30 w-full border-b border-[#d4c5b0] bg-gradient-to-r from-[#f5f1e8] to-[#e8dcc8] shadow-sm">
      <div className="container flex h-12 items-center justify-between px-4">
        {/* Left side: Timer */}
        <div className="flex items-center gap-4">
          {/* Play/Pause button */}
          <button
            onClick={handleToggle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isRunning
                ? "bg-[#4a5d49] text-white shadow-md"
                : "bg-white text-[#4a5d49] border border-[#4a5d49] hover:bg-[#4a5d49] hover:text-white"
            }`}
          >
            {isRunning ? (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
                <span className="font-mono">{formatTime(sessionSeconds)}</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                <span>Start</span>
              </>
            )}
          </button>

          {/* Daily total with time history dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={toggleTimeHistory}
              className="text-sm text-gray-600 hover:text-[#4a5d49] transition-colors flex items-center gap-1"
            >
              <span className="font-medium text-[#4a5d49]">Today:</span>{" "}
              {formatHumanTime(dailyTotalSeconds + (isRunning ? sessionSeconds - lastSaveRef.current : 0))}
              <svg
                className={`w-4 h-4 transition-transform ${showTimeHistory ? "rotate-180" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Time History Dropdown */}
            {showTimeHistory && (
              <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-3 z-50">
                <div className="px-4 pb-2 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800 text-sm">Study Time History</h3>
                </div>

                {loadingTimeStats ? (
                  <div className="px-4 py-3 text-center text-gray-500 text-sm">Loading...</div>
                ) : timeStats ? (
                  <div className="px-4 py-2 space-y-2">
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-gray-600 text-sm">Today</span>
                      <span className="font-semibold text-[#4a5d49]">
                        {formatTimeDisplay(timeStats.day.minutes)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-gray-600 text-sm">This Week</span>
                      <span className="font-semibold text-[#4a5d49]">
                        {formatTimeDisplay(timeStats.week.minutes, timeStats.week.minutes >= 60 ? Math.floor(timeStats.week.minutes / 60) : undefined)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-gray-600 text-sm">This Month</span>
                      <span className="font-semibold text-[#4a5d49]">
                        {formatTimeDisplay(timeStats.month.minutes, timeStats.month.hours)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-t border-gray-100 mt-2 pt-2">
                      <span className="text-gray-600 text-sm">All Time</span>
                      <span className="font-bold text-[#4a5d49]">
                        {formatTimeDisplay(timeStats.total.minutes, timeStats.total.hours)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-3 text-center text-gray-500 text-sm">No data</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Center: Navigation tabs */}
        <nav className="hidden md:flex items-center gap-1">
          {hebrewNavItems.map((item) => {
            const isActive = item.exact
              ? pathname === item.href
              : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                  isActive
                    ? "bg-white/60 text-[#4a5d49] font-semibold shadow-sm"
                    : "text-gray-600 hover:text-[#4a5d49] hover:bg-white/40"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side: Stats */}
        <div className="flex items-center gap-6 text-sm">
          {/* Streak */}
          {stats.streak > 0 && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="text-orange-500">&#128293;</span>
              <span className="font-medium">{stats.streak} day streak</span>
            </div>
          )}

          {/* Not learned words */}
          {stats.notLearned > 0 && (
            <Link
              href="/hebrew/vocabulary"
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
            >
              <span className="font-medium">{stats.notLearned} not learned</span>
            </Link>
          )}

          {/* Progress */}
          <div className="text-gray-600">
            <span className="font-medium text-[#4a5d49]">{stats.wordsLearned}</span>
            <span className="text-gray-400"> / </span>
            <span>{stats.totalWords}</span>
            <span className="text-gray-500 ml-1">learned</span>
          </div>
        </div>
      </div>
    </div>
  );
}
