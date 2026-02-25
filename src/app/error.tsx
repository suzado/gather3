"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4">
      <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 mb-6">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
      <p className="text-muted-foreground mb-6 text-center max-w-md">
        An unexpected error occurred. Please try again.
      </p>
      <Button
        onClick={reset}
        className="bg-gradient-to-r from-violet-600 to-blue-600"
      >
        Try Again
      </Button>
    </div>
  );
}
