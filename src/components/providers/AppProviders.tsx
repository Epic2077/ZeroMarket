"use client";

import { AdminProvider } from "@/context/AdminProvider";
import { BannerProvider } from "@/context/BannerProvider";
import { BlogProvider } from "@/context/BlogProvider";
// import { ListingsProvider } from "@/context/ListingsProvider";
import { SessionProvider } from "@/context/SessionProvider";
import { TaxonomyProvider } from "@/context/TaxonomyProvider";
import { UserInfoProvider } from "@/context/UserInfoProvider";
import type { ReactNode } from "react";

// App-wide client providers. Platform management state lives here (not just in
// the dashboard) so public pages can offer "manage" shortcuts and reflect the
// current viewer.
export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <UserInfoProvider>
      <SessionProvider>
        <AdminProvider>
          <TaxonomyProvider>
            <BlogProvider>
              {/* <ListingsProvider> */}
              <BannerProvider>{children}</BannerProvider>
              {/* </ListingsProvider> */}
            </BlogProvider>
          </TaxonomyProvider>
        </AdminProvider>
      </SessionProvider>
    </UserInfoProvider>
  );
}
