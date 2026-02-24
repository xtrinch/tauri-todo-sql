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

export const TableCellCheckboxReadonly = <TableItem,>({
  getValue,
}: {
  getValue: Getter<unknown>;
  row: Row<TableItem>;
  column: Column<TableItem>;
  table: Table<TableItem>;
}) => {
  const initialValue = getValue();
  const isChecked = initialValue === 1 || initialValue === true;

  return (
    <div className="w-full flex px-1">
      <label className="inline-flex cursor-default">
        <input
          type="checkbox"
          checked={isChecked}
          className="peer sr-only"
          disabled={true}
        />
        <span
          className={`flex h-5 w-5 select-none items-center justify-center rounded border transition-colors peer-disabled:opacity-70 ${
            isChecked ? "border-blue-600 bg-blue-600" : "border-gray-500 bg-white"
          }`}
        >
          {isChecked && (
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
