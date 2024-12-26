import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { CustomTable } from "../../../components/CustomTable";
import { DropdownCell } from "../../../components/DropdownCell";
import { RemoveCell } from "../../../components/RemoveCell";
import { TableCell } from "../../../components/TableCell";
import { TableCellReadonly } from "../../../components/TableCellReadonly";
import { treeSpeciesQueryOptions } from "../../../utils/treeSpeciesService";
import {
  useCreateWoodPieceMutation,
  useRemoveWoodPieceMutation,
  useUpdateWoodPieceMutation,
  WoodPiece,
  woodPiecesQueryOptions,
} from "../../../utils/woodPieceService";

export const Route = createFileRoute("/sellers/$sellerId/wood-pieces-list")({
  component: WoodPiecesList,
});

function WoodPiecesList() {
  const params = Route.useParams();

  // TODO: make sure this doesn't remount on window unfocs/focus
  const treeSpeciesQuery = useSuspenseQuery(treeSpeciesQueryOptions({}));
  const treeSpeciesData = treeSpeciesQuery.data;

  const columns = useMemo<ColumnDef<WoodPiece>[]>(
    () => [
      {
        accessorKey: "tree_species_id",
        header: () => "Tree species",
        size: 200,
        cell: (data) =>
          DropdownCell({
            ...data,
            choices: treeSpeciesData.map((ts) => ({
              value: ts.id,
              label: ts.tree_species_name,
            })),
          }),
      },
      {
        accessorKey: "sequence_no",
        header: () => "Seq. no.",
        size: 80,
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "width",
        header: () => "Width",
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "length",
        header: () => "Length",
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "plate_no",
        header: () => "Plate no",
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "offered_price",
        header: () => "Max price",
        size: 80,
        meta: {
          type: "float",
          readonly: true,
        },
        cell: TableCellReadonly,
      },
      {
        accessorKey: "buyer_name",
        header: () => "Buyer",
        size: 80,
        meta: {
          readonly: true,
        },
        cell: TableCellReadonly,
      },
      {
        id: "1",
        header: () => "",
        size: 45,
        accessorFn: () => 1,
        meta: {
          readonly: true,
        },
        cell: RemoveCell,
      },
    ],
    []
  );

  const woodPiecesQuery = useSuspenseQuery(
    woodPiecesQueryOptions({
      ...Route.useLoaderDeps(),
      ...Route.useParams(),
      relations: [],
    })
  );
  const woodPieces = woodPiecesQuery.data;

  const createWoodPieceMutation = useCreateWoodPieceMutation();
  const removeWoodPieceMutation = useRemoveWoodPieceMutation();

  const defaultColumn: Partial<ColumnDef<WoodPiece>> = {
    cell: TableCell,
  };

  const updateWoodPieceMutation = useUpdateWoodPieceMutation();

  const table = useReactTable({
    data: woodPieces,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn,
    meta: {
      onAdd: () => {
        createWoodPieceMutation.mutate({ seller_id: params.sellerId });
      },
      onEdit: (data: WoodPiece) => {
        updateWoodPieceMutation.mutate(data);
      },
      onRemove: (woodPieceId: number) => {
        removeWoodPieceMutation.mutate({ id: woodPieceId });
      },
    },
  });

  return (
    <div>
      <CustomTable table={table} />
    </div>
  );
}
