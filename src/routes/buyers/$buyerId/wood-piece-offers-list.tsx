import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { info } from "@tauri-apps/plugin-log";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CustomTable } from "../../../components/CustomTable";
import { DropdownCell } from "../../../components/DropdownCell";
import { RemoveCell } from "../../../components/RemoveCell";
import { TableCell } from "../../../components/TableCell";
import { TableCellReadonly } from "../../../components/TableCellReadonly";
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
    woodPiecesQueryOptions({ relations: ["sellers", "tree_species"] })
  );
  const woodPiecesData = woodPiecesQuery.data;
  info(JSON.stringify(woodPiecesData));
  const columns = useMemo<ColumnDef<WoodPieceOffer>[]>(
    () => [
      {
        accessorKey: "id",
        header: () => "ID",
        size: 80,
        meta: {
          type: "float",
          readonly: true,
        },
        cell: TableCellReadonly,
      },
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
        accessorKey: "offered_max_price",
        header: () => "Max offered price / m3 (EUR)",
        size: 80,
        meta: {
          type: "float",
          readonly: true,
        },
        cell: TableCellReadonly,
      },
      {
        accessorKey: "offered_price",
        header: () => "Offered price / m3 (EUR)",
        size: 160,
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
      {
        accessorKey: "is_max_offer",
        header: () => "Is max",
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
    [params.buyerId, woodPiecesData]
  );

  const woodPieceOffersQuery = useSuspenseQuery(
    woodPieceOffersQueryOptions({
      ...Route.useLoaderDeps(),
      ...Route.useParams(),
    })
  );
  const woodPieces = woodPieceOffersQuery.data;

  const createWoodPieceMutation = useCreateWoodPieceOfferMutation();
  const removeWoodPieceMutation = useRemoveWoodPieceOfferMutation();

  const defaultColumn: Partial<ColumnDef<WoodPieceOffer>> = {
    cell: TableCell,
  };

  const updateWoodPieceMutation = useUpdateWoodPieceOfferMutation();

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
    <div>
      <CustomTable table={table} />
    </div>
  );
}
