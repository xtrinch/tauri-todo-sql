import { Document, Font, Page, StyleSheet } from "@react-pdf/renderer";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import font from "../assets/fonts/Roboto-Regular.ttf";
import { WoodPiece } from "../utils/woodPieceService";
import { PdfTable } from "./PdfTable";

Font.register({ family: "Roboto", src: font });

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
    padding: 10,
    fontSize: 12,
  },
});

export const CatalogueExport = (params: { woodPiecesData: WoodPiece[] }) => {
  const { t } = useTranslation();

  const columns = useMemo<
    {
      accessorKey: string;
      header: () => string;
      size: number;
      meta?: { type?: string };
    }[]
  >(
    () => [
      {
        accessorKey: "sequence_no",
        header: () => t("seqNo"),
        size: 10,
      },
      {
        accessorKey: "plate_no",
        header: () => t("plateNo"),
        size: 15,
      },
      {
        accessorKey: "tree_species_name",
        header: () => t("treeSpecies"),
        size: 30,
      },
      {
        accessorKey: "width",
        header: () => t("widthCm"),
        size: 15,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "length",
        header: () => t("lengthM"),
        size: 15,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "volume",
        header: () => t("volumeM3"),
        size: 15,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "ident",
        header: () => t("sellerIdent"),
        size: 15,
      },
    ],
    []
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <PdfTable data={params.woodPiecesData} columns={columns} />
      </Page>
    </Document>
  );
};
