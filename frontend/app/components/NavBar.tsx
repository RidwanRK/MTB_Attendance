"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/history", label: "History" },
  { href: "/report", label: "Report" },
  { href: "/settings", label: "Settings" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 border-t border-slate-200 bg-white sm:static sm:border-t-0 sm:border-b">
      <div className="max-w-2xl mx-auto flex justify-around sm:justify-start sm:gap-6 sm:px-4 sm:py-3">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex-1 sm:flex-none text-center py-3 sm:py-1 text-sm font-medium transition-colors ${
                active
                  ? "text-blue-600 sm:border-b-2 sm:border-blue-600"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
