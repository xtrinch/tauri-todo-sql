import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { CustomTable } from "../../components/CustomTable";
import { DropdownCell } from "../../components/DropdownCell";
import { RemoveCell } from "../../components/RemoveCell";
import { TableCell } from "../../components/TableCell";
import { sellersQueryOptions } from "../../utils/sellerService";
import { treeSpeciesQueryOptions } from "../../utils/treeSpeciesService";
import {
  useCreateWoodPieceMutation,
  useRemoveWoodPieceMutation,
  useUpdateWoodPieceMutation,
  WoodPiece,
  woodPiecesQueryOptions,
} from "../../utils/woodPieceService";

export const Route = createFileRoute("/inventory/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const createWoodPieceMutation = useCreateWoodPieceMutation();
  const removeWoodPieceMutation = useRemoveWoodPieceMutation();
  const updateWoodPieceMutation = useUpdateWoodPieceMutation();

  const woodPiecesQuery = useSuspenseQuery(
    woodPiecesQueryOptions({
      ...Route.useLoaderDeps(),
      ...Route.useParams(),
      relations: [],
    })
  );
  const woodPieces = woodPiecesQuery.data;

  const treeSpeciesQuery = useSuspenseQuery(treeSpeciesQueryOptions({}));
  const treeSpeciesData = treeSpeciesQuery.data;

  const sellersQuery = useSuspenseQuery(sellersQueryOptions({}));
  const sellers = sellersQuery.data;

  const columns = useMemo<ColumnDef<WoodPiece>[]>(
    () => [
      {
        accessorKey: "sequence_no",
        header: () => "Seq. no.",
        size: 60,
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "seller_id",
        header: () => "Seller",
        size: 200,
        cell: (data) =>
          DropdownCell({
            ...data,
            choices: sellers.map((ts) => ({
              value: ts.id,
              label: ts.seller_name,
            })),
          }),
      },
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
        accessorKey: "width",
        header: () => "Width (cm)",
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "length",
        header: () => "Length (m)",
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "volume",
        header: () => "Volume (m3)",
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "plate_no",
        header: () => "Plate no",
        size: 100,
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
    [treeSpeciesData, sellers]
  );

  const table = useReactTable({
    data: woodPieces,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCell,
    },
    meta: {
      onAdd: () => {
        createWoodPieceMutation.mutate({});
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
    <div className="p-3">
      <CustomTable table={table} />
    </div>
  );
}
