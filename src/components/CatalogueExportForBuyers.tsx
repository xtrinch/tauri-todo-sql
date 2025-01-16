import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import headerImage from "../assets/images/header-image.png"; // Import the image
import { Statistics } from "../utils/statsService";
import { WoodPiece } from "../utils/woodPieceService";
import { PdfTable, PdfTableCol } from "./PdfTable";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Roboto",
    flexDirection: "column",
    backgroundColor: "#fff",
    padding: "30px",
    paddingLeft: "95px",
    fontSize: 12,
  },
  firstPage: {
    textAlign: "center",
  },
  header: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: "bold",
  },
  subheader: {
    fontSize: 16,
    marginTop: 150,
  },
  image: {
    width: 300, // Set the width of the image
    height: "auto", // Maintain aspect ratio
    borderWidth: "2px",
    borderColor: "black",
    borderStyle: "solid",
    marginBottom: 280,
    marginLeft: "auto",
    marginRight: "auto",
  },
  statistics: {
    fontSize: 12,
    height: 100,
  },
  statisticsHeader: {
    fontSize: 14,
    marginBottom: 5,
  },
});

export const CatalogueExportForBuyers = (params: {
  woodPiecesData: WoodPiece[];
  statistics: Statistics;
}) => {
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
          type: "integer",
        },
      },
      {
        accessorKey: "length",
        header: () => t("lengthM"),
        size: 10,
        meta: {
          type: "float",
          decimalPlaces: 1,
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
        accessorKey: "no_key",
        header: () => t("offeredPriceM3"),
        size: 20,
      },
    ],
    []
  );

  return (
    <Document>
      <Page size="A4" style={{ ...styles.page, ...styles.firstPage }}>
        <View>
          <Image src={headerImage} style={styles.image} />
        </View>
        <View style={styles.header}>
          <Text>{t("catalogueTitle")}</Text>
        </View>
        <View style={styles.header}>
          <Text>{t("catalogue")}</Text>
        </View>
        <View style={styles.statistics}>
          <View style={styles.statisticsHeader}>
            <Text>{t("statistics")}</Text>
          </View>
          <View>
            <Text>
              {t("numWoodPieces")}: {params.statistics.num_wood_pieces}
            </Text>
          </View>
          <View>
            <Text>
              {t("offeredMaxPrice")}:{" "}
              {params.statistics.offered_max_price.toFixed(2)} EUR
            </Text>
          </View>
          <View>
            <Text>
              {t("totalVolume")}: {params.statistics.total_volume.toFixed(2)} m3
            </Text>
          </View>
        </View>
        <View style={styles.subheader}>
          <Text>{t("catalogueSubtext")}</Text>
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        <View>
          <PdfTable data={params.woodPiecesData} columns={columns} />
        </View>
      </Page>
    </Document>
  );
};
