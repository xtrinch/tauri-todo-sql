import { pdf } from "@react-pdf/renderer";
import { writeFile } from "@tauri-apps/plugin-fs";
import { info } from "@tauri-apps/plugin-log";
import { ReactElement } from "react";

export const saveToPDF = async (path: string, component: ReactElement) => {
  try {
    const blob = await pdf(component).toBlob();
    // Convert Blob to ArrayBuffer
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Write the PDF file to the file system
    await writeFile(path, uint8Array);
  } catch (e) {
    info(JSON.stringify((e as Error).message));
    throw e;
  }
};
