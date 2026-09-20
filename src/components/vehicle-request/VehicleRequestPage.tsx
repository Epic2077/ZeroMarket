"use client";

import { useRouter } from "next/navigation";

import { VehicleRequestModal } from "./VehicleRequestModal";

export function VehicleRequestPage() {
  const router = useRouter();

  return (
    <VehicleRequestModal isOpen embedded onClose={() => router.push("/")} />
  );
}
