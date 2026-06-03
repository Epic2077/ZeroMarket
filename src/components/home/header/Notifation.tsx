import { Bell } from "lucide-react";

interface notificationProps {
  active: boolean;
}

export default function Notification(active: notificationProps) {
  return (
    <div className="relative w-6 h-6 hover:bg-muted-foreground rounded-[5px] flex items-center justify-center cursor-pointer">
      <div
        className={`absolute top-0 right-0 w-2 h-2  rounded-full bg-red-500 ${active ? "block" : "hidden"}`}
      ></div>
      <Bell className="w-5 h-5 text-muted" />
    </div>
  );
}
