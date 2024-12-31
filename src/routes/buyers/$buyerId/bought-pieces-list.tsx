import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Big from "big.js";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CustomTable } from "../../../components/CustomTable";
import { DropdownCellReadonly } from "../../../components/DropdownCellReadonly";
import { TableCellReadonly } from "../../../components/TableCellReadonly";
import { treeSpeciesQueryOptions } from "../../../utils/treeSpeciesService";
import {
  WoodPiece,
  woodPiecesQueryOptions,
} from "../../../utils/woodPieceService";

export const Route = createFileRoute("/buyers/$buyerId/bought-pieces-list")({
  component: SoldPiecesList,
});

function SoldPiecesList() {
  const { t, i18n } = useTranslation();

  const params = Route.useParams();

  const woodPiecesQuery = useSuspenseQuery(
    woodPiecesQueryOptions({
      ...Route.useLoaderDeps(),
      buyer_id: params.buyerId,
      offered_price__isnotnull: true,
      min_price_used: true,
      relations: [],
      language: i18n.language as "sl" | "en",
    })
  );
  const woodPieces = woodPiecesQuery.data;

  const woodPiecesQueryGrouped = useSuspenseQuery(
    woodPiecesQueryOptions({
      ...Route.useLoaderDeps(),
      buyer_id: params.buyerId,
      offered_price__isnotnull: true,
      groupBy_tree_species: true,
      min_price_used: true,
      relations: [],
      language: i18n.language as "sl" | "en",
    })
  );
  const woodPiecesGrouped = woodPiecesQueryGrouped.data;

  const treeSpeciesQuery = useSuspenseQuery(
    treeSpeciesQueryOptions({
      language: i18n.language as "sl" | "en",
    })
  );
  const treeSpeciesData = treeSpeciesQuery.data;
  const treeSpeciesOptions = useMemo(
    () =>
      treeSpeciesData.map((ts) => ({
        value: ts.id,
        label: ts.tree_species_name,
      })),
    [treeSpeciesData]
  );

  const columns = useMemo<ColumnDef<WoodPiece>[]>(
    () => [
      {
        accessorKey: "sequence_no",
        header: () => t("seqNo"),
        size: 60,
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "plate_no",
        header: () => t("plateNo"),
        size: 100,
      },
      {
        accessorKey: "tree_species_id",
        header: () => t("treeSpecies"),
        size: 200,
        cell: (data) =>
          DropdownCellReadonly({
            ...data,
            choices: treeSpeciesOptions,
          }),
      },
      {
        accessorKey: "width",
        header: () => t("widthCm"),
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "length",
        header: () => t("lengthM"),
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "volume",
        header: () => t("volumeM3"),
        // footer: (info) => <SumFooter info={info} measure="m3" />,
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "offered_price",
        header: () => t("offeredPrice"),
        size: 80,
        meta: {
          type: "float",
          readonly: true,
        },
        cell: TableCellReadonly,
      },
      {
        accessorKey: "offered_total_price",
        header: () => t("totalPriceM3"),
        size: 80,
        meta: {
          type: "float",
          readonly: true,
        },
        cell: TableCellReadonly,
        // footer: (info) => (
        //   <SumFooter info={info} measure="EUR" label={t("totalGross")} />
        // ),
      },
    ],
    [treeSpeciesOptions]
  );

  const table = useReactTable({
    data: woodPieces,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCellReadonly,
    },
    meta: {},
  });

  const columnsGrouped = useMemo<ColumnDef<WoodPiece>[]>(
    () => [
      {
        accessorKey: "tree_species_id",
        header: () => t("treeSpecies"),
        size: 200,
        cell: (data) =>
          DropdownCellReadonly({
            ...data,
            choices: treeSpeciesOptions,
          }),
      },
      {
        accessorKey: "volume",
        header: () => t("volumeM3"),
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "offered_total_price",
        header: () => t("totalPriceM3"),
        size: 80,
        meta: {
          type: "float",
          readonly: true,
        },
        cell: TableCellReadonly,
      },
    ],
    [treeSpeciesOptions]
  );

  const tableGrouped = useReactTable({
    data: woodPiecesGrouped,
    columns: columnsGrouped,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCellReadonly,
    },
    meta: {},
  });

  const rows = table.getFilteredRowModel().rows;

  const { totalVolume, totalPrice } = useMemo(() => {
    return {
      totalVolume: rows
        .reduce(
          (sum: Big, row) => sum.plus(row.getValue("volume") as number),
          new Big(0)
        )
        .round(2),
      totalPrice: rows
        .reduce(
          (sum, row) => sum.plus(row.getValue("offered_total_price") as number),
          new Big(0)
        )
        .round(2),
    };
  }, [rows]);

  return (
    <div className="p-3 flex flex-col space-y-3">
      <div>
        <CustomTable
          table={table}
          trClassName="border-b"
          trhClassName="border-b"
        />
      </div>
      <div className="font-bold">{t("summary")}</div>
      <div>
        <CustomTable
          table={tableGrouped}
          trClassName="border-b"
          trhClassName="border-b"
        />
      </div>
      <div>
        <table className="mt-5">
          <tr className="border-b">
            <td className="px-2">{t("totalVolume")}</td>
            <td className="px-2">{totalVolume.toFixed(2)} m3</td>
          </tr>
          <tr className="border-b">
            <td className="px-2 font-bold">{t("totalGross")}</td>
            <td className="px-2">{totalPrice.toFixed(2)} EUR</td>
          </tr>
        </table>
      </div>
    </div>
  );
}
