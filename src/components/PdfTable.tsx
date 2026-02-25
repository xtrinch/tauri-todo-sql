import { StyleSheet, Text, View } from "@react-pdf/renderer";
import { compact, isNaN } from "lodash";
import { useMemo } from "react";

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

  const headerCellStyles = useMemo(
    () =>
      columns.map((col, idx) =>
        compact([
          styles.tableColHeaderStyle,
          idx == 0 ? styles.firstTableColHeaderStyle : null,
          {
            width: `${col.size}%`,
            fontWeight: col.bold ? "bold" : undefined,
          },
        ])
      ),
    [columns]
  );

  const dataCellStyles = useMemo(
    () =>
      columns.map((col, idx) =>
        compact([
          styles.tableColStyle,
          idx == 0 ? styles.firstTableColStyle : null,
          { width: `${col.size}%` },
        ])
      ),
    [columns]
  );

  const footerCellStyles = useMemo(
    () =>
      columns.map((col, idx) =>
        compact([
          styles.tableColFooterStyle,
          idx == 0 ? styles.firstTableColFooterStyle : null,
          {
            width: `${col.size}%`,
            fontWeight: col.bold ? "bold" : undefined,
          },
        ])
      ),
    [columns]
  );

  const formattedRows = useMemo(
    () => params.data.map((piece) => columns.map((col) => getValue(col, piece))),
    [params.data, columns]
  );

  return (
    <View style={styles.tableStyle}>
      <View
        style={styles.tableRowStyle}
        fixed={!params.hideHeaderOnSubsequentPages}
      >
        {columns.map((col, idx) => (
          <View style={headerCellStyles[idx]} key={idx}>
            {col.header && <Text>{col.header()}</Text>}
          </View>
        ))}
      </View>
      {formattedRows.map((cells, index) => (
        <View style={styles.tableRowStyle} wrap={false} key={index}>
          {cells.map((cellValue, idx) => (
            <View style={dataCellStyles[idx]} key={idx}>
              <Text>{cellValue}</Text>
            </View>
          ))}
        </View>
      ))}
      {hasFooter && (
        <View style={styles.tableRowStyle}>
          {columns.map((col, idx) => (
            <View style={footerCellStyles[idx]} key={idx}>
              {col.footer && <>{col.footer(params.data)}</>}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
