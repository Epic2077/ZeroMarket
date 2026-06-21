"use client";

interface Props {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
}

// RTL-aware on/off switch matching the design system (primary when on). The
// knob sits on the right when off and slides to the left when on.
export default function ToggleSwitch({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        checked ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? "-translate-x-0.5" : "-translate-x-4.5"
        }`}
      />
    </button>
  );
}
