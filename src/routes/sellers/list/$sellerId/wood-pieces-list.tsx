import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { CustomTable } from "../../../../components/CustomTable";
import { RemoveCell } from "../../../../components/RemoveCell";
import { TableCell } from "../../../../components/TableCell";
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
  component: RouteComponent,
});

function RouteComponent() {
  const columns = useMemo<ColumnDef<WoodPiece>[]>(
    () => [
      {
        accessorKey: "id",
        header: () => "Id",
        meta: {
          readonly: true,
        },
      },
      {
        accessorKey: "width",
        header: () => "Width",
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
        createWoodPieceMutation.mutate({ sellerId: params.sellerId });
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
