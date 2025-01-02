import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { compact } from "lodash";

const styles = StyleSheet.create({
  tableColStyle: {
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
    borderStyle: "solid",
    borderColor: "#000",
    borderBottomColor: "#000",
    borderWidth: 1,
    borderLeftWidth: 1,
    backgroundColor: "#bdbdbd",
  },
  firstTableColStyle: {
    borderStyle: "solid",
    borderColor: "#000",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderTopWidth: 0,
  },
  tableColHeaderStyle: {
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
});

export interface PdfTableCol {
  accessorKey: string;
  header?: () => string;
  size: number;
  meta?: { type?: string };
  bold?: boolean;
}

export const PdfTable = (params: { columns: PdfTableCol[]; data: any[] }) => {
  const { columns } = params;
  return (
    <View style={styles.tableStyle}>
      <View style={styles.tableRowStyle} fixed>
        {columns.map((col, idx) => (
          <View
            style={compact([
              styles.tableColHeaderStyle,
              idx == 0 ? styles.firstTableColHeaderStyle : null,
              {
                width: `${col.size}%`,
                fontWeight: col.bold ? "bold" : undefined,
              },
            ])}
          >
            {col.header && <Text>{col.header()}</Text>}
          </View>
        ))}
      </View>
      {params.data.map((piece) => (
        <View style={styles.tableRowStyle}>
          {columns.map((col, idx) => (
            <View
              style={compact([
                styles.tableColStyle,
                idx == 0 ? styles.firstTableColStyle : null,
                { width: `${col.size}%` },
              ])}
            >
              <Text>
                {col.meta?.type === "float"
                  ? parseFloat((piece as any)[col.accessorKey]).toFixed(2)
                  : (piece as any)[col.accessorKey]}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};
