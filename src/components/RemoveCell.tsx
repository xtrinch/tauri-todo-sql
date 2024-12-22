import { Row, Table } from "@tanstack/react-table";
import { CustomTableMeta } from "./TableCell";

export const RemoveCell = <TableItem,>({
  row,
  table,
}: {
  row: Row<TableItem>;
  table: Table<TableItem>;
}) => {
  const meta = table.options.meta;

  const removeRow = () => {
    const onRemove = (meta as CustomTableMeta)?.onRemove;
    if (onRemove) {
      onRemove((row.original as { id: number }).id);
    }
  };

  return (
    <div className="edit-cell-container">
      <button
        onClick={removeRow}
        name="remove"
        tabIndex={-1}
        className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50 w-10 h-10"
      >
        X
      </button>
    </div>
  );
};
