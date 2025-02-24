import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { compact, isNaN } from "lodash";

const styles = StyleSheet.create({
  tableColStyle: {
    borderStyle: "solid",
    borderColor: "#3f3f3f",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    paddingVertical: 4,
    paddingHorizontal: 3,
  },
  tableRowStyle: {
    flexDirection: "row",
  },
  tableStyle: {
    width: "auto",
  },
  firstTableColHeaderStyle: {
    borderStyle: "solid",
    borderColor: "#3f3f3f",
    borderWidth: 1,
    borderLeftWidth: 1,
    backgroundColor: "#bdbdbd",
  },
  firstTableColStyle: {
    borderStyle: "solid",
    borderColor: "#3f3f3f",
    borderWidth: 1,
    borderLeftWidth: 1,
    borderTopWidth: 0,
  },
  tableColHeaderStyle: {
    borderStyle: "solid",
    borderColor: "#3f3f3f",
    borderWidth: 1,
    borderLeftWidth: 0,
    backgroundColor: "#bdbdbd",
    paddingVertical: 4,
    paddingHorizontal: 3,
    fontSize: 11,
  },
  tableColFooterStyle: {
    borderStyle: "solid",
    borderColor: "#3f3f3f",
    borderWidth: 1,
    borderLeftWidth: 0,
    backgroundColor: "#bdbdbd",
    paddingVertical: 4,
    paddingHorizontal: 3,
    fontSize: 11,
    borderTopWidth: 0,
  },
  firstTableColFooterStyle: {
    borderStyle: "solid",
    borderColor: "#3f3f3f",
    borderWidth: 1,
    borderLeftWidth: 1,
    backgroundColor: "#bdbdbd",
    borderTopWidth: 0,
  },
});

export interface PdfTableCol {
  accessorKey: string;
  header?: () => string;
  size: number;
  meta?: { type?: string };
  bold?: boolean;
  footer?: (data: any[]) => JSX.Element;
}

export const PdfTable = (params: {
  columns: PdfTableCol[];
  data: any[];
  hasFooter?: boolean;
  hideHeaderOnSubsequentPages?: boolean;
}) => {
  const { columns, hasFooter } = params;

  const getValue = (col: PdfTableCol, piece: any) => {
    let val = (piece as any)[col.accessorKey];

    if (col.meta?.type === "float") {
      if (val) {
        val = parseFloat(val).toFixed(2);
        if (isNaN(val)) {
          val = "";
        }
      }
    }

    return val;
  };

  return (
    <View style={styles.tableStyle}>
      <View
        style={styles.tableRowStyle}
        fixed={!params.hideHeaderOnSubsequentPages}
      >
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
            key={idx}
          >
            {col.header && <Text>{col.header()}</Text>}
          </View>
        ))}
      </View>
      {params.data.map((piece, index) => (
        <View style={styles.tableRowStyle} wrap={false} key={index}>
          {columns.map((col, idx) => (
            <View
              style={compact([
                styles.tableColStyle,
                idx == 0 ? styles.firstTableColStyle : null,
                { width: `${col.size}%` },
              ])}
              key={idx}
            >
              <Text>{getValue(col, piece)}</Text>
            </View>
          ))}
        </View>
      ))}
      {hasFooter && (
        <View style={styles.tableRowStyle}>
          {columns.map((col, idx) => (
            <View
              style={compact([
                styles.tableColFooterStyle,
                idx == 0 ? styles.firstTableColFooterStyle : null,
                {
                  width: `${col.size}%`,
                  fontWeight: col.bold ? "bold" : undefined,
                },
              ])}
              key={idx}
            >
              {col.footer && <>{col.footer(params.data)}</>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
