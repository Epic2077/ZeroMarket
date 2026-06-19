import { dashboardTabs, type DashboardTabId } from "@/context/sellerDashboard";

interface Props {
  active: DashboardTabId;
  onChange: (tab: DashboardTabId) => void;
}

export default function DashboardTabs({ active, onChange }: Props) {
  return (
    <div className="flex items-center gap-1 border-b border-border mb-6">
      {dashboardTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-2.5 text-sm font-600 transition-colors duration-150 border-b-2 -mb-px ${
            active === tab.id
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {tab.id === "summary" && (
            <span className="absolute top-1 left-1 ml-1 inline-flex items-center justify-center px-1 py-1 text-xs font-500 text-danger-foreground bg-danger rounded-full"></span>
          )}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
