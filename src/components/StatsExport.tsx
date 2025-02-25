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
  header: {
    fontSize: 24,
    marginBottom: 15,
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
  statistics: {
    fontSize: 12,
    height: 100,
  },
  statisticsHeader: {
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
  overallData: { label: string; value: string; unit: string; bold?: boolean }[];
}

export const StatsExport = (params: StatsExportProps) => {
  const { t } = useTranslation();

  const columnsOverall = useMemo<PdfTableCol[]>(
    () => [
      {
        accessorKey: "label",
        size: 70,
        header: () => t("summary"),
      },
      {
        accessorKey: "value",
        size: 20,
        header: () => t("value"),
      },
      {
        accessorKey: "unit",
        size: 14,
        header: () => t("unit"),
      },
    ],
    []
  );

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
        <View style={styles.statView}>
          <View style={styles.statView} wrap={false}>
            <View style={styles.subheader}>
              <Text>{t("statistics")}</Text>
            </View>
            <PdfTable data={params.overallData} columns={columnsOverall} />
          </View>
          <View style={styles.subheader}>
            <Text>{t("topThreeOffers")}</Text>
          </View>
          {params.statistics.top_logs?.top_logs_total?.length > 0 && (
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
          {params.statistics.top_logs?.top_logs_per_volume?.length > 0 && (
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
        {params.statistics.top_logs_by_species?.map((ts) => (
          <>
            {ts.top_logs_per_volume?.length > 0 &&
              ts.top_logs_total?.length > 0 && (
                <View style={styles.statView}>
                  <View style={styles.subheader}>
                    <Text>{ts.tree_species_name}</Text>
                  </View>
                  {ts.top_logs_per_volume?.length > 0 && (
                    <View style={styles.statsTable} wrap={false}>
                      <View style={styles.subsubheader}>
                        <Text>{t("topThreeOffersPerTotalPrice")}</Text>
                      </View>
                      <PdfTable
                        columns={columnsTopThreePerSpecies}
                        key={ts.id}
                        data={ts.top_logs_per_volume || []}
                      />
                    </View>
                  )}
                  {ts.top_logs_total?.length > 0 && (
                    <View style={styles.statsTable} wrap={false}>
                      <View style={styles.subsubheader}>
                        <Text>{t("topThreeOffersPerVolumePrice")}</Text>
                      </View>
                      <PdfTable
                        columns={columnsTopThreePerSpecies}
                        key={ts.id}
                        data={ts.top_logs_total || []}
                      />
                    </View>
                  )}
                </View>
              )}
          </>
        ))}
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
