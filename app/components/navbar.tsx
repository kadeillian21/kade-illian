"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./utils";

const Navbar = () => {
  const pathname = usePathname();
  const [meteorologyMenuOpen, setMeteorologyMenuOpen] = React.useState(false);
  const [realEstateMenuOpen, setRealEstateMenuOpen] = React.useState(false);
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="font-medium text-lg">Kade Illian</div>
        <nav className="relative flex items-center">
          <ul className="flex list-none items-center justify-end space-x-2">
            <li>
              <Link href="/" className={cn(
                "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-full",
                pathname === "/" 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
                  "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-full",
                  pathname.startsWith("/meteorology")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                Meteorology
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {meteorologyMenuOpen && (
                <div className="absolute right-0 z-50 min-w-[12rem] overflow-hidden rounded-lg border border-gray-100 bg-white p-1 shadow-lg mt-1">
                  <div className="relative cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-50">
                    <Link 
                      href="/meteorology/spc-outlook-history" 
                      className={cn(
                        "w-full flex items-center rounded-md px-2 py-1.5",
                        pathname.includes("spc-outlook-history") 
                          ? "font-medium text-gray-900" 
                          : "text-gray-600 hover:text-gray-900"
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
                  "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-full",
                  pathname.startsWith("/real-estate")
                    ? "bg-gray-100 text-gray-900"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                Real Estate
                <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {realEstateMenuOpen && (
                <div className="absolute right-0 z-50 min-w-[12rem] overflow-hidden rounded-lg border border-gray-100 bg-white p-1 shadow-lg mt-1">
                  <div className="relative cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-50">
                    <Link 
                      href="/real-estate/firstfruit" 
                      className={cn(
                        "w-full flex items-center rounded-md px-2 py-1.5",
                        pathname.includes("firstfruit") 
                          ? "font-medium text-gray-900" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      Firstfruit Real Estate
                    </Link>
                  </div>
                  <div className="relative cursor-pointer select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-50">
                    <Link 
                      href="/real-estate/veraYield" 
                      className={cn(
                        "w-full flex items-center rounded-md px-2 py-1.5",
                        pathname.includes("veraYield") 
                          ? "font-medium text-gray-900" 
                          : "text-gray-600 hover:text-gray-900"
                      )}
                    >
                      VeraYield
                    </Link>
                  </div>
                </div>
              )}
            </li>
            
            {/* About Me */}
            <li>
              <Link href="/about" className={cn(
                "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-full",
                pathname === "/about" 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}>
                About Me
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;