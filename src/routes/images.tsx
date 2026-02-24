import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { open } from "@tauri-apps/plugin-dialog";
import { readFile } from "@tauri-apps/plugin-fs";
import { info } from "@tauri-apps/plugin-log";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  compressImageForStorage,
  ImageKey,
  imagesQueryOptions,
  mimeTypeFromPath,
  resolveImageSources,
  useUpdateImageMutation,
} from "../utils/imageService";

export const Route = createFileRoute("/images")({
  component: ImagesComponent,
});

function ImagesComponent() {
  const { t, i18n } = useTranslation();

  const imagesQuery = useSuspenseQuery(
    imagesQueryOptions({
      ...Route.useLoaderDeps(),
      language: i18n.language as "en" | "sl",
    })
  );
  const imageRows = imagesQuery.data;

  const { headerImageSrc, woodImageSrc } = resolveImageSources(imageRows);

  const updateImageMutation = useUpdateImageMutation({
    onError: () => {
      toast.error(t("couldNotUpdate"));
    },
  });

  const imageCards = useMemo(
    () => [
      {
        key: "header" as ImageKey,
        label: t("headerImage"),
        src: headerImageSrc,
      },
      {
        key: "wood" as ImageKey,
        label: t("woodImage"),
        src: woodImageSrc,
      },
    ],
    [t, headerImageSrc, woodImageSrc]
  );

  const replaceImage = async (imageKey: ImageKey) => {
    const selectedPath = await open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: "Image",
          extensions: ["png", "jpg", "jpeg", "webp"],
        },
      ],
    });

    if (!selectedPath || Array.isArray(selectedPath)) {
      return;
    }

    const mimeType = mimeTypeFromPath(selectedPath);

    if (!mimeType) {
      toast.error(t("unsupportedImageType"));
      return;
    }

    try {
      const fileBytes = await readFile(selectedPath);
      const compressedImage = await compressImageForStorage({
        bytes: fileBytes,
        mimeType,
        imageKey,
      });

      await updateImageMutation.mutateAsync({
        image_key: imageKey,
        mime_type: compressedImage.mimeType,
        data_base64: compressedImage.data_base64,
      });

      toast.success(t("imageUpdated"));
    } catch (e) {
      info(JSON.stringify(e));
      toast.error(t("couldNotUpdate"));
    }
  };

  return (
    <div className="p-3 h-[calc(100vh-53px)] overflow-auto">
      <div className="mb-3 text-lg font-bold">{t("images")}</div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
        {imageCards.map((imageCard) => (
          <div key={imageCard.key} className="border rounded p-3 bg-white">
            <div className="mb-3 text-sm font-bold uppercase tracking-wide">
              {imageCard.label}
            </div>
            <div className="border rounded p-2 bg-gray-50 h-[280px] flex items-center justify-center">
              <img
                src={imageCard.src}
                alt={imageCard.label}
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div className="mt-3 flex gap-2">
              <button
                className="bg-blue-400 rounded px-3 py-2 uppercase text-white font-black disabled:opacity-50"
                onClick={() => replaceImage(imageCard.key)}
                disabled={updateImageMutation.isPending}
              >
                {t("replaceImage")}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
