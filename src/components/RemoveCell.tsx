import { Row, Table } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { FaX } from "react-icons/fa6";
import { CustomTableMeta } from "./TableCell";

export const RemoveCell = <TableItem,>({
  row,
  table,
}: {
  row: Row<TableItem>;
  table: Table<TableItem>;
}) => {
  const meta = table.options.meta;
  const { t } = useTranslation();

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
        className="bg-red-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 w-10 h-10 flex justify-center items-center text-xl"
        title={t("remove")}
      >
        <FaX />
      </button>
    </div>
  );
};
