import {
  Column,
  ColumnMeta,
  Getter,
  Row,
  Table,
  TableMeta,
} from "@tanstack/react-table";

export interface CustomColumnMeta extends ColumnMeta<{}, undefined> {
  type?: string;
  readonly?: boolean;
}
export interface CustomTableMeta extends TableMeta<{}> {
  onAdd?: () => void;
  onRemove?: (id: number) => void;
  onEdit: (data: Partial<{}>) => void;
}

export const TableCellReadonly = <TableItem,>({
  getValue,
  column,
  shouldBeRed,
  row,
}: {
  getValue: Getter<unknown>;
  row: Row<TableItem>;
  column: Column<TableItem>;
  table: Table<TableItem>;
  shouldBeRed?: (row: Row<TableItem>) => boolean;
}) => {
  const initialValue = getValue() as string;
  const columnMeta = column.columnDef.meta as CustomColumnMeta;

  const getFormattedVal = (val: any) => {
    if (columnMeta?.type === "float") {
      val = parseFloat(val as string).toFixed(2);
      if (isNaN(val as number)) {
        val = 0;
      }
    }
    if (columnMeta?.type === "integer") {
      val = parseInt(val as string);
      if (isNaN(val as number)) {
        val = 0;
      }
    }

    return val;
  };

  return (
    <div
      className="text-base h-full min-h-full"
      style={{
        color: shouldBeRed?.(row) ? "white" : undefined,
        fontWeight: shouldBeRed?.(row) ? "bold" : undefined,
        backgroundColor: shouldBeRed?.(row) ? "red" : undefined,
        paddingLeft: shouldBeRed?.(row) ? 3 : undefined,
      }}
    >
      {getFormattedVal(initialValue) || ""}
    </div>
  );
};
