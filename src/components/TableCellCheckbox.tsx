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
  const [value, setValue] = useState<boolean>(
    initialValue === 1 || initialValue === true
  );

  const onChange = () => {
    const newValue = !Boolean(value);
    setValue(newValue);
    (meta as CustomTableMeta)?.onEdit({
      id: (row.original as { id: number }).id,
      [column.id]: newValue ? 1 : 0,
    });
  };

  // If the initialValue is changed external, sync it up with our state
  useEffect(() => {
    setValue(initialValue === 1 || initialValue === true);
  }, [initialValue, rowId]);

  return (
    <div className="w-full flex px-1">
      <label className="inline-flex cursor-pointer">
        <input
          type="checkbox"
          checked={value}
          onChange={onChange}
          className="peer sr-only"
        />
        <span
          className={`flex h-5 w-5 select-none items-center justify-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-1 ${
            value ? "border-blue-600 bg-blue-600" : "border-gray-500 bg-white"
          }`}
        >
          {value && (
            <svg viewBox="0 0 16 16" aria-hidden="true" className="h-3 w-3 text-white">
              <path
                d="M3.5 8.25L6.4 11.15L12.5 5.05"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </label>
    </div>
  );
};
