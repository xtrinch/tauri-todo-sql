import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { useTranslation } from "react-i18next";
import { WoodPiece } from "../utils/woodPieceService";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
    padding: 10,
    fontSize: 12,
  },
  tableColStyle: {
    width: "15%",
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  tableRowStyle: {
    flexDirection: "row",
  },
  tableStyle: {
    width: "auto",
  },
  firstTableColHeaderStyle: {
    width: "10%",
    borderStyle: "solid",
    borderColor: "#000",
    borderBottomColor: "#000",
    borderWidth: 1,
    borderLeftWidth: 1,
    backgroundColor: "#bdbdbd",
  },
  firstTableColStyle: {
    width: "10%",
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderTopWidth: 0,
  },
  tableColHeaderStyle: {
    width: "15%",
    borderStyle: "solid",
    borderColor: "#000",
    borderBottomColor: "#000",
    borderWidth: 1,
    borderLeftWidth: 0,
    backgroundColor: "#bdbdbd",
  },
  tableCellHeaderStyle: {
    paddingVertical: 4,
    paddingHorizontal: 2,
    fontSize: 11,
    fontWeight: "bold",
  },
  doubleCol: {
    width: "30%",
  },
});

// Create Document Component
export const CatalogueExport = (params: { woodPiecesData: WoodPiece[] }) => {
  const { t } = useTranslation();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.tableStyle}>
          <View style={styles.tableRowStyle} fixed>
            <View
              style={[
                styles.tableColHeaderStyle,
                styles.firstTableColHeaderStyle,
              ]}
            >
              <Text style={styles.tableCellHeaderStyle}>{t("seqNo")}</Text>
            </View>
            <View style={styles.tableColHeaderStyle}>
              <Text style={styles.tableCellHeaderStyle}>{t("plateNo")}</Text>
            </View>
            <View style={[styles.tableColHeaderStyle, styles.doubleCol]}>
              <Text style={styles.tableCellHeaderStyle}>
                {t("treeSpecies")}
              </Text>
            </View>
            <View style={styles.tableColHeaderStyle}>
              <Text style={styles.tableCellHeaderStyle}>{t("widthCm")}</Text>
            </View>
            <View style={styles.tableColHeaderStyle}>
              <Text style={styles.tableCellHeaderStyle}>{t("lengthM")}</Text>
            </View>
            <View style={styles.tableColHeaderStyle}>
              <Text style={styles.tableCellHeaderStyle}>{t("volumeM3")}</Text>
            </View>
            <View style={styles.tableColHeaderStyle}>
              <Text style={styles.tableCellHeaderStyle}>
                {t("sellerIdent")}
              </Text>
            </View>
          </View>
          {params.woodPiecesData.map((woodPiece) => (
            <>
              <View style={styles.tableRowStyle}>
                <View style={[styles.tableColStyle, styles.firstTableColStyle]}>
                  <Text>{woodPiece.sequence_no}</Text>
                </View>
                <View style={styles.tableColStyle}>
                  <Text>{woodPiece.plate_no}</Text>
                </View>
                <View style={[styles.tableColStyle, styles.doubleCol]}>
                  <Text>{woodPiece.tree_species_name}</Text>
                </View>
                <View style={styles.tableColStyle}>
                  <Text>{woodPiece.width} cm</Text>
                </View>
                <View style={styles.tableColStyle}>
                  <Text>{woodPiece.length} m</Text>
                </View>
                <View style={styles.tableColStyle}>
                  <Text>{woodPiece.volume} m3</Text>
                </View>
                <View style={styles.tableColStyle}>
                  <Text>{woodPiece.ident}</Text>
                </View>
              </View>
            </>
          ))}
        </View>
      </Page>
    </Document>
  );
};
