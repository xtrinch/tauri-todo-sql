import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
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

type SummaryRow = {
  label: string;
  value: string;
  unit: string;
  bold?: boolean;
};

export interface GeneralStatsExportProps {
  totalData: SummaryRow[];
  incomeData: SummaryRow[];
  balanceData: SummaryRow[];
}

export const GeneralStatsExport = (params: GeneralStatsExportProps) => {
  const { t } = useTranslation();

  const columns = useMemo<PdfTableCol[]>(
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
    [],
  );

  return (
    <Document>
      <Page size="A4" style={styles.page} break={true}>
        <View style={styles.title}>
          <Text>{t("generalStatistics")}</Text>
        </View>
        <View style={styles.statView}>
          <View style={styles.subheader}>
            <Text>{t("total")}</Text>
          </View>
          <PdfTable data={params.totalData} columns={columns} />
        </View>
        <View style={styles.statView}>
          <View style={styles.subheader}>
            <Text>{t("incomeLicitator")}</Text>
          </View>
          <PdfTable data={params.incomeData} columns={columns} />
        </View>
        <View style={styles.statView}>
          <View style={styles.subheader}>
            <Text>{t("balance")}</Text>
          </View>
          <PdfTable data={params.balanceData} columns={columns} />
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
