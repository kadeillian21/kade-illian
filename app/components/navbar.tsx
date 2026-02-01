"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "./utils";
import UserMenu from "./UserMenu";

const Navbar = () => {
  const pathname = usePathname();
  const [lessonsOpen, setLessonsOpen] = useState(false);
  const [vocabOpen, setVocabOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-lg shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-semibold text-lg text-[#4a5d49] hover:text-[#6b7d6a] transition-colors">
          Kade Illian
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              pathname === "/"
                ? "bg-[#6b7d6a] text-white"
                : "text-gray-600 hover:text-[#4a5d49] hover:bg-[#f5f1e8]"
            )}
          >
            Home
          </Link>

          {/* Lessons Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setLessonsOpen(true)}
            onMouseLeave={() => setLessonsOpen(false)}
          >
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-1",
                pathname.includes("/lessons")
                  ? "bg-[#6b7d6a] text-white"
                  : "text-gray-600 hover:text-[#4a5d49] hover:bg-[#f5f1e8]"
              )}
            >
              Lessons
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {lessonsOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <Link
                  href="/hebrew/lessons"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f5f1e8] hover:text-[#4a5d49]"
                >
                  📖 Hebrew Lessons
                </Link>
                <Link
                  href="/greek/lessons"
                  className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                  onClick={(e) => e.preventDefault()}
                >
                  📘 Greek Lessons (Coming Soon)
                </Link>
              </div>
            )}
          </div>

          {/* Vocabulary Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setVocabOpen(true)}
            onMouseLeave={() => setVocabOpen(false)}
          >
            <button
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-full transition-all flex items-center gap-1",
                pathname.includes("/vocabulary")
                  ? "bg-[#6b7d6a] text-white"
                  : "text-gray-600 hover:text-[#4a5d49] hover:bg-[#f5f1e8]"
              )}
            >
              Vocabulary
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {vocabOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2">
                <Link
                  href="/hebrew/vocabulary"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#f5f1e8] hover:text-[#4a5d49]"
                >
                  🎴 Hebrew Flashcards
                </Link>
                <Link
                  href="/greek/vocabulary"
                  className="block px-4 py-2 text-sm text-gray-400 cursor-not-allowed"
                  onClick={(e) => e.preventDefault()}
                >
                  🎴 Greek Flashcards (Coming Soon)
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/about"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              pathname === "/about"
                ? "bg-[#6b7d6a] text-white"
                : "text-gray-600 hover:text-[#4a5d49] hover:bg-[#f5f1e8]"
            )}
          >
            About
          </Link>

          <div className="ml-2 pl-2 border-l border-gray-200">
            <UserMenu />
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
