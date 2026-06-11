import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface notificationProps {
  active: boolean;
}

export default function Notification({ active }: notificationProps) {
  return (
    <Button
      variant="ghost"
      className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
    >
      <Bell size={18} />
      {active && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full"></span>
      )}
    </Button>
  );
}
