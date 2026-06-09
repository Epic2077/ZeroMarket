import Link from "next/link";
import { navLinks } from "@/context/header";

export default function Bookmarks() {
  return (
    <nav className="hidden lg:flex items-center gap-1">
      {navLinks?.map((link) => (
        <Link
          key={`nav-${link?.label}`}
          href={link?.href}
          className="px-3 py-2 text-sm font-500 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150"
        >
          {link?.label}
        </Link>
      ))}
    </nav>
  );
}
