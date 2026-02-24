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
  volume?: number;
  includeTreeSpecies?: boolean;
  averageOfferedPrice?: number;
}) {
  const { t } = useTranslation();

  const columns = useMemo<ColumnDef<unknown, any>[]>(
    () => [
      {
        accessorKey: "sequence_no",
        size: 60,
        header: () => `${t("seqNo")}`,
      },
      ...(props.includeTreeSpecies
        ? [
            {
              accessorKey: "tree_species_name",
              header: () => t("treeSpecies"),
              size: 150,
            },
          ]
        : []),
      {
        accessorKey: "length",
        header: () => t("lengthM"),
        size: 60,
        meta: {
          type: "float",
          decimalPlaces: 1,
        },
      },
      {
        accessorKey: "width",
        header: () => t("widthCm"),
        size: 60,
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "volume",
        header: () => t("volumeM3"),
        size: 60,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "offered_price",
        size: 100,
        header: () => `${t("offeredPrice")} (EUR / m3)`,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "buyer_name",
        size: 200,
        header: () => `${t("buyer")}`,
      },
    ],
    [props.includeTreeSpecies]
  );

  const columns1 = useMemo<ColumnDef<unknown, any>[]>(
    () => [
      {
        accessorKey: "sequence_no",
        size: 60,
        header: () => `${t("seqNo")}`,
      },
      ...(props.includeTreeSpecies
        ? [
            {
              accessorKey: "tree_species_name",
              header: () => t("treeSpecies"),
              size: 150,
            },
          ]
        : []),
      {
        accessorKey: "length",
        header: () => t("lengthM"),
        size: 60,
        meta: {
          type: "float",
          decimalPlaces: 1,
        },
      },
      {
        accessorKey: "width",
        header: () => t("widthCm"),
        size: 60,
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "volume",
        header: () => t("volumeM3"),
        size: 60,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "offered_price",
        size: 100,
        header: () => `${t("offeredPrice")} (EUR / m3)`,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "total_price",
        size: 120,
        header: () => `${t("totalPrice")} (EUR)`,
      },
      {
        accessorKey: "buyer_name",
        size: 200,
        header: () => `${t("buyer")}`,
      },
    ],
    [props.includeTreeSpecies]
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
      <h2 className="text-xl font-bold">{props.title}</h2>
      {props.volume && (
        <div>
          {t("totalVolume")}: {props.volume || 0} m3
        </div>
      )}
      {props.averageOfferedPrice !== undefined && (
        <div>
          {t("averageOfferedPrice")}: {props.averageOfferedPrice.toFixed(2)} EUR / m3
        </div>
      )}
      <div className="flex flex-row space-x-5">
        <div className="flex flex-col space-y-3">
          <h3 className="font-bold">{t("topThreeOffersPerVolumePrice")}</h3>
          <CustomTable
            sizeEstimate={45}
            table={table}
            trClassName="border-b"
            trhClassName="border-b"
            containerClassName="!overflow-visible"
          />
        </div>
        <div className="flex flex-col space-y-3">
          <h3 className="font-bold">{t("topThreeOffersPerTotalPrice")}</h3>
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
