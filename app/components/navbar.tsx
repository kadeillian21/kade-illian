"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { cn } from "./utils";

const Navbar = () => {
  const pathname = usePathname();
  
  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <div className="font-medium text-lg">Kade Illian</div>
        <NavigationMenu.Root className="relative flex items-center">
          <NavigationMenu.List className="flex list-none items-center justify-end space-x-2">
            <NavigationMenu.Item>
              <Link href="/" className={cn(
                "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-full",
                pathname === "/" 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}>
                Home
              </Link>
            </NavigationMenu.Item>
            
            {/* Meteorology Dropdown */}
            <NavigationMenu.Item>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild>
                  <button className={cn(
                    "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-full",
                    pathname.startsWith("/meteorology")
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}>
                    Meteorology
                    <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </DropdownMenu.Trigger>
                
                <DropdownMenu.Portal>
                  <DropdownMenu.Content
                    align="end"
                    className="z-50 min-w-[12rem] overflow-hidden rounded-lg border border-gray-100 bg-white p-1 shadow-lg animate-in fade-in-80"
                  >
                    <DropdownMenu.Item className="relative flex cursor-default select-none items-center rounded-md px-2 py-1.5 text-sm outline-none transition-colors focus:bg-gray-50">
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
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Portal>
              </DropdownMenu.Root>
            </NavigationMenu.Item>
            
            {/* About Me */}
            <NavigationMenu.Item>
              <Link href="/about" className={cn(
                "flex items-center px-4 py-2 text-sm font-medium transition-colors rounded-full",
                pathname === "/about" 
                  ? "bg-gray-100 text-gray-900" 
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              )}>
                About Me
              </Link>
            </NavigationMenu.Item>
          </NavigationMenu.List>
        </NavigationMenu.Root>
      </div>
    </header>
  );
};

export default Navbar;