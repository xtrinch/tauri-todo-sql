import {
  Column,
  ColumnMeta,
  Getter,
  Row,
  Table,
  TableMeta,
} from "@tanstack/react-table";
import { useEffect, useState } from "react";

export interface CustomColumnMeta extends ColumnMeta<{}, undefined> {
  type?: string;
  readonly?: boolean;
}
export interface CustomTableMeta extends TableMeta<{}> {
  onAdd?: () => {};
  onRemove?: (id: number) => {};
  onEdit: (data: Partial<{}>) => {};
}

export const TableCell = <TableItem,>({
  getValue,
  row,
  column,
  table,
}: {
  getValue: Getter<unknown>;
  row: Row<TableItem>;
  column: Column<TableItem>;
  table: Table<TableItem>;
}) => {
  const initialValue = getValue();
  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);
  const meta = table.options.meta;

  const getFormattedVal = (val: any) => {
    if ((column.columnDef.meta as CustomColumnMeta)?.type === "float") {
      val = parseFloat(val as string);
      if (isNaN(val as number)) {
        val = 0;
      }
    }

    return val;
  };
  // When the input is blurred, we'll call our table meta's updateData function
  const onBlur = () => {
    if ((column.columnDef.meta as CustomColumnMeta)?.readonly) {
      return;
    }
    const val = getFormattedVal(value);
    (meta as CustomTableMeta)?.onEdit({
      id: (row.original as { id: number }).id,
      [column.id]: val,
    });
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(getFormattedVal(initialValue));
  }, [initialValue]);

  return (
    <input
      value={value as string}
      className="bg-green h-10"
      onChange={(e) => setValue(e.target.value)}
      onBlur={onBlur}
      readOnly={(column.columnDef.meta as CustomColumnMeta)?.readonly}
      tabIndex={
        (column.columnDef.meta as CustomColumnMeta)?.readonly ? -1 : undefined
      }
    />
  );
};
