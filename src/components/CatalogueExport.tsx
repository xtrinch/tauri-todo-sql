import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { TreeSpecies } from "../utils/treeSpeciesService";
import { WoodPiece } from "../utils/woodPieceService";

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "row",
    backgroundColor: "#E4E4E4",
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  tableColStyle: {
    width: "20%",
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  tableRowStyle: {
    flexDirection: "row",
  },
  tableStyle: {
    width: "auto",
  },
});

// Create Document Component
export const CatalogueExport = (params: {
  woodPiecesData: WoodPiece[];
  treeSpeciesData: TreeSpecies[];
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.tableStyle}>
        {params.woodPiecesData.map((woodPiece) => (
          <>
            <View style={styles.tableRowStyle}>
              <View style={styles.tableColStyle}>
                <Text>{woodPiece.sequence_no}</Text>
              </View>
              <View style={styles.tableColStyle}>
                <Text>{woodPiece.length}</Text>
              </View>
              <View style={styles.tableColStyle}>
                <Text>{woodPiece.width}</Text>
              </View>
              <View style={styles.tableColStyle}>
                <Text>{woodPiece.volume}</Text>
              </View>
            </View>
          </>
        ))}
      </View>
    </Page>
  </Document>
);
