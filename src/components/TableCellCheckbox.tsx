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
  onAdd?: () => void;
  onRemove?: (id: number) => void;
  onEdit: (data: Partial<{}>) => void;
}

export const TableCellCheckbox = <TableItem,>({
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
  const rowId = (row.original as { id: number }).id;
  const meta = table.options.meta;

  // We need to keep and update the state of the cell normally
  const [value, setValue] = useState(initialValue);

  const onChange = () => {
    const newValue = !value;
    setValue(newValue);
    (meta as CustomTableMeta)?.onEdit({
      id: (row.original as { id: number }).id,
      [column.id]: newValue ? 1 : 0,
    });
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue === 1 ? true : false);
  }, [initialValue, rowId]);

  return (
    <>
      <input
        type="checkbox"
        checked={value as boolean}
        onChange={onChange}
        className="scale-150"
      />
    </>
  );
};
