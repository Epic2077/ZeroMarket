"use client";

import { useAdmin } from "@/context/AdminProvider";
import { CURRENT_SELLER_ID } from "@/context/adminData";
import ProductEditor from "@/components/management/ProductEditor";

export default function SellerProductCreateEntry() {
  const { users } = useAdmin();
  const seller = users.find((u) => u.id === CURRENT_SELLER_ID);

  if (!seller) return null;

  return <ProductEditor owner={seller} backHref="/dashboard/seller" />;
}
