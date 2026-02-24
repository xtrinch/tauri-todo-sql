import { queryOptions, useMutation } from "@tanstack/react-query";
import { info } from "@tauri-apps/plugin-log";
import defaultHeaderImage from "../assets/images/header-image.png";
import defaultWoodImage from "../assets/images/wood-image.jpg";
import { queryClient } from "../main";
import { getDatabase, getDatabaseForModify } from "./database";

export type ImageKey = "header" | "wood";

export type ImageRow = {
  id: number;
  image_key: ImageKey;
  mime_type: string | null;
  data_base64: string | null;
};

type PickAsRequired<TValue, TKey extends keyof TValue> = Omit<TValue, TKey> &
  Required<Pick<TValue, TKey>>;

interface ListOptions {
  language?: "en" | "sl";
}

const DEFAULT_IMAGES: Record<ImageKey, string> = {
  header: defaultHeaderImage,
  wood: defaultWoodImage,
};

const IMAGE_LIMITS: Record<
  ImageKey,
  { maxDimension: number; targetBytes: number }
> = {
  header: { maxDimension: 1800, targetBytes: 350 * 1024 },
  wood: { maxDimension: 2200, targetBytes: 900 * 1024 },
};

const imageOrderSql =
  "CASE image_key WHEN 'header' THEN 0 WHEN 'wood' THEN 1 ELSE 2 END";

export const ensureImages = async (_opts: ListOptions): Promise<ImageRow[]> => {
  const db = await getDatabase();
  const result = await db.select(
    `SELECT id, image_key, mime_type, data_base64
      FROM "images"
      ORDER BY ${imageOrderSql}`,
    []
  );

  return result as ImageRow[];
};

export async function patchImage(
  image: PickAsRequired<Partial<ImageRow>, "image_key">
) {
  const db = await getDatabaseForModify();
  await db.execute(
    `INSERT INTO "images" ("image_key", "mime_type", "data_base64")
      VALUES ($1, $2, $3)
      ON CONFLICT("image_key")
      DO UPDATE SET
        "mime_type" = EXCLUDED."mime_type",
        "data_base64" = EXCLUDED."data_base64"`,
    [image.image_key, image.mime_type ?? null, image.data_base64 ?? null]
  );
}

export const useUpdateImageMutation = (opts?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}) => {
  return useMutation({
    mutationFn: patchImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["images"] });
      if (opts?.onSuccess) opts.onSuccess();
    },
    gcTime: 1000 * 10,
    onError: (e) => {
      info(JSON.stringify(e));
      if (opts?.onError) opts.onError(e);
    },
  });
};

export const imagesQueryOptions = (opts: ListOptions) =>
  queryOptions({
    queryKey: ["images", opts],
    queryFn: () => ensureImages(opts),
    staleTime: Infinity,
  });

export function resolveImageSources(images: ImageRow[]) {
  const imageByKey = images.reduce(
    (acc, image) => {
      acc[image.image_key] = image;
      return acc;
    },
    {} as Record<ImageKey, ImageRow | undefined>
  );

  return {
    headerImageSrc: toImageSrc(imageByKey.header, "header"),
    woodImageSrc: toImageSrc(imageByKey.wood, "wood"),
  };
}

function toImageSrc(image: ImageRow | undefined, fallbackKey: ImageKey): string {
  if (!image?.mime_type || !image.data_base64) {
    return DEFAULT_IMAGES[fallbackKey];
  }

  return `data:${image.mime_type};base64,${image.data_base64}`;
}

export function uint8ArrayToBase64(bytes: Uint8Array): string {
  const chunkSize = 0x8000;
  let binary = "";

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

export async function compressImageForStorage(params: {
  bytes: Uint8Array;
  mimeType: string;
  imageKey: ImageKey;
}): Promise<{ mimeType: string; data_base64: string }> {
  const { maxDimension, targetBytes } = IMAGE_LIMITS[params.imageKey];
  const sourceBlob = new Blob([params.bytes], { type: params.mimeType });
  const bitmap = await createImageBitmap(sourceBlob);

  try {
    const scale = Math.min(
      1,
      maxDimension / Math.max(bitmap.width, bitmap.height)
    );
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not initialize canvas context");
    }

    context.drawImage(bitmap, 0, 0, width, height);

    const forceJpeg =
      params.imageKey === "wood" ||
      params.mimeType === "image/jpeg" ||
      params.mimeType === "image/webp";
    let outputMimeType = forceJpeg ? "image/jpeg" : "image/png";
    let outputBlob: Blob;

    if (outputMimeType === "image/jpeg") {
      outputBlob = await encodeJpegWithTargetSize(canvas, targetBytes);
    } else {
      outputBlob = await canvasToBlob(canvas, "image/png");
      if (outputBlob.size > targetBytes) {
        outputMimeType = "image/jpeg";
        outputBlob = await encodeJpegWithTargetSize(canvas, targetBytes);
      }
    }

    const outputBytes = new Uint8Array(await outputBlob.arrayBuffer());

    return {
      mimeType: outputMimeType,
      data_base64: uint8ArrayToBase64(outputBytes),
    };
  } finally {
    bitmap.close();
  }
}

async function encodeJpegWithTargetSize(
  canvas: HTMLCanvasElement,
  targetBytes: number
): Promise<Blob> {
  const qualitySteps = [0.86, 0.8, 0.74, 0.68, 0.62, 0.56];
  let smallest = await canvasToBlob(canvas, "image/jpeg", qualitySteps[0]);

  if (smallest.size <= targetBytes) {
    return smallest;
  }

  for (const quality of qualitySteps.slice(1)) {
    const blob = await canvasToBlob(canvas, "image/jpeg", quality);
    if (blob.size < smallest.size) {
      smallest = blob;
    }
    if (blob.size <= targetBytes) {
      return blob;
    }
  }

  return smallest;
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to encode image"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export function mimeTypeFromPath(path: string): string | null {
  const extension = path.toLowerCase().split(".").pop();

  switch (extension) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "webp":
      return "image/webp";
    default:
      return null;
  }
}
