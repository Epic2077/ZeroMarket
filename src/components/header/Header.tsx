import { LogInIcon } from "lucide-react";
import Logo from "../shared/logo/Logo";
import { Button } from "../ui/button";
import Bookmarks from "./Bookmarks";
import Notification from "./Notifation";
import SearchBox from "./SearchBox";

export default function Header() {
  return (
    <header
      className="w-full h-18 flex items-center bg-white px-4.5 justify-between font-dyna"
      dir="rtl"
    >
      <Logo size="small" title />
      <Bookmarks />
      <div className="flex items-center gap-5">
        <SearchBox />
        <Notification active={true} />
        <Button
          variant="ghost"
          className="text-muted text-lg flex items-center text-bold"
        >
          <p>ورود</p>
          <LogInIcon className="w-6 h-6" />
        </Button>
        <Button
          variant="default"
          className="bg-primary text-secondary w-31.25 h-10.75"
        >
          <p className="font-bold text-lg font-dyna">ثبت آگهی</p>
        </Button>
      </div>
    </header>
  );
}
