import { LogIn } from "lucide-react";
import Link from "next/link";
import PostAdButton from "./PostAdButton";

export default function AuthHeader() {
  return (
    <>
      <Link
        href="/auth/login"
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-600 text-muted-foreground hover:text-foreground transition-colors duration-150"
      >
        <LogIn size={15} />
        ورود
      </Link>
      <PostAdButton />
    </>
  );
}
