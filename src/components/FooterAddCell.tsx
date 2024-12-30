import { Table } from "@tanstack/react-table";
import { FaPlus } from "react-icons/fa6";
import { CustomTableMeta } from "./TableCell";

export const FooterAddCell = <TableItem,>({
  table,
}: {
  table: Table<TableItem>;
}) => {
  const meta = table.options.meta;
  return (
    <div className="footer-buttons">
      <button
        className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50 w-10 h-10 text-2xl flex items-center justify-center"
        onClick={(meta as CustomTableMeta)?.onAdd}
      >
        <FaPlus />
      </button>
    </div>
  );
};
