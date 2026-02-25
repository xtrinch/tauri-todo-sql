import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Statistics } from "../utils/statsService";
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
  title: {
    fontSize: 20,
    marginBottom: 14,
    fontWeight: "bold",
  },
  subheader: {
    fontSize: 16,
    marginBottom: 10,
  },
  subsubheader: {
    fontSize: 14,
    marginBottom: 5,
  },
  statsTable: {
    marginBottom: 10,
  },
  statView: {
    marginBottom: 15,
  },
  pageNumbers: {
    position: "absolute",
    bottom: "30px",
    left: "95px",
    right: 0,
  },
});

export interface StatsExportProps {
  statistics: Statistics;
}

export const StatsExport = (params: StatsExportProps) => {
  const { t } = useTranslation();

  const columnsTopThreeAllSpecies = useMemo<PdfTableCol[]>(
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
        accessorKey: "offered_price",
        header: () => t("offeredPriceM3"),
        size: 15,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "offered_total_price",
        header: () => t("totalPriceM3"),
        size: 15,
        meta: {
          type: "float",
        },
      },
    ],
    []
  );

  const columnsTopThreePerSpecies = useMemo<PdfTableCol[]>(
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
        accessorKey: "offered_price",
        header: () => t("offeredPriceM3"),
        size: 15,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "offered_total_price",
        header: () => t("totalPriceM3"),
        size: 15,
        meta: {
          type: "float",
        },
      },
    ],
    []
  );

  return (
    <Document>
      <Page size="A4" style={styles.page} break={true}>
        <View style={styles.title}>
          <Text>{t("offerStatistics")}</Text>
        </View>
        <View style={styles.statView}>
          <View style={styles.subheader}>
            <Text>{t("topThreeOffers")}</Text>
          </View>
          {params.statistics.top_logs?.top_logs_total?.length && (
            <View style={styles.statsTable} wrap={false}>
              <View style={styles.subsubheader}>
                <Text> {t("topThreeOffersPerTotalPrice")}</Text>
              </View>
              <PdfTable
                data={params.statistics.top_logs?.top_logs_total}
                columns={columnsTopThreeAllSpecies}
              />
            </View>
          )}
          {params.statistics.top_logs?.top_logs_per_volume?.length && (
            <View style={styles.statsTable} wrap={false}>
              <View style={styles.subsubheader}>
                <Text>{t("topThreeOffersPerVolumePrice")}</Text>
              </View>
              <PdfTable
                data={params.statistics.top_logs?.top_logs_per_volume}
                columns={columnsTopThreeAllSpecies}
              />
            </View>
          )}
        </View>
        {params.statistics.top_logs_by_species?.map((ts) => {
          if (!ts.top_logs_per_volume?.length && !ts.top_logs_total?.length) {
            return null;
          }

          return (
            <View key={ts.id} style={styles.statView}>
              <View style={styles.subheader}>
                <Text>{ts.tree_species_name}</Text>
              </View>
              {(ts.top_logs_per_volume?.length || 0) > 0 && (
                <View style={styles.statsTable} wrap={false}>
                  <View style={styles.subsubheader}>
                    <Text>{t("topThreeOffersPerVolumePrice")}</Text>
                  </View>
                  <PdfTable
                    columns={columnsTopThreePerSpecies}
                    data={ts.top_logs_per_volume || []}
                  />
                </View>
              )}
              {(ts.top_logs_total?.length || 0) > 0 && (
                <View style={styles.statsTable} wrap={false}>
                  <View style={styles.subsubheader}>
                    <Text>{t("topThreeOffersPerTotalPrice")}</Text>
                  </View>
                  <PdfTable
                    columns={columnsTopThreePerSpecies}
                    data={ts.top_logs_total || []}
                  />
                </View>
              )}
            </View>
          );
        })}
        <Text
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
          style={styles.pageNumbers}
        />
      </Page>
    </Document>
  );
};
