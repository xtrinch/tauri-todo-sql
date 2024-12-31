import { HeaderContext } from "@tanstack/react-table";
import Big from "big.js";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export const SumFooter = (params: {
  label?: string;
  info: HeaderContext<any, unknown>;
  measure?: string;
}) => {
  const { t } = useTranslation();

  const rows = params.info.table.getFilteredRowModel().rows;
  const total = useMemo(
    () =>
      rows
        .reduce(
          (sum, row) => sum.plus(row.getValue(params.info.column.id) as number),
          new Big(0)
        )
        .round(2),
    [rows]
  );
  return (
    <div className="text-base">
      <div className="font-bold">{params.label || t("total")}:</div>{" "}
      <div>
        {total.toFixed(2)} {params.measure}
      </div>
    </div>
  );
};
