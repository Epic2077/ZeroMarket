import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default function AuthHeader() {
  return (
    <>
      <Link
        href="#login"
        className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-600 text-muted-foreground hover:text-foreground transition-colors duration-150"
      >
        <LogIn size={15} />
        ورود
      </Link>
      <Button
        variant="default"
        className="py-2 px-4 hover:bg-primary/90 transition-colors duration-150 hidden sm:flex"
      >
        <Link href="#register" className=" text-sm hidden sm:flex ">
          ثبت آگهی
        </Link>
      </Button>
    </>
  );
}
