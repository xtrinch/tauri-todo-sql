import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CustomTable } from "../../components/CustomTable";
import { DropdownCell } from "../../components/DropdownCell";
import { FooterAddCell } from "../../components/FooterAddCell";
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
  const { t, i18n } = useTranslation();

  const createWoodPieceMutation = useCreateWoodPieceMutation({
    onError: () => {
      toast.error(t("couldNotCreate"));
    },
  });
  const removeWoodPieceMutation = useRemoveWoodPieceMutation({
    onError: () => {
      toast.error(t("couldNotDelete"));
    },
  });
  const updateWoodPieceMutation = useUpdateWoodPieceMutation({
    onError: (e) => {
      toast.error(`${t("couldNotUpdate")} ${JSON.stringify(e)}`);
    },
  });

  const woodPiecesQuery = useSuspenseQuery(
    woodPiecesQueryOptions({
      ...Route.useLoaderDeps(),
      ...Route.useParams(),
      relations: [],
      language: i18n.language as "sl" | "en",
    })
  );
  const woodPieces = woodPiecesQuery.data;

  const treeSpeciesQuery = useSuspenseQuery(
    treeSpeciesQueryOptions({ language: i18n.language as "en" | "sl" })
  );
  const treeSpeciesData = treeSpeciesQuery.data;

  const sellersQuery = useSuspenseQuery(sellersQueryOptions({}));
  const sellers = sellersQuery.data;

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
        accessorKey: "seller_id",
        header: () => t("seller"),
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
        accessorKey: "min_price",
        header: () => t("minPrice"),
        size: 80,
        meta: {
          type: "float",
        },
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
        footer: (info) => {
          return <FooterAddCell table={info.table} />;
        },
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
    <div className="">
      <CustomTable
        table={table}
        containerClassName="p-3 h-[calc(100vh-94px)] max-h-full overflow-auto"
      />
    </div>
  );
}
