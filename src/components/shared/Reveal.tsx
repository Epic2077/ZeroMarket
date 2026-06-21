import type { CSSProperties, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Extra classes applied to the wrapper (e.g. grid item utilities). */
  className?: string;
  /** Stagger delay in seconds before the entrance animation starts. */
  delay?: number;
}

// CSS-driven entrance animation. It plays whenever the element is inserted into
// the DOM — including when Next restores the page on a back navigation, where
// client effects do NOT re-run. The element's resting state is visible, so the
// content can never get stuck hidden (unlike a JS/observer-gated reveal).
export default function Reveal({
  children,
  className = "",
  delay = 0,
}: RevealProps) {
  const style: CSSProperties | undefined = delay
    ? { animationDelay: `${delay}s` }
    : undefined;

  return (
    <div className={`reveal-in ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}
