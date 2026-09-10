"use client";

import { useEffect } from "react";

const BRAND_STYLE =
  "color: #1b4fd8; font-family: monospace; font-size: 13px; font-weight: bold;";
const HIGHLIGHT_STYLE =
  "color: #0ea5e9; font-family: monospace; font-weight: bold;";
const MUTED_STYLE = "color: #64748b; font-family: monospace;";
const LINK_STYLE =
  "color: #8b5cf6; font-family: monospace; text-decoration: underline;";

const CONTACT_LINES = [
  { text: "  ✉  epic.2077.uni@gmail.com", style: LINK_STYLE },
  { text: "  💻  github.com/Epic2077", style: LINK_STYLE },
  { text: "  🔗  linkedin.com/in/mohammadhosseinsadeghi", style: LINK_STYLE },
  { text: "  🌐  portfolio-ashkan.vercel.app", style: LINK_STYLE },
];

export default function DevConsoleCredit() {
  useEffect(() => {
    console.groupCollapsed(
      "%cKhodroJu - Ashkan Sadeghi %c· اشکان صادقی -خودروجو",
      BRAND_STYLE,
      HIGHLIGHT_STYLE,
    );

    console.log("%cZero-Kilometer Car Marketplace", MUTED_STYLE);
    console.log(
      "%cBuilt by %cAshkan Sadeghi %c· %cاشکان صادقی",
      MUTED_STYLE,
      HIGHLIGHT_STYLE,
      MUTED_STYLE,
      HIGHLIGHT_STYLE,
    );
    console.log(
      "%cDeveloper & Web Engineer · توسعه‌دهنده و مهندس وب",
      MUTED_STYLE,
    );
    console.log("%cContact", MUTED_STYLE);

    CONTACT_LINES.forEach(({ text, style }) => {
      console.log("%c%s", style, text);
    });

    console.groupEnd();
  }, []);

  return null;
}
