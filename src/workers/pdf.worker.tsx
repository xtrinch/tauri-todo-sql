import { info } from "@tauri-apps/plugin-log";
import { expose } from "comlink";
import { BoughtPiecesExportProps } from "../components/BoughtPiecesExport";
import { BoughtPiecesPreviewExportProps } from "../components/BoughtPiecesPreviewExport";
import { CatalogueExportForBuyersProps } from "../components/CatalogueExportForBuyers";
import { CatalogueExportWithPricesProps } from "../components/CatalogueExportWithPrices";
import { GeneralStatsExportProps } from "../components/GeneralStatsExport";
import { StatsForBuyersExportProps } from "../components/StatsForBuyersExport";
import { SellerPiecesExportProps } from "../components/SellerPiecesExport";
import { SoldPiecesExportProps } from "../components/SoldPiecesExport";
import { StatsExportProps } from "../components/StatsExport";
import { TreeSpeciesExportProps } from "../components/TreeSpeciesExport";
import { PdfTypeEnum } from "../utils/pdf";
import "./workerShim";
// @ts-ignore
let log = info;

const initializeCommonPdfImports = async (language: "en" | "sl") => {
  const { Font } = await import("@react-pdf/renderer");

  // import fonts otherwise they won't be found
  const fontBold = (await import("../assets/fonts/Roboto-Bold.ttf")).default;
  const font = (await import("../assets/fonts/Roboto-Regular.ttf")).default;

  // initialize translations since this is the worker
  const i18n = (await import("./../utils/i18n")).default;
  i18n.changeLanguage(language);

  Font.register({
    family: "Roboto",
    src: font,
    fontWeight: "normal",
    fontStyle: "normal",
  });
  Font.register({
    family: "Roboto",
    src: fontBold,
    fontWeight: "bold",
    fontStyle: "normal",
  });

  const { pdf } = await import("@react-pdf/renderer");

  return { pdf };
};

const renderPDFInWorker = async (
  props: string,
  type: PdfTypeEnum,
  language: string
): Promise<Uint8Array> => {
  const { pdf } = await initializeCommonPdfImports(language as "sl" | "en");

  let blob: Blob = new Blob();
  switch (type) {
    case "statistics":
      const { GeneralStatsExport } = await import(
        "../components/GeneralStatsExport"
      );

      const statsData: GeneralStatsExportProps = JSON.parse(props);

      try {
        blob = await pdf(<GeneralStatsExport {...statsData} />).toBlob();
      } catch (e) {
        throw e;
      }

      break;
    case "offerStatistics":
      const { StatsExport } = await import("../components/StatsExport");

      const offerStatsData: StatsExportProps = JSON.parse(props);

      try {
        blob = await pdf(<StatsExport {...offerStatsData} />).toBlob();
      } catch (e) {
        throw e;
      }

      break;
    case "catalogForBuyers":
      const { CatalogueExportForBuyers } = await import(
        "../components/CatalogueExportForBuyers"
      );

      const data: CatalogueExportForBuyersProps = JSON.parse(props);

      try {
        blob = await pdf(<CatalogueExportForBuyers {...data} />).toBlob();
      } catch (e) {
        throw e;
      }

      break;
    case "catalogWithPrices":
      const { CatalogueExportWithPrices } = await import(
        "../components/CatalogueExportWithPrices"
      );

      const dataPrices: CatalogueExportWithPricesProps = JSON.parse(props);

      try {
        blob = await pdf(
          <CatalogueExportWithPrices {...dataPrices} />
        ).toBlob();
      } catch (e) {
        throw e;
      }

      break;
    case "sellerPieces":
      const { SellerPiecesExport } = await import(
        "../components/SellerPiecesExport"
      );

      const dataSellerPieces: SellerPiecesExportProps = JSON.parse(props);

      try {
        blob = await pdf(<SellerPiecesExport {...dataSellerPieces} />).toBlob();
      } catch (e) {
        throw e;
      }

      break;
    case "soldPieces":
      const { SoldPiecesExport } = await import(
        "../components/SoldPiecesExport"
      );

      const dataSoldPieces: SoldPiecesExportProps = JSON.parse(props);

      try {
        blob = await pdf(<SoldPiecesExport {...dataSoldPieces} />).toBlob();
      } catch (e) {
        throw e;
      }

      break;
    case "boughtPieces":
      const { BoughtPiecesExport } = await import(
        "../components/BoughtPiecesExport"
      );

      const dataBoughtPieces: BoughtPiecesExportProps = JSON.parse(props);

      try {
        blob = await pdf(<BoughtPiecesExport {...dataBoughtPieces} />).toBlob();
      } catch (e) {
        throw e;
      }

      break;
    case "boughtPiecesPreview":
      const { BoughtPiecesPreviewExport } = await import(
        "../components/BoughtPiecesPreviewExport"
      );

      const dataBoughtPiecesPreview: BoughtPiecesPreviewExportProps =
        JSON.parse(props);

      try {
        blob = await pdf(
          <BoughtPiecesPreviewExport {...dataBoughtPiecesPreview} />
        ).toBlob();
      } catch (e) {
        throw e;
      }

      break;
    case "statisticsForBuyers":
      const { StatsForBuyersExport } = await import(
        "../components/StatsForBuyersExport"
      );

      const statsForBuyersData: StatsForBuyersExportProps = JSON.parse(props);

      try {
        blob = await pdf(
          <StatsForBuyersExport {...statsForBuyersData} />
        ).toBlob();
      } catch (e) {
        throw e;
      }

      break;
    case "treeSpecies":
      const { TreeSpeciesExport } = await import(
        "../components/TreeSpeciesExport"
      );

      const treeSpeciesData: TreeSpeciesExportProps = JSON.parse(props);

      try {
        blob = await pdf(
          <TreeSpeciesExport {...treeSpeciesData} />
        ).toBlob();
      } catch (e) {
        throw e;
      }

      break;
  }

  // Convert Blob to ArrayBuffer
  const arrayBuffer = await blob.arrayBuffer();

  const uint8Array = new Uint8Array(arrayBuffer);

  return uint8Array;
};

const onProgress = (cb: typeof info) => {
  log = cb;
};

expose({ renderPDFInWorker: renderPDFInWorker, onProgress });

export type WorkerType = {
  renderPDFInWorker: typeof renderPDFInWorker;
  onProgress: typeof onProgress;
};
