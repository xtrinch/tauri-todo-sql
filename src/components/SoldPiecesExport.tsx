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
import { Seller } from "../utils/sellerService";
import { WoodPiece } from "../utils/woodPieceService";
import { PdfTable, PdfTableCol } from "./PdfTable";

Font.register({ family: "Roboto", src: font });

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    flexDirection: "column",
    backgroundColor: "#E4E4E4",
    padding: "30px",
    fontSize: 12,
  },
  topTable: {
    marginBottom: 15,
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
});

export const SoldPiecesExport = (params: {
  seller: Seller;
  woodPiecesData: WoodPiece[];
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
        <View style={styles.header}>
          <Text>{t("soldPieces")}</Text>
        </View>
        <View style={styles.address}>
          <Text style={styles.addressName}>{params.seller.seller_name}</Text>
          <Text>
            {params.seller.address_line1}, {params.seller.address_line2}
          </Text>
          <Text>{params.seller.iban}</Text>
        </View>
        <View style={styles.topTable}>
          <PdfTable data={params.woodPiecesData} columns={columns} />
        </View>
        <View>
          <PdfTable data={params.rowsSummary} columns={params.colsSummary} />
        </View>
      </Page>
    </Document>
  );
};
