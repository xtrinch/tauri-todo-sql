// import { pdf } from "@react-pdf/renderer";
// import { writeFile } from "@tauri-apps/plugin-fs";
// import { info } from "@tauri-apps/plugin-log";
import { writeFile } from "@tauri-apps/plugin-fs";
import { info } from "@tauri-apps/plugin-log";
import { proxy, wrap } from "comlink";
import { WorkerType } from "../workers/pdf.worker";
import Worker from "../workers/pdf.worker?worker";

export const pdfWorker = wrap<WorkerType>(
  new Worker({ name: `pdf-worker-${Math.random()}` })
);
pdfWorker.onProgress(proxy((data: any) => info(data)));
export enum PdfTypeEnum {
  catalogForBuyers = "catalogForBuyers",
  catalogWithPrices = "catalogWithPrices",
  sellerPieces = "sellerPieces",
  soldPieces = "soldPieces",
  boughtPieces = "boughtPieces",
  boughtPiecesPreview = "boughtPiecesPreview",
  statistics = "statistics",
  statisticsForBuyers = "statisticsForBuyers",
  treeSpecies = "treeSpecies",
}

export const saveToPDF = async (
  path: string,
  props: any,
  type: PdfTypeEnum,
  language: string
) => {
  try {
    const stringifiedData = JSON.stringify(props);
    const uint8Array = await pdfWorker.renderPDFInWorker(
      stringifiedData,
      // transfer(stringifiedData, [stringifiedData]), // TODO
      type,
      language
    );

    // Write the PDF file to the file system
    await writeFile(path, uint8Array);
  } catch (e) {
    info(JSON.stringify((e as Error).message));
    throw e;
  }
};
