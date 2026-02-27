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
import headerImage from "../assets/images/header-image.png";
import woodImage from "../assets/images/wood-image.jpg";
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
    paddingLeft: "30px",
  },
  header: {
    fontSize: 24,
    marginBottom: 30,
    fontWeight: "bold",
  },
  subheader: {
    fontSize: 16,
    marginTop: 100,
  },
  image: {
    width: 450,
    height: 120,
    maxHeight: 120,
    objectFit: "contain",
    marginBottom: 60,
    marginLeft: "auto",
    marginRight: "auto",
  },
  woodImage: {
    width: "100%",
    height: 220,
    maxHeight: 220,
    objectFit: "contain",
    marginBottom: 20,
    marginLeft: "auto",
    marginRight: "auto",
  },
  statistics: {
    fontSize: 12,
    height: 100,
  },
  buyerInput: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statisticsHeader: {
    fontSize: 14,
    marginBottom: 5,
  },
  pageNumbers: {
    marginTop: 5,
  },
});

export interface CatalogueExportForBuyersProps {
  woodPiecesData: WoodPiece[];
  statistics: Statistics;
  headerImageSrc?: string;
  woodImageSrc?: string;
}

export const CatalogueExportForBuyers = (
  params: CatalogueExportForBuyersProps
) => {
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
        accessorKey: "buyer_ident",
        header: () => t("buyerIdent"),
        size: 20,
      },
      {
        accessorKey: "no_key",
        header: () => `${t("offeredPriceM3")} (EUR)`,
        size: 20,
      },
    ],
    []
  );

  return (
    <Document>
      <Page size="A4" style={{ ...styles.page, ...styles.firstPage }}>
        <View>
          <Image src={params.headerImageSrc || headerImage} style={styles.image} />
        </View>
        <View style={styles.header}>
          <Text>{t("catalogueTitle")}</Text>
        </View>
        <View>
          <Image src={params.woodImageSrc || woodImage} style={styles.woodImage} />
        </View>
        <View style={styles.header}>
          <Text>{t("sellingCatalogue")}</Text>
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
              {t("totalVolume")}: {params.statistics.total_volume.toFixed(2)} m3
            </Text>
          </View>
        </View>
        <View style={styles.buyerInput}>
          <Text>{t("companyName")}:</Text>
          <Text>{t("address")}:</Text>
          <Text>{t("stamp")}:</Text>
          <Text>{t("signature")}:</Text>
        </View>
        <View style={styles.subheader}>
          <Text>{t("catalogueSubtext")}</Text>
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        <View>
          <PdfTable data={params.woodPiecesData} columns={columns} />
        </View>
        <Text
          render={({ pageNumber, totalPages }) =>
            `${pageNumber - 1} / ${totalPages - 1}`
          }
          fixed
          style={styles.pageNumbers}
        />
      </Page>
    </Document>
  );
};
