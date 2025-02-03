import { info } from "@tauri-apps/plugin-log";
import { expose } from "comlink";
import { BoughtPiecesExportProps } from "../components/BoughtPiecesExport";
import { CatalogueExportForBuyersProps } from "../components/CatalogueExportForBuyers";
import { CatalogueExportWithPricesProps } from "../components/CatalogueExportWithPrices";
import { SellerPiecesExportProps } from "../components/SellerPiecesExport";
import { SoldPiecesExportProps } from "../components/SoldPiecesExport";
import { PdfTypeEnum } from "../utils/pdf";
import "./workerShim";
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
) => {
  const { pdf } = await initializeCommonPdfImports(language as "sl" | "en");

  let blob: Blob = new Blob();
  switch (type) {
    case "catalogForBuyers":
      const { CatalogueExportForBuyers } = await import(
        "../components/CatalogueExportForBuyers"
      );

      const data: CatalogueExportForBuyersProps = JSON.parse(props);

      blob = await pdf(
        <CatalogueExportForBuyers
          woodPiecesData={data.woodPiecesData}
          statistics={data.statistics}
        />
      ).toBlob();
      break;
    case "catalogWithPrices":
      const { CatalogueExportWithPrices } = await import(
        "../components/CatalogueExportWithPrices"
      );

      const dataPrices: CatalogueExportWithPricesProps = JSON.parse(props);

      blob = await pdf(
        <CatalogueExportWithPrices
          woodPiecesData={dataPrices.woodPiecesData}
          statistics={dataPrices.statistics}
        />
      ).toBlob();

      break;
    case "sellerPieces":
      const { SellerPiecesExport } = await import(
        "../components/SellerPiecesExport"
      );

      const dataSellerPieces: SellerPiecesExportProps = JSON.parse(props);

      blob = await pdf(
        <SellerPiecesExport
          woodPiecesData={dataSellerPieces.woodPiecesData}
          seller={dataSellerPieces.seller}
        />
      ).toBlob();

      break;
    case "soldPieces":
      const { SoldPiecesExport } = await import(
        "../components/SoldPiecesExport"
      );

      const dataSoldPieces: SoldPiecesExportProps = JSON.parse(props);

      blob = await pdf(
        <SoldPiecesExport
          woodPiecesData={dataSoldPieces.woodPiecesData}
          rowsSummary={dataSoldPieces.rowsSummary}
          colsSummary={dataSoldPieces.colsSummary}
          seller={dataSoldPieces.seller}
        />
      ).toBlob();

      break;
    case "boughtPieces":
      const { BoughtPiecesExport } = await import(
        "../components/BoughtPiecesExport"
      );

      const dataBoughtPieces: BoughtPiecesExportProps = JSON.parse(props);

      blob = await pdf(
        <BoughtPiecesExport
          woodPiecesData={dataBoughtPieces.woodPiecesData}
          rowsSummary={dataBoughtPieces.rowsSummary}
          colsSummary={dataBoughtPieces.colsSummary}
          buyer={dataBoughtPieces.buyer}
          woodPiecesGroupedData={dataBoughtPieces.woodPiecesGroupedData}
        />
      ).toBlob();

      break;
  }

  return blob;
};

const onProgress = (cb: typeof info) => {
  log = cb;
};

expose({ renderPDFInWorker: renderPDFInWorker, onProgress });

export type WorkerType = {
  renderPDFInWorker: typeof renderPDFInWorker;
  onProgress: typeof onProgress;
};
