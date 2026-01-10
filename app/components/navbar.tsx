"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./utils";

const Navbar = () => {
  const pathname = usePathname();
  const [meteorologyMenuOpen, setMeteorologyMenuOpen] = React.useState(false);
  const [realEstateMenuOpen, setRealEstateMenuOpen] = React.useState(false);
  const [hebrewMenuOpen, setHebrewMenuOpen] = React.useState(false);
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/95 backdrop-blur-lg shadow-sm">
      <div className="container flex h-16 items-center justify-between">
        <div className="font-semibold text-lg text-[#4a5d49]">Kade Illian</div>
        <nav className="relative flex items-center">
          <ul className="flex list-none items-center justify-end space-x-2">
            <li>
              <Link href="/" className={cn(
                "flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full",
                pathname === "/"
                  ? "bg-[#6b7d6a] text-white shadow-md"
                  : "text-gray-600 hover:text-[#4a5d49] hover:bg-[#f5f1e8]"
              )}>
                Home
              </Link>
            </li>
            
            {/* Meteorology Dropdown */}
            <li className="relative">
              <button 
                onClick={() => setMeteorologyMenuOpen(!meteorologyMenuOpen)}
                onBlur={() => setTimeout(() => setMeteorologyMenuOpen(false), 100)}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full",
                  pathname.startsWith("/meteorology")
                    ? "bg-[#6b7d6a] text-white shadow-md"
                    : "text-gray-600 hover:text-[#4a5d49] hover:bg-[#f5f1e8]"
                )}
              >
                Meteorology
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {meteorologyMenuOpen && (
                <div className="absolute right-0 z-50 min-w-[12rem] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-xl mt-1">
                  <div className="relative cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-[#f5f1e8]">
                    <Link 
                      href="/meteorology/spc-outlook-history" 
                      className={cn(
                        "w-full flex items-center rounded-md px-2 py-1.5 transition-colors",
                        pathname.includes("spc-outlook-history")
                          ? "font-medium text-[#4a5d49]"
                          : "text-gray-600 hover:text-[#4a5d49]"
                      )}
                    >
                      SPC Outlook History
                    </Link>
                  </div>
                </div>
              )}
            </li>

            {/* Real Estate Dropdown */}
            <li className="relative">
              <button 
                onClick={() => setRealEstateMenuOpen(!realEstateMenuOpen)}
                onBlur={() => setTimeout(() => setRealEstateMenuOpen(false), 100)}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full",
                  pathname.startsWith("/real-estate")
                    ? "bg-[#6b7d6a] text-white shadow-md"
                    : "text-gray-600 hover:text-[#4a5d49] hover:bg-[#f5f1e8]"
                )}
              >
                Real Estate
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {realEstateMenuOpen && (
                <div className="absolute right-0 z-50 min-w-[12rem] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-xl mt-1">
                  <div className="relative cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-[#f5f1e8]">
                    <Link 
                      href="/real-estate/firstfruit" 
                      className={cn(
                        "w-full flex items-center rounded-md px-2 py-1.5 transition-colors",
                        pathname.includes("firstfruit")
                          ? "font-medium text-[#4a5d49]"
                          : "text-gray-600 hover:text-[#4a5d49]"
                      )}
                    >
                      Firstfruit Real Estate
                    </Link>
                  </div>
                  <div className="relative cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-50">
                    <Link 
                      href="/real-estate/veraYield" 
                      className={cn(
                        "w-full flex items-center rounded-md px-2 py-1.5 transition-colors",
                        pathname.includes("veraYield")
                          ? "font-medium text-[#4a5d49]"
                          : "text-gray-600 hover:text-[#4a5d49]"
                      )}
                    >
                      VeraYield
                    </Link>
                  </div>
                </div>
              )}
            </li>

            {/* Hebrew Learning Dropdown */}
            <li className="relative">
              <button
                onClick={() => setHebrewMenuOpen(!hebrewMenuOpen)}
                onBlur={() => setTimeout(() => setHebrewMenuOpen(false), 100)}
                className={cn(
                  "flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full",
                  pathname.startsWith("/hebrew")
                    ? "bg-[#6b7d6a] text-white shadow-md"
                    : "text-gray-600 hover:text-[#4a5d49] hover:bg-[#f5f1e8]"
                )}
              >
                Hebrew
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {hebrewMenuOpen && (
                <div className="absolute right-0 z-50 min-w-[12rem] overflow-hidden rounded-lg border border-gray-200 bg-white p-1 shadow-xl mt-1">
                  <div className="relative cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-[#f5f1e8]">
                    <Link
                      href="/hebrew/flashcards"
                      className={cn(
                        "w-full flex items-center rounded-md px-2 py-1.5 transition-colors",
                        pathname.includes("flashcards")
                          ? "font-medium text-[#4a5d49]"
                          : "text-gray-600 hover:text-[#4a5d49]"
                      )}
                    >
                      Flashcards
                    </Link>
                  </div>
                  <div className="relative cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-50">
                    <Link
                      href="/hebrew/vocabulary"
                      className={cn(
                        "w-full flex items-center rounded-md px-2 py-1.5 transition-colors",
                        pathname.includes("vocabulary")
                          ? "font-medium text-[#4a5d49]"
                          : "text-gray-600 hover:text-[#4a5d49]"
                      )}
                    >
                      Vocabulary
                    </Link>
                  </div>
                  <div className="relative cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-50">
                    <Link
                      href="/hebrew/grammar"
                      className={cn(
                        "w-full flex items-center rounded-md px-2 py-1.5 transition-colors",
                        pathname.includes("grammar")
                          ? "font-medium text-[#4a5d49]"
                          : "text-gray-600 hover:text-[#4a5d49]"
                      )}
                    >
                      Grammar
                    </Link>
                  </div>
                </div>
              )}
            </li>

            {/* About Me */}
            <li>
              <Link href="/about" className={cn(
                "flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full",
                pathname === "/about"
                  ? "bg-[#6b7d6a] text-white shadow-md"
                  : "text-gray-600 hover:text-[#4a5d49] hover:bg-[#f5f1e8]"
              )}>
                About Me
              </Link>
            </li>

            {/* Artifacts */}
            <li>
              <Link href="/artifacts" className={cn(
                "flex items-center px-4 py-2 text-sm font-medium transition-all duration-200 rounded-full",
                pathname === "/artifacts"
                  ? "bg-[#6b7d6a] text-white shadow-md"
                  : "text-gray-600 hover:text-[#4a5d49] hover:bg-[#f5f1e8]"
              )}>
                Artifacts
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;