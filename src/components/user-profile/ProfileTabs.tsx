import type { ProfileTabId } from "@/context/userProfile";

interface Props {
  tabs: readonly { id: ProfileTabId; label: string }[];
  active: ProfileTabId;
  onChange: (tab: ProfileTabId) => void;
}

export default function ProfileTabs({ tabs, active, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 border-b border-border overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative whitespace-nowrap px-4 py-2.5 text-sm font-600 transition-colors duration-150 border-b-2 -mb-px ${
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
