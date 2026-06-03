import { Bell } from "lucide-react";

interface notificationProps {
  active: boolean;
}

export default function Notification(active: notificationProps) {
  return (
    <div className="relative">
      <div
        className={`absolute top-0 right-0 w-2 h-2 -mt-1 -ml-1 rounded-full bg-red-500 ${active ? "block" : "hidden"}`}
      ></div>
      <Bell className="w-5 h-5 text-muted" />
    </div>
  );
}
