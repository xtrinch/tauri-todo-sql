import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import font from "../assets/fonts/Roboto-Regular.ttf";
import { Buyer } from "../utils/buyerService";
import { WoodPiece } from "../utils/woodPieceService";
import { PdfTable, PdfTableCol } from "./PdfTable";

Font.register({ family: "Roboto", src: font });

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: "30px",
    fontSize: 12,
  },
  header: {
    fontSize: 24,
    marginBottom: 15,
    fontWeight: "bold",
  },
  address: {
    fontSize: 14,
    marginBottom: 14,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  topTable: {
    marginBottom: 15,
  },
  middleTable: {
    marginBottom: 15,
  },
  bottomTable: {
    marginBottom: 15,
  },
});

export interface BoughtPiecesExportProps {
  buyer: Buyer;
  woodPiecesData: WoodPiece[];
  woodPiecesGroupedData: WoodPiece[];
  rowsSummary: { label: string; value: string; bold?: boolean }[];
  colsSummary: PdfTableCol[];
}

export const BoughtPiecesExport = (params: BoughtPiecesExportProps) => {
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
          type: "integer",
        },
      },
      {
        accessorKey: "length",
        header: () => t("lengthM"),
        size: 15,
        meta: {
          type: "float",
          decimalPlaces: 1,
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
        accessorKey: "offered_price",
        header: () => t("offeredPrice"),
        size: 20,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "offered_total_price",
        header: () => t("totalPriceM3"),
        size: 20,
        meta: {
          type: "float",
        },
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
        <View style={styles.header}>
          <Text>{t("boughtPieces")}</Text>
        </View>
        <View style={styles.address}>
          <Text style={styles.addressName}>{params.buyer.buyer_name}</Text>
          <Text>
            {params.buyer.address_line1}, {params.buyer.address_line2}
          </Text>
        </View>
        <View style={styles.topTable}>
          <PdfTable data={params.woodPiecesData} columns={columns} />
        </View>
        <View style={styles.middleTable} wrap={false}>
          <PdfTable
            data={params.woodPiecesGroupedData}
            columns={columnsGrouped}
          />
        </View>
        <View style={styles.bottomTable} wrap={false}>
          <PdfTable data={params.rowsSummary} columns={params.colsSummary} />
        </View>
      </Page>
    </Document>
  );
};
