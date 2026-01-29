"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

interface Stats {
  streak: number;
  wordsLearned: number;
  totalWords: number;
  dueWords: number;
}

export default function HebrewStatsNavbar() {
  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [dailyTotalSeconds, setDailyTotalSeconds] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef(0);

  // Stats state
  const [stats, setStats] = useState<Stats>({
    streak: 0,
    wordsLearned: 0,
    totalWords: 0,
    dueWords: 0,
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

  // Fetch initial timer data
  useEffect(() => {
    async function fetchTimer() {
      try {
        const res = await fetch("/api/timer");
        if (res.ok) {
          const data = await res.json();
          setDailyTotalSeconds(data.totalSeconds || 0);
        }
      } catch (error) {
        console.error("Failed to fetch timer:", error);
      }
    }
    fetchTimer();
  }, []);

  // Fetch stats data
  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch user progress for streak and learning stats
        const progressRes = await fetch("/api/vocab/progress");
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          const wordProgress = progressData.wordProgress || {};

          // Calculate learned words (level >= 1)
          const learned = Object.values(wordProgress).filter(
            (p: any) => p.level >= 1
          ).length;

          // Calculate due words
          const now = new Date();
          const dueCount = Object.values(wordProgress).filter((p: any) => {
            if (!p.nextReview) return p.level === 0;
            return new Date(p.nextReview) <= now;
          }).length;

          setStats((prev) => ({
            ...prev,
            streak: progressData.stats?.streak || 0,
            wordsLearned: learned,
            dueWords: dueCount,
          }));
        }

        // Fetch total word count from sets
        const setsRes = await fetch("/api/vocab/sets");
        if (setsRes.ok) {
          const setsData = await setsRes.json();
          const totalWords = setsData.reduce(
            (sum: number, set: any) => sum + (set.total_words || 0),
            0
          );
          setStats((prev) => ({ ...prev, totalWords }));
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      }
    }
    fetchStats();
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

  // Timer interval effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSessionSeconds((prev) => {
          const newSeconds = prev + 1;
          // Save every 30 seconds
          if (newSeconds - lastSaveRef.current >= 30) {
            saveTime(30);
            setDailyTotalSeconds((d) => d + 30);
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
  const handleToggle = () => {
    if (isRunning) {
      // Stopping - save any unsaved time
      const unsaved = sessionSeconds - lastSaveRef.current;
      if (unsaved > 0) {
        saveTime(unsaved);
        setDailyTotalSeconds((d) => d + unsaved);
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

          {/* Daily total */}
          <div className="text-sm text-gray-600">
            <span className="font-medium text-[#4a5d49]">Today:</span>{" "}
            {formatHumanTime(dailyTotalSeconds + (isRunning ? sessionSeconds - lastSaveRef.current : 0))}
          </div>
        </div>

        {/* Right side: Stats */}
        <div className="flex items-center gap-6 text-sm">
          {/* Streak */}
          {stats.streak > 0 && (
            <div className="flex items-center gap-1.5 text-gray-600">
              <span className="text-orange-500">&#128293;</span>
              <span className="font-medium">{stats.streak} day streak</span>
            </div>
          )}

          {/* Due words */}
          {stats.dueWords > 0 && (
            <Link
              href="/hebrew/vocabulary?mode=review"
              className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
            >
              <span className="font-medium">{stats.dueWords} due</span>
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
