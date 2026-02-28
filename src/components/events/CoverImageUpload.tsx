"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  X,
  Image as ImageIcon,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  compressImage,
  createImagePreviewUrl,
} from "@/lib/utils/imageCompression";
import { COVER_IMAGE_MAX_FILE_SIZE } from "@/lib/utils/constants";
import type { CompressedImage } from "@/lib/utils/imageCompression";
import {
  IMAGE_STYLES,
  type ImageStyleKey,
} from "@/app/api/generate-cover/route";

interface CoverImageUploadProps {
  onImageReady: (image: CompressedImage | null) => void;
  eventTitle?: string;
  eventDescription?: string;
  eventCategory?: string;
  existingImageUrl?: string;
  existingArkivImageUrl?: string;
}

const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export function CoverImageUpload({
  onImageReady,
  eventTitle,
  eventDescription,
  eventCategory,
  existingImageUrl,
  existingArkivImageUrl,
}: CoverImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    existingArkivImageUrl || existingImageUrl || null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<string | null>(
    null
  );
  const [selectedStyle, setSelectedStyle] =
    useState<ImageStyleKey>("abstract-artistic");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        toast.error("Please upload a JPEG, PNG, WebP, or GIF image");
        return;
      }
      if (file.size > COVER_IMAGE_MAX_FILE_SIZE) {
        toast.error("Image must be under 5MB");
        return;
      }

      setIsCompressing(true);
      setCompressionInfo(null);
      try {
        const compressed = await compressImage(file);

        const url = createImagePreviewUrl(compressed.data);
        setPreviewUrl((prev) => {
          if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
          return url;
        });

        const ratio = (
          (1 - compressed.compressedSize / compressed.originalSize) *
          100
        ).toFixed(0);
        setCompressionInfo(
          `${compressed.width}x${compressed.height} | ${(compressed.compressedSize / 1024).toFixed(1)}KB (${ratio}% smaller)`
        );

        onImageReady(compressed);
      } catch (err) {
        console.error("Image compression error:", err);
        toast.error("Failed to process image");
      } finally {
        setIsCompressing(false);
      }
    },
    [onImageReady]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  const handleRemove = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return null;
    });
    setCompressionInfo(null);
    onImageReady(null);
  }, [onImageReady]);

  const handleGenerateAI = useCallback(async () => {
    if (!eventTitle) {
      toast.error("Enter an event title first (Step 1)");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/generate-cover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: eventTitle,
          description: eventDescription || "",
          category: eventCategory || "",
          style: selectedStyle,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Generation failed");
      }

      const { imageBase64 } = await response.json();

      // Convert base64 to File, then process through compression pipeline
      const binary = atob(imageBase64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const file = new File([bytes], "ai-cover.png", { type: "image/png" });
      await processFile(file);

      toast.success("Cover image generated!");
    } catch (err) {
      console.error("AI generation error:", err);
      const msg =
        err instanceof Error ? err.message : "Failed to generate image";
      toast.error(msg);
    } finally {
      setIsGenerating(false);
    }
  }, [eventTitle, eventDescription, eventCategory, selectedStyle, processFile]);

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        {previewUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative group rounded-xl overflow-hidden border border-white/10"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Cover preview"
              className="w-full aspect-video object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Change
              </Button>
              <Button
                type="button"
                size="sm"
                variant="destructive"
                onClick={handleRemove}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`
              relative rounded-xl border-2 border-dashed p-8
              flex flex-col items-center justify-center gap-3
              cursor-pointer transition-all duration-200
              ${
                isDragging
                  ? "border-violet-500 bg-violet-500/10"
                  : "border-white/10 hover:border-white/20 hover:bg-white/[0.02]"
              }
            `}
          >
            {isCompressing ? (
              <>
                <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Compressing image...
                </p>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-muted-foreground/50" />
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Drop an image here or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPEG, PNG, WebP, or GIF up to 5MB
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {compressionInfo && (
        <p className="text-xs text-muted-foreground/70 flex items-center gap-1">
          <ImageIcon className="h-3 w-3" />
          {compressionInfo}
        </p>
      )}

      <select
        value={selectedStyle}
        onChange={(e) =>
          setSelectedStyle(e.target.value as ImageStyleKey)
        }
        disabled={isGenerating}
        className="w-full h-9 rounded-md border border-white/10 bg-transparent px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-violet-500/50"
      >
        {Object.entries(IMAGE_STYLES).map(([key, { label }]) => (
          <option key={key} value={key} className="bg-zinc-900">
            {label}
          </option>
        ))}
      </select>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleGenerateAI}
        disabled={isGenerating || isCompressing}
        className="w-full border-white/10 hover:bg-violet-500/10 hover:border-violet-500/30"
      >
        {isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating with AI...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4 text-violet-400" />
            Generate with AI
          </>
        )}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
