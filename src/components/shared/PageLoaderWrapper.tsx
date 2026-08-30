"use client";

import { Suspense } from "react";
import PageLoader from "./PageLoader";

/** Wraps the progress bar in a Suspense boundary so useSearchParams works. */
export default function PageLoaderWrapper() {
  return (
    <Suspense fallback={null}>
      <PageLoader />
    </Suspense>
  );
}
