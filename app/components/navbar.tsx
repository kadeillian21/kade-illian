"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./utils";

const Navbar = () => {
  const pathname = usePathname();

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

          <Link
            href="/hebrew/vocabulary"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              pathname.startsWith("/hebrew")
                ? "bg-[#6b7d6a] text-white"
                : "text-gray-600 hover:text-[#4a5d49] hover:bg-[#f5f1e8]"
            )}
          >
            Hebrew
          </Link>

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
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
