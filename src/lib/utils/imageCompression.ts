import {
  COVER_IMAGE_MAX_WIDTH,
  COVER_IMAGE_MAX_HEIGHT,
  COVER_IMAGE_QUALITY,
  COVER_IMAGE_MAX_PAYLOAD_SIZE,
} from "./constants";

export interface CompressedImage {
  data: Uint8Array;
  mimeType: "image/jpeg";
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

export async function compressImage(file: File): Promise<CompressedImage> {
  const originalSize = file.size;

  const imageBitmap = await createImageBitmap(file);
  const { width: origW, height: origH } = imageBitmap;

  // Calculate target dimensions maintaining aspect ratio
  let targetW = origW;
  let targetH = origH;
  const aspectRatio = origW / origH;

  if (targetW > COVER_IMAGE_MAX_WIDTH) {
    targetW = COVER_IMAGE_MAX_WIDTH;
    targetH = Math.round(targetW / aspectRatio);
  }
  if (targetH > COVER_IMAGE_MAX_HEIGHT) {
    targetH = COVER_IMAGE_MAX_HEIGHT;
    targetW = Math.round(targetH * aspectRatio);
  }

  const canvas = new OffscreenCanvas(targetW, targetH);
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(imageBitmap, 0, 0, targetW, targetH);
  imageBitmap.close();

  // Convert to JPEG, progressively lower quality if too large
  let quality = COVER_IMAGE_QUALITY;
  let blob = await canvas.convertToBlob({ type: "image/jpeg", quality });

  while (blob.size > COVER_IMAGE_MAX_PAYLOAD_SIZE && quality > 0.3) {
    quality -= 0.1;
    blob = await canvas.convertToBlob({ type: "image/jpeg", quality });
  }

  // If still too large, scale down further
  if (blob.size > COVER_IMAGE_MAX_PAYLOAD_SIZE) {
    const scaleFactor = Math.sqrt(COVER_IMAGE_MAX_PAYLOAD_SIZE / blob.size);
    const newW = Math.round(targetW * scaleFactor);
    const newH = Math.round(targetH * scaleFactor);
    const smallCanvas = new OffscreenCanvas(newW, newH);
    const smallCtx = smallCanvas.getContext("2d")!;
    const tempBitmap = await createImageBitmap(
      await canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 })
    );
    smallCtx.drawImage(tempBitmap, 0, 0, newW, newH);
    tempBitmap.close();
    blob = await smallCanvas.convertToBlob({ type: "image/jpeg", quality: 0.5 });
    targetW = newW;
    targetH = newH;
  }

  const arrayBuffer = await blob.arrayBuffer();
  return {
    data: new Uint8Array(arrayBuffer),
    mimeType: "image/jpeg",
    width: targetW,
    height: targetH,
    originalSize,
    compressedSize: arrayBuffer.byteLength,
  };
}

export function createImagePreviewUrl(data: Uint8Array): string {
  const blob = new Blob([data as BlobPart], { type: "image/jpeg" });
  return URL.createObjectURL(blob);
}
