import { User } from "lucide-react";
import Link from "next/link";

export default function Profile() {
  return (
    <Link
      href="/user-profile"
      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-600 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors duration-150"
    >
      <User size={15} />
      پروفایل
    </Link>
  );
}
