import {
  userDashboardTabs,
  type UserDashboardTabId,
} from "@/context/userProfile";

interface Props {
  active: UserDashboardTabId;
  onChange: (tab: UserDashboardTabId) => void;
}

export default function UserDashboardTabs({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 border-b border-border mb-6">
      {userDashboardTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2.5 text-sm font-600 transition-colors duration-150 border-b-2 -mb-px ${
            active === tab.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
