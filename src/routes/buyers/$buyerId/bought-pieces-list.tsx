import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
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
      relations: [],
    })
  );
  const woodPieces = woodPiecesQuery.data;

  const treeSpeciesQuery = useSuspenseQuery(treeSpeciesQueryOptions({}));
  const treeSpeciesData = treeSpeciesQuery.data;

  const columns = useMemo<ColumnDef<WoodPiece>[]>(
    () => [
      {
        accessorKey: "sequence_no",
        header: () => t("seqNo"),
        size: 80,
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "tree_species_id",
        header: () => t("treeSpecies"),
        size: 200,
        cell: (data) =>
          DropdownCellReadonly({
            ...data,
            choices: treeSpeciesData.map((ts) => ({
              value: ts.id,
              label: ts.tree_species_name,
            })),
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
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "plate_no",
        header: () => t("plateNo"),
        size: 100,
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
      },
    ],
    [treeSpeciesData]
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

  return (
    <div className="p-3">
      <CustomTable table={table} />
    </div>
  );
}
