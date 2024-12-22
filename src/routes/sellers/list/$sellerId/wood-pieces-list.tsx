import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { CustomTable } from "../../../../components/CustomTable";
import { DropdownCell } from "../../../../components/DropdownCell";
import { RemoveCell } from "../../../../components/RemoveCell";
import { TableCell } from "../../../../components/TableCell";
import { treeSpeciesQueryOptions } from "../../../../utils/treeSpeciesService";
import {
  useCreateWoodPieceMutation,
  useRemoveWoodPieceMutation,
  useUpdateWoodPieceMutation,
  WoodPiece,
  woodPiecesQueryOptions,
} from "../../../../utils/woodPieceService";

export const Route = createFileRoute(
  "/sellers/list/$sellerId/wood-pieces-list"
)({
  component: WoodPiecesList,
});

function WoodPiecesList() {
  // TODO: make sure this doesn't remount on cell change
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
              label: ts.name,
            })),
          }),
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
        accessorKey: "max_price",
        header: () => "Max price",
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
        id: "1",
        header: () => "",
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
    woodPiecesQueryOptions({ ...Route.useLoaderDeps(), ...Route.useParams() })
  );
  const params = Route.useParams();
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
      onRemove: (woodPieceId: number) => {
        removeWoodPieceMutation.mutate({ id: woodPieceId });
      },
      onEdit: (data: WoodPiece) => {
        updateWoodPieceMutation.mutate(data);
      },
    },
  });

  return (
    <div>
      <CustomTable table={table} />
    </div>
  );
}
