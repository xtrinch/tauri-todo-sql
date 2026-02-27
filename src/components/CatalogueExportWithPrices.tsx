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
    paddingBottom: "50px",
    fontSize: 12,
  },
  firstPage: {
    textAlign: "center",
    paddingLeft: "30px",
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
  statisticsHeader: {
    fontSize: 14,
    marginBottom: 5,
  },
  pageNumbers: {
    position: "absolute",
    bottom: "30px",
    left: "95px",
    right: 0,
  },
});

export interface CatalogueExportWithPricesProps {
  woodPiecesData: WoodPiece[];
  statistics: Statistics;
  includeSellerIdentifier?: boolean;
  headerImageSrc?: string;
  woodImageSrc?: string;
}

export const CatalogueExportWithPrices = (
  params: CatalogueExportWithPricesProps
) => {
  const { t } = useTranslation();
  const dataForExport = useMemo(
    () =>
      (params.woodPiecesData || []).map((piece) => ({
        ...piece,
        seller_ident_for_catalog:
          params.includeSellerIdentifier
            ? piece.seller_ident || piece.ident || ""
            : "",
      })),
    [params.includeSellerIdentifier, params.woodPiecesData]
  );

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
        size: 13,
      },
      {
        accessorKey: "tree_species_name",
        header: () => t("treeSpecies"),
        size: 25,
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
        accessorKey: "num_offers",
        header: () => t("numOffers"),
        size: 10,
      },
      {
        accessorKey: "offered_price",
        header: () => `${t("offeredPriceM3")} (EUR)`,
        size: 15,
        meta: {
          type: "float",
        },
      },
      ...(params.includeSellerIdentifier
        ? [
            {
              accessorKey: "seller_ident_for_catalog",
              header: () => t("sellerIdent"),
              size: 15,
            },
          ]
        : []),
    ],
    [params.includeSellerIdentifier]
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
        <View style={styles.subheader}>
          <Text>{t("catalogueSubtext")}</Text>
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        <View>
          <PdfTable data={dataForExport} columns={columns} />
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
