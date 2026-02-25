"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { getCoverImage } from "@/lib/arkiv/images";
import type { Hex } from "viem";

export function useCoverImage(coverImageKey: Hex | string | null | undefined) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const prevUrlRef = useRef<string | null>(null);

  const fetchImage = useCallback(() => {
    if (!coverImageKey) {
      setImageUrl(null);
      return;
    }

    setLoading(true);
    getCoverImage(coverImageKey as Hex)
      .then((data) => {
        if (data) {
          const blob = new Blob([data as BlobPart], { type: "image/jpeg" });
          const url = URL.createObjectURL(blob);
          if (prevUrlRef.current) URL.revokeObjectURL(prevUrlRef.current);
          prevUrlRef.current = url;
          setImageUrl(url);
        }
      })
      .catch(() => setImageUrl(null))
      .finally(() => setLoading(false));
  }, [coverImageKey]);

  useEffect(() => {
    fetchImage();
    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
    };
  }, [fetchImage]);

  return { imageUrl, loading, refetch: fetchImage };
}
