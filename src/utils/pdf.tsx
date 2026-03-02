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

const isPdfDebugEnabled = () => {
  if (import.meta.env.DEV) return true;
  try {
    return window.localStorage.getItem("pdf_debug") === "1";
  } catch {
    return false;
  }
};

const createPdfExportId = (type: PdfTypeEnum) =>
  `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const logPdfConsole = (
  event: string,
  data: Record<string, unknown>,
  level: "info" | "error" = "info"
) => {
  const payload = JSON.stringify({ scope: "pdf", event, ...data });
  if (level === "error") {
    console.error(payload);
    return;
  }
  console.info(payload);
};

export enum PdfTypeEnum {
  catalogForBuyers = "catalogForBuyers",
  catalogWithPrices = "catalogWithPrices",
  sellerPieces = "sellerPieces",
  soldPieces = "soldPieces",
  boughtPieces = "boughtPieces",
  boughtPiecesPreview = "boughtPiecesPreview",
  statistics = "statistics",
  offerStatistics = "offerStatistics",
  statisticsForBuyers = "statisticsForBuyers",
  treeSpecies = "treeSpecies",
}

export const saveToPDF = async (
  path: string,
  props: any,
  type: PdfTypeEnum,
  language: string
) => {
  const debug = isPdfDebugEnabled();
  const exportId = createPdfExportId(type);
  const startedAt = performance.now();

  try {
    const stringifiedData = JSON.stringify(props);
    const payloadBytes = new TextEncoder().encode(stringifiedData).length;
    if (debug) {
      logPdfConsole("export:start", {
        exportId,
        type,
        language,
        path,
        payloadBytes,
      });
    }

    const renderStartedAt = performance.now();
    const uint8Array = await pdfWorker.renderPDFInWorker(
      stringifiedData,
      // transfer(stringifiedData, [stringifiedData]), // TODO
      type,
      language,
      debug,
      exportId
    );
    if (debug) {
      logPdfConsole("export:rendered", {
        exportId,
        type,
        bytes: uint8Array.byteLength,
        renderMs: Math.round(performance.now() - renderStartedAt),
      });
    }

    // Write the PDF file to the file system
    const writeStartedAt = performance.now();
    await writeFile(path, uint8Array);
    if (debug) {
      logPdfConsole("export:written", {
        exportId,
        type,
        path,
        writeMs: Math.round(performance.now() - writeStartedAt),
        totalMs: Math.round(performance.now() - startedAt),
      });
    }
  } catch (e) {
    if (debug) {
      logPdfConsole(
        "export:error",
        {
        exportId,
        type,
        path,
        totalMs: Math.round(performance.now() - startedAt),
        message: (e as Error).message,
        },
        "error"
      );
    }
    info(JSON.stringify((e as Error).message));
    throw e;
  }
};
