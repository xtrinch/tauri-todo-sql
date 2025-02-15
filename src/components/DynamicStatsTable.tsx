import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CustomTable } from "../components/CustomTable";
import { TableCellReadonly } from "../components/TableCellReadonly";
import { WoodPiece } from "../utils/woodPieceService";

export function DynamicStatsTable(props: {
  woodPieces: WoodPiece[];
  woodPiecesTotal: WoodPiece[];
  title: string;
  volume: number;
}) {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<unknown, any>[]>(
    () => [
      {
        accessorKey: "sequence_no",
        size: 80,
        header: () => `${t("seqNo")}`,
      },
      {
        accessorKey: "offered_price",
        size: 120,
        header: () => `${t("offeredPrice")} (EUR / m3)`,
      },
      {
        accessorKey: "buyer_name",
        size: 200,
        header: () => `${t("buyer")}`,
      },
    ],
    []
  );

  const columns1 = useMemo<ColumnDef<unknown, any>[]>(
    () => [
      {
        accessorKey: "sequence_no",
        size: 80,
        header: () => `${t("seqNo")}`,
      },
      {
        accessorKey: "total_price",
        size: 120,
        header: () => `${t("totalPrice")} (EUR)`,
      },
      {
        accessorKey: "offered_price",
        size: 120,
        header: () => `${t("offeredPrice")} (EUR / m3)`,
      },
      {
        accessorKey: "buyer_name",
        size: 200,
        header: () => `${t("buyer")}`,
      },
    ],
    []
  );

  const table = useReactTable({
    data: props.woodPieces,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCellReadonly,
    },
    meta: {},
  });

  const table1 = useReactTable({
    data: props.woodPiecesTotal,
    columns: columns1,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCellReadonly,
    },
    meta: {},
  });
  return (
    <>
      <div className="text-xl font-bold">{props.title}</div>
      <div>
        {t("totalVolume")}: {props.volume || 0} m3
      </div>
      <div className="flex flex-row space-x-20">
        <div className="flex flex-col space-y-3">
          <div className="font-bold">{t("topThreeOffersPerVolumePrice")}</div>
          <CustomTable
            sizeEstimate={45}
            table={table}
            trClassName="border-b"
            trhClassName="border-b"
            containerClassName="!overflow-visible"
          />
        </div>
        <div className="flex flex-col space-y-3">
          <div className="font-bold">{t("topThreeOffersPerTotalPrice")}</div>
          <CustomTable
            sizeEstimate={45}
            table={table1}
            trClassName="border-b"
            trhClassName="border-b"
            containerClassName="!overflow-visible"
          />
        </div>
      </div>
    </>
  );
}
