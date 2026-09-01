import type { Listing } from "@/types/dataTypes";
import { formatPrice } from "@/context/data";

/**
 * Generate a shareable URL for a listing
 */
export function getListingShareUrl(listingId: string): string {
  if (typeof window === "undefined") {
    return ``;
  }
  return `${window.location.origin}/market/listings/${listingId}`;
}

/**
 * Generate OG meta tags for a listing
 * Use this in the page's generateMetadata function
 */
export function generateListingMetadata(listing: Listing) {
  const title = `${listing.brand} ${listing.model} ${listing.year}`;
  const description = `${listing.trim} • صفرکیلومتر • ${formatPrice(listing.price)} • ${listing.city}`;
  const url = `${process.env.NEXT_PUBLIC_SITE_URL || "https://zeromarket.ir"}/market/listings/${listing.id}`;
  const imageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || "https://zeromarket.ir"}/og-default.jpg`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: "خودروجو",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

/**
 * Copy listing link to clipboard
 */
export async function copyListingLink(listingId: string): Promise<boolean> {
  try {
    const url = getListingShareUrl(listingId);
    await navigator.clipboard.writeText(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Download image from canvas as PNG with proper headers
 */
export async function downloadCanvasAsImage(
  canvasRef: React.RefObject<HTMLDivElement | null>,
  filename: string,
): Promise<void> {
  if (!canvasRef.current) {
    throw new Error("Canvas reference not found");
  }

  const html2canvas = (await import("html2canvas")).default;

  try {
    const canvas = await html2canvas(canvasRef.current, {
      backgroundColor: "#ffffff",
      scale: 3,
      useCORS: true,
      logging: false,
      allowTaint: true,
      ignoreElements: (element: Element) => {
        // Skip lucide icons - they may have unsupported SVG attributes
        return element.classList.contains("lucide") || false;
      },
      removeContainer: true,
    });

    // Convert canvas to blob with proper content type
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          throw new Error("Failed to generate image blob");
        }

        // Create blob URL with explicit PNG type
        const blobUrl = URL.createObjectURL(
          new Blob([blob], { type: "image/png" }),
        );

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `${filename}.png`;
        link.setAttribute("type", "image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up blob URL
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 100);
      },
      "image/png",
      1.0,
    );
  } catch (error) {
    console.error("Error generating image:", error);
    // Provide more specific error messages
    if (error instanceof Error && error.message.includes("oklab")) {
      throw new Error(
        "خطا: برخی عناصر صفحه با تصویرگیری سازگار نیستند. لطفاً صفحه را تازه کنید.",
      );
    }
    throw new Error("خطا در تولید تصویر");
  }
}

/**
 * Share listing via native share API (if available)
 */
export async function nativeShare(listing: Listing): Promise<boolean> {
  try {
    if (!navigator.share) {
      return false;
    }

    await navigator.share({
      title: `${listing.brand} ${listing.model} ${listing.year}`,
      text: `صفرکیلومتر ${listing.brand} ${listing.model} به قیمت ${formatPrice(listing.price)}`,
      url: getListingShareUrl(listing.id),
    });

    return true;
  } catch (error) {
    console.error("Error sharing:", error);
    return false;
  }
}
