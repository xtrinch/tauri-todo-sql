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
import {
  useCreateWoodPieceOfferMutation,
  useRemoveWoodPieceOfferMutation,
  useUpdateWoodPieceOfferMutation,
  WoodPieceOffer,
  woodPieceOffersQueryOptions,
} from "../../../utils/woodPieceOfferService";
import {
  WoodPiece,
  woodPiecesQueryOptions,
} from "../../../utils/woodPieceService";

export const Route = createFileRoute("/buyers/$buyerId/wood-piece-offers-list")(
  {
    component: WoodPiecesList,
  }
);

function WoodPiecesList() {
  const { t, i18n } = useTranslation();

  const params = Route.useParams();

  const woodPiecesQuery = useSuspenseQuery(
    woodPiecesQueryOptions({
      relations: ["sellers", "tree_species"],
      language: i18n.language as "sl" | "en",
    })
  );
  const woodPiecesData = woodPiecesQuery.data;
  const columns = useMemo<ColumnDef<WoodPieceOffer>[]>(
    () => [
      {
        accessorKey: "wood_piece_id",
        header: () => t("woodPiece"),
        size: 400,
        cell: (data) =>
          DropdownCell({
            ...data,
            choices: woodPiecesData.map((ts) => ({
              value: ts.id,
              label: `${ts.sequence_no} - ${ts.seller_name} - ${ts.tree_species_name || "Not set"} - ${ts.volume} m3`,
            })),
          }),
      },
      {
        accessorKey: "offered_price",
        header: () => t("offeredPriceM3"),
        size: 160,
        meta: {
          type: "float",
        },
      },
      // {
      //   accessorKey: "offered_max_price",
      //   header: () => "Max offered price / m3 (EUR)",
      //   size: 80,
      //   meta: {
      //     type: "float",
      //     readonly: true,
      //   },
      //   cell: TableCellReadonly,
      // },
      // {
      //   accessorKey: "offered_total_price",
      //   header: () => t("totalPriceM3"),
      //   size: 80,
      //   meta: {
      //     type: "float",
      //     readonly: true,
      //   },
      //   cell: TableCellReadonly,
      // },
      // {
      //   accessorKey: "is_max_offer",
      //   header: () => "Is max",
      //   size: 80,
      //   meta: {
      //     readonly: true,
      //   },
      //   cell: TableCellReadonly,
      // },
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
    [params.buyerId, woodPiecesData]
  );

  const woodPieceOffersQuery = useSuspenseQuery(
    woodPieceOffersQueryOptions({
      ...Route.useLoaderDeps(),
      ...Route.useParams(),
      language: i18n.language as "en" | "sl",
    })
  );
  const woodPieces = woodPieceOffersQuery.data;

  const createWoodPieceMutation = useCreateWoodPieceOfferMutation({
    onError: () => {
      toast.error(t("couldNotCreate"));
    },
  });
  const removeWoodPieceMutation = useRemoveWoodPieceOfferMutation({
    onError: () => {
      toast.error(t("couldNotRemove"));
    },
  });

  const defaultColumn: Partial<ColumnDef<WoodPieceOffer>> = {
    cell: TableCell,
  };

  const updateWoodPieceMutation = useUpdateWoodPieceOfferMutation({
    onError: () => {
      toast.error(t("couldNotUpdate"));
    },
  });

  const table = useReactTable({
    data: woodPieces,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn,
    meta: {
      onAdd: () => {
        createWoodPieceMutation.mutate({ buyer_id: params.buyerId });
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
