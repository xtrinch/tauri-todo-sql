import { Document, Font, Page, StyleSheet, View } from "@react-pdf/renderer";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import font from "../assets/fonts/Roboto-Regular.ttf";
import { WoodPiece } from "../utils/woodPieceService";
import { PdfTable, PdfTableCol } from "./PdfTable";

Font.register({ family: "Roboto", src: font });

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    flexDirection: "column",
    backgroundColor: "#E4E4E4",
    padding: 10,
    fontSize: 12,
  },
});

export const BoughtPiecesExport = (params: {
  woodPiecesData: WoodPiece[];
  woodPiecesGroupedData: WoodPiece[];
  rowsSummary: { label: string; value: string; bold?: boolean }[];
  colsSummary: PdfTableCol[];
}) => {
  const { t } = useTranslation();

  const columns = useMemo<PdfTableCol[]>(
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

  const columnsGrouped = useMemo<PdfTableCol[]>(
    () => [
      {
        accessorKey: "tree_species_name",
        header: () => t("treeSpecies"),
        size: 200,
      },
      {
        accessorKey: "volume",
        header: () => t("volumeM3"),
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "offered_total_price",
        header: () => t("totalPriceM3"),
        size: 80,
        meta: {
          type: "float",
        },
      },
    ],
    []
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View>
          <PdfTable data={params.woodPiecesData} columns={columns} />
        </View>
        <View>
          <PdfTable
            data={params.woodPiecesGroupedData}
            columns={columnsGrouped}
          />
        </View>
        <View>
          <PdfTable data={params.rowsSummary} columns={params.colsSummary} />
        </View>
      </Page>
    </Document>
  );
};
