import AppImage from "@/components/shared/AppImage";
import type { BlogMedia } from "@/types/blog";

function youtubeEmbed(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtu.be")) {
      const id = parsed.pathname.replace("/", "");
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }

    if (parsed.hostname.includes("youtube.com")) {
      const id = parsed.searchParams.get("v") ?? "";
      return id ? `https://www.youtube.com/embed/${id}` : "";
    }
  } catch {
    return "";
  }

  return "";
}

export function BlogMediaPreview({
  media,
  className,
}: {
  media?: BlogMedia[];
  className?: string;
}) {
  const first = media?.[0];

  if (!first) {
    return null;
  }

  if (first.kind === "image") {
    return (
      <figure className={className}>
        <AppImage
          src={first.url}
          alt={first.alt ?? "تصویر نوشته"}
          width={1200}
          height={675}
          unoptimized
          className="w-full h-full object-cover"
        />
        {first.caption && (
          <figcaption className="mt-1 text-2xs text-muted-foreground">
            {first.caption}
          </figcaption>
        )}
      </figure>
    );
  }

  const embed = youtubeEmbed(first.url);

  return (
    <figure className={className}>
      <div className="overflow-hidden rounded-2xl border border-border bg-black/90">
        {embed ? (
          <iframe
            title={first.alt ?? "ویدیو نوشته"}
            src={embed}
            className="h-52 w-full sm:h-72"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            src={first.url}
            controls
            className="h-52 w-full sm:h-72 object-cover"
          />
        )}
      </div>
      {first.caption && (
        <figcaption className="mt-1 text-2xs text-muted-foreground">
          {first.caption}
        </figcaption>
      )}
    </figure>
  );
}
