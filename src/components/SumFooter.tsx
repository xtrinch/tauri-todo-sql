import { HeaderContext } from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const SumFooter = (params: {
  info: HeaderContext<any, unknown>;
  measure?: string;
}) => {
  const { t } = useTranslation();

  const rows = params.info.table.getFilteredRowModel().rows;
  const total = useMemo(
    () =>
      rows.reduce(
        (sum, row) => (row.getValue(params.info.column.id) as number) + sum,
        0
      ),
    [rows]
  );
  return (
    <div className="text-base">
      <div>{t("total")}:</div>{" "}
      <div>
        {total} {params.measure}
      </div>
    </div>
  );
};
