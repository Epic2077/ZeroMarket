"use client";

import ProductEditor from "@/components/management/ProductEditor";
import { useUserInfo } from "@/context/UserInfoProvider";

export default function SellerProductCreateEntry() {
  const { profile } = useUserInfo();

  if (!profile) return null;

  return <ProductEditor owner={profile} backHref="/dashboard/seller" />;
}
