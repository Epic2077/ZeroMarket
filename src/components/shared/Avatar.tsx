import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

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

  // Normalize the path: if a caller passes a full path including the bucket name (e.g. "avatar/xxx.jpg"),
  // strip the bucket prefix to avoid duplicating it in the public URL (which can cause
  // "requested path is invalid" errors).
  const normalizedPath = src
    ? typeof src === "string"
      ? src.replace(/^avatar\//, "")
      : undefined
    : undefined;

  const avatarUrl = normalizedPath
    ? (supabase.storage.from("avatar").getPublicUrl(normalizedPath).data
        ?.publicUrl ?? undefined)
    : undefined;

  // Local state to gracefully fallback if remote image cannot be loaded
  const [imageSrc, setImageSrc] = useState<string | undefined>(undefined);

  // Synchronize imageSrc with the latest avatarUrl when it changes
  useEffect(() => {
    if (avatarUrl !== imageSrc) {
      setImageSrc(avatarUrl);
    }
  }, [avatarUrl]);

  return (
    <div
      className={cn(
        "rounded-2xl bg-primary flex items-center justify-center text-white font-800 shrink-0 overflow-hidden",
        size,
        className,
      )}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={name ?? ""}
          className="w-full h-full object-cover"
          width={56}
          height={56}
          onError={() => {
            // If the remote image fails to load, fall back to initials
            setImageSrc(undefined);
          }}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
