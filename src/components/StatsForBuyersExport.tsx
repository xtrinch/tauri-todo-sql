import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { BuyersStatistics } from "../utils/statsForBuyersService";
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

export interface StatsForBuyersExportProps {
  statistics: BuyersStatistics;
  limit: number;
}

export const StatsForBuyersExport = (params: StatsForBuyersExportProps) => {
  const { t } = useTranslation();

  const columns = useMemo<PdfTableCol[]>(
    () => [
      {
        accessorKey: "sequence_no",
        header: () => t("seqNo"),
        size: 12,
      },
      {
        accessorKey: "plate_no",
        header: () => t("plateNo"),
        size: 18,
      },
      {
        accessorKey: "width",
        header: () => t("widthCm"),
        size: 12,
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "length",
        header: () => t("lengthM"),
        size: 12,
        meta: {
          type: "float",
          decimalPlaces: 1,
        },
      },
      {
        accessorKey: "volume",
        header: () => t("volumeM3"),
        size: 12,
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
          <View style={styles.header}>
            <Text>{t("statisticsForBuyers")}</Text>
          </View>
          <View style={styles.subheader}>
            <Text>
              {t("topPiecesByThickness")} (N = {params.limit})
            </Text>
          </View>
          {params.statistics.top_pieces_by_species.map((ts) => (
            <View key={ts.id} style={styles.statView} wrap={false}>
              <View style={styles.subheader}>
                <Text>{ts.tree_species_name}</Text>
              </View>
              <View style={styles.statsTable}>
                <PdfTable
                  data={ts.top_pieces_by_thickness || []}
                  columns={columns}
                />
              </View>
            </View>
          ))}
        </View>
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
