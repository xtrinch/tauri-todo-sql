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
import { CustomTable } from "../../../components/CustomTable";
import { DropdownCell } from "../../../components/DropdownCell";
import { FooterAddCell } from "../../../components/FooterAddCell";
import { RemoveCell } from "../../../components/RemoveCell";
import { TableCell } from "../../../components/TableCell";
import { TableCellCheckbox } from "../../../components/TableCellCheckbox";
import { treeSpeciesQueryOptions } from "../../../utils/treeSpeciesService";
import {
  useCreateWoodPieceMutation,
  useRemoveWoodPieceMutation,
  useUpdateWoodPieceMutation,
  WoodPiece,
  woodPiecesQueryOptions,
} from "../../../utils/woodPieceService";

export const Route = createFileRoute("/sellers/$sellerId/edit-wood-pieces")({
  component: WoodPiecesList,
});

function WoodPiecesList() {
  const { t, i18n } = useTranslation();

  const params = Route.useParams();

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
    onError: () => {
      toast.error(t("couldNotUpdate"));
    },
  });

  const woodPiecesQuery = useSuspenseQuery(
    woodPiecesQueryOptions({
      ...Route.useLoaderDeps(),
      seller_id: params.sellerId,
      relations: [],
      language: i18n.language as "sl" | "en",
    })
  );
  const woodPieces = woodPiecesQuery.data;

  const treeSpeciesQuery = useSuspenseQuery(
    treeSpeciesQueryOptions({ language: i18n.language as "en" | "sl" })
  );
  const treeSpeciesData = treeSpeciesQuery.data;

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
      // {
      //   accessorKey: "volume",
      //   header: () => t("volumeM3"),
      //   size: 80,
      //   meta: {
      //     type: "float",
      //   },
      // },
      {
        accessorKey: "min_price",
        header: () => t("minPrice"),
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "bypass_min_price",
        header: () => t("bypassMinPrice"),
        size: 80,
        meta: {},
        cell: TableCellCheckbox,
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
    []
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
    <div className="">
      <CustomTable
        table={table}
        containerClassName="p-3 h-[calc(100vh-298px)]"
      />
    </div>
  );
}
