import React, { useMemo, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  /** Image URL. When provided, the image is shown; otherwise initials are displayed. */
  src?: string | null;
  /** Fallback text used to derive initials (first char of each of the first 2 words). */
  name?: string | null;
  /** Size in Tailwind units, e.g. "w-14 h-14". Defaults to "w-10 h-10". */
  size?: string;
  /** Extra classes for the outer container. */
  className?: string;
}

/** Extracts at most 2 initials from a name string. */
function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
}

export default function Avatar({
  src,
  name,
  size = "w-10 h-10",
  className,
}: AvatarProps) {
  const initials = name ? getInitials(name) : "";

  // Track only the URL that has failed loading.
  // This avoids setState-inside-effect patterns and still lets us recover when src changes.
  const [failedUrl, setFailedUrl] = useState<string | undefined>(undefined);

  // Public-bucket flow:
  // - support full URL if already stored
  // - otherwise treat src as bucket-relative path and build public URL
  const resolvedAvatarUrl = useMemo(() => {
    if (!src) {
      return undefined;
    }

    const raw = src.trim();
    if (!raw) {
      return undefined;
    }

    if (/^https?:\/\//i.test(raw)) {
      return raw;
    }

    const normalizedPath = raw
      .replace(/^\/+/, "")
      .replace(/^avatar\//, "")
      .replace(/^storage\/v1\/object\/public\/avatar\//, "");

    if (!normalizedPath) {
      return undefined;
    }

    return (
      supabase.storage.from("avatar").getPublicUrl(normalizedPath).data
        ?.publicUrl ?? undefined
    );
  }, [src]);

  const imageSrc =
    resolvedAvatarUrl && failedUrl !== resolvedAvatarUrl
      ? resolvedAvatarUrl
      : undefined;

  return (
    <div
      className={cn(
        "relative rounded-2xl bg-primary flex items-center justify-center text-white font-800 shrink-0 overflow-hidden",
        size,
        className,
      )}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={name ?? ""}
          fill
          sizes="64px"
          className="object-cover"
          unoptimized
          onError={() => {
            // If the remote image fails to load, fall back to initials
            setFailedUrl(imageSrc);
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
