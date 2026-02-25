import { Table } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { FaPlus } from "react-icons/fa6";
import { CustomTableMeta } from "./TableCell";

export const FooterAddCell = <TableItem,>({
  table,
}: {
  table: Table<TableItem>;
}) => {
  const { t } = useTranslation();
  const meta = table.options.meta;
  return (
    <div className="footer-buttons">
      <button
        className=" bg-green-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 w-10 h-10 text-2xl flex items-center justify-center"
        onClick={(meta as CustomTableMeta)?.onAdd}
        title={t("addNew")}
        aria-label={t("addNew")}
      >
        <FaPlus />
      </button>
    </div>
  );
};
