"use client";

import type { Listing } from "@/types/dataTypes";
import { MapPin, Zap, ShieldCheck } from "lucide-react";

interface Props {
  listing: Listing;
  forwardRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * A visual card component that displays listing info and can be converted to an image
 * Uses inline styles for html2canvas compatibility
 */
export default function ListingShareCard({ listing, forwardRef }: Props) {
  const getStatusColor = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      active: { bg: "#ecfdf5", text: "#059669" },
      pending: { bg: "#fef3c7", text: "#d97706" },
      sold: { bg: "#fee2e2", text: "#dc2626" },
      negotiable: { bg: "#f3e8ff", text: "#7c3aed" },
      reserved: { bg: "#dbeafe", text: "#0284c7" },
    };
    return colors[status] || colors.active;
  };

  const statusColor = getStatusColor(listing.status);

  return (
    <div
      ref={forwardRef}
      style={{
        width: "100%",
        aspectRatio: "1.2 / 1",
        backgroundColor: "#ffffff",
        backgroundImage: "linear-gradient(135deg, #f0f4ff 0%, #f9f5ff 100%)",
        borderRadius: "20px",
        padding: "32px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        fontFamily: '"Segoe UI", "Tahoma", "Arial", sans-serif',
        boxSizing: "border-box",
        color: "#0f172a",
        border: "2px solid #e2e8f0",
        direction: "rtl",
        textAlign: "right",
        fontFeatureSettings: '"mark" on, "mset" on',
        textRendering: "optimizeLegibility",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: "1px solid #cbd5e1",
        }}
      >
        <div
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#1b4fd8",
            letterSpacing: "0px",
            direction: "rtl",
            wordSpacing: "normal",
            fontFeatureSettings: '"mark" on, "mset" on',
          }}
        >
          خودروجو
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            paddingLeft: "12px",
            paddingRight: "12px",
            paddingTop: "6px",
            paddingBottom: "6px",
            borderRadius: "8px",
            backgroundColor: statusColor.bg,
            fontSize: "12px",
            fontWeight: "600",
            color: statusColor.text,
            textTransform: "capitalize",
            direction: "rtl",
            wordSpacing: "normal",
            fontFeatureSettings: '"mark" on, "mset" on',
          }}
        >
          {listing.status === "active"
            ? "فعال"
            : listing.status === "pending"
              ? "در انتظار"
              : listing.status === "sold"
                ? "فروخته شد"
                : listing.status === "negotiable"
                  ? "قابل مذاکره"
                  : "رزرو شده"}
        </div>
      </div>

      {/* Main content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: "24px",
        }}
      >
        {/* Brand and model */}
        <div>
          <h1
            style={{
              fontSize: "36px",
              fontWeight: "900",
              color: "#0f172a",
              lineHeight: "1.2",
              margin: "0 0 8px 0",
              direction: "rtl",
              textAlign: "right",
              unicodeBidi: "normal" as const,
              wordSpacing: "0.1em",
            }}
          >
            {listing.brand} {listing.model}
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#64748b",
              margin: "0",
              direction: "rtl",
              textAlign: "right",
              unicodeBidi: "normal" as const,
              wordSpacing: "0.05em",
            }}
          >
            {listing.trim} · {listing.year}
          </p>
        </div>

        {/* Price box */}
        <div
          style={{
            backgroundColor: "#eff6ff",
            border: "2px solid #0284c7",
            borderRadius: "12px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <label
            style={{
              fontSize: "12px",
              color: "#64748b",
              marginBottom: "8px",
              fontWeight: "600",
              direction: "rtl",
              wordSpacing: "normal",
              fontFeatureSettings: '"mark" on, "mset" on',
            }}
          >
            قیمت
          </label>
          <div
            style={{
              fontSize: "28px",
              fontWeight: "900",
              color: "#1b4fd8",
              lineHeight: "1.2",
              direction: "ltr",
              textAlign: "right",
              fontFamily: 'Geist Mono, "Courier New", monospace',
            }}
          >
            {listing.price.toLocaleString("fa-IR")}
          </div>
          <div
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#1b4fd8",
              direction: "rtl",
              textAlign: "right",
              unicodeBidi: "normal" as const,
              wordSpacing: "0.1em",
              marginTop: "4px",
            }}
          >
            تومان
          </div>
        </div>

        {/* Specs grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "12px",
          }}
        >
          {/* City */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "12px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "#64748b",
                marginBottom: "6px",
                fontWeight: "600",
                margin: "0",
                direction: "rtl",
                textAlign: "center",
                unicodeBidi: "normal" as const,
              }}
            >
              شهر
            </p>
            <p
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#0f172a",
                margin: "0",
                direction: "rtl",
                textAlign: "center",
                unicodeBidi: "normal" as const,
              }}
            >
              {listing.city}
            </p>
          </div>

          {/* Delivery */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "12px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "#64748b",
                marginBottom: "6px",
                fontWeight: "600",
                margin: "0",
                direction: "rtl",
                textAlign: "center",
                unicodeBidi: "normal" as const,
              }}
            >
              تحویل
            </p>
            <p
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#10b981",
                margin: "0",
                direction: "rtl",
                textAlign: "center",
                unicodeBidi: "normal" as const,
              }}
            >
              {listing.deliveryDays === 0
                ? "آماده"
                : `${listing.deliveryDays} روز`}
            </p>
          </div>

          {/* Status */}
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "12px",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                color: "#64748b",
                marginBottom: "6px",
                fontWeight: "600",
                margin: "0",
                direction: "rtl",
                textAlign: "center",
                unicodeBidi: "normal" as const,
              }}
            >
              وضعیت
            </p>
            <p
              style={{
                fontSize: "13px",
                fontWeight: "700",
                color: "#10b981",
                margin: "0",
                direction: "rtl",
                textAlign: "center",
                unicodeBidi: "normal" as const,
              }}
            >
              صفر کیلومتر
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          marginTop: "24px",
          paddingTop: "16px",
          borderTop: "1px solid #cbd5e1",
          textAlign: "center",
          direction: "rtl",
        }}
      >
        <p
          style={{
            fontSize: "12px",
            color: "#64748b",
            fontWeight: "500",
            margin: "0 0 4px 0",
            direction: "rtl",
            wordSpacing: "normal",
            unicodeBidi: "normal" as const,
          }}
        >
          صفرکیلومتر کارخانه — خودروجو
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "#94a3b8",
            fontWeight: "400",
            margin: "0",
            direction: "rtl",
            wordSpacing: "normal",
          }}
        >
          khodroju.ir
        </p>
      </div>
    </div>
  );
}
