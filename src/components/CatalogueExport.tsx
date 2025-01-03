import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { WoodPiece } from "../utils/woodPieceService";
import { PdfTable, PdfTableCol } from "./PdfTable";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    flexDirection: "column",
    backgroundColor: "#E4E4E4",
    padding: 10,
    fontSize: 12,
  },
  header: {
    fontSize: 24,
    marginBottom: 15,
    fontWeight: "bold",
  },
  subheader: {
    fontSize: 16,
    marginBottom: 10,
  },
});

export const CatalogueExport = (params: { woodPiecesData: WoodPiece[] }) => {
  const { t } = useTranslation();

  const columns = useMemo<PdfTableCol[]>(
    () => [
      {
        accessorKey: "sequence_no",
        header: () => t("seqNo"),
        size: 9,
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
        size: 10,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "length",
        header: () => t("lengthM"),
        size: 10,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "volume",
        header: () => t("volumeM3"),
        size: 10,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "ident",
        header: () => t("sellerIdent"),
        size: 20,
      },
    ],
    []
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text>{t("catalogue")}</Text>
        </View>
        <View style={styles.subheader}>
          <Text>2024</Text>
        </View>
        <View>
          <PdfTable data={params.woodPiecesData} columns={columns} />
        </View>
      </Page>
    </Document>
  );
};
