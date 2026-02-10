"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "./utils";
import UserMenu from "./UserMenu";
import NavDropdown from "./NavDropdown";

const hebrewItems = [
  { label: "Hub", href: "/hebrew" },
  { label: "Lessons", href: "/hebrew/lessons" },
  { label: "Vocabulary", href: "/hebrew/vocabulary" },
  { label: "Bible", href: "/hebrew/bible" },
  { label: "Review", href: "/hebrew/review" },
];

const greekItems = [
  { label: "Hub", href: "/greek" },
  { label: "Lessons", href: "/greek/lessons" },
  { label: "Vocabulary", href: "/greek/vocabulary" },
];

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
            Dashboard
          </Link>

          <NavDropdown
            label="Hebrew"
            href="/hebrew"
            items={hebrewItems}
          />

          <NavDropdown
            label="Greek"
            href="/greek"
            items={greekItems}
            disabled
          />

          <Link
            href="/portfolio"
            className={cn(
              "px-4 py-2 text-sm font-medium rounded-full transition-all",
              pathname.startsWith("/portfolio")
                ? "bg-[#6b7d6a] text-white"
                : "text-gray-500 hover:text-[#4a5d49] hover:bg-[#f5f1e8]"
            )}
          >
            Portfolio
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
