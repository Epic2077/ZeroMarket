"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="flex min-h-[70vh] items-center justify-center px-4 py-16"
      dir="rtl"
    >
      <div className="card-elevated w-full max-w-md p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-danger" />
        <h2 className="text-lg font-700 text-foreground">خطایی رخ داد</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          در بارگذاری این صفحه مشکلی پیش آمد. لطفاً دوباره تلاش کنید.
        </p>
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="btn-primary mt-6 w-full justify-center"
        >
          تلاش مجدد
        </button>
      </div>
    </div>
  );
}
