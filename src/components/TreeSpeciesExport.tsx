import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TreeSpecies } from "../utils/treeSpeciesService";
import { PdfTable, PdfTableCol } from "./PdfTable";

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
  table: {
    marginBottom: 10,
  },
  pageNumbers: {
    position: "absolute",
    bottom: "30px",
    left: "30px",
    right: 0,
  },
});

export interface TreeSpeciesExportProps {
  treeSpecies: TreeSpecies[];
}

export const TreeSpeciesExport = (params: TreeSpeciesExportProps) => {
  const { t } = useTranslation();

  const columns = useMemo<PdfTableCol[]>(
    () => [
      {
        accessorKey: "sequence_no",
        header: () => t("seqNo"),
        size: 8,
      },
      {
        accessorKey: "tree_species_name_slo",
        header: () => t("sloName"),
        size: 31,
      },
      {
        accessorKey: "latin_name",
        header: () => t("latinName"),
        size: 30,
      },
      {
        accessorKey: "tree_species_name_en",
        header: () => t("englishName"),
        size: 31,
      },
    ],
    []
  );

  const dataWithSeq = params.treeSpecies.map((item, index) => ({
    ...item,
    sequence_no: index + 1,
  }));

  return (
    <Document>
      <Page size="A4" style={styles.page} break={true}>
        <View style={styles.header}>
          <Text>{t("treeSpeciesPlural")}</Text>
        </View>
        <View style={styles.table}>
          <PdfTable data={dataWithSeq} columns={columns} />
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
