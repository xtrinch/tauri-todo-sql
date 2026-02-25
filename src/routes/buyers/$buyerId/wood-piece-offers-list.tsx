import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo, useRef, useState } from "react";
import { FaAngleDown, FaAngleUp } from "react-icons/fa6";
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
  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

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
        size: 600,
        cell: (data) =>
          DropdownCell({
            ...data,
            choices: woodPiecesData.map((ts) => ({
              value: ts.id,
              label: `${ts.sequence_no} - ${ts.seller_name} - ${ts.tree_species_name || "Not set"} - ${ts.volume} m3`,
            })),
            shouldBeRed: (row: Row<WoodPieceOffer>) => {
              return row.getValue("duplicate_offer");
            },
          }),
      },
      {
        accessorKey: "duplicate_offer",
        header: () => <></>,
        cell: undefined,
        size: 0,
        meta: { type: "boolean" },
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
      mark_duplicates: true,
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
      toast.error(t("couldNotDelete"));
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

  const onWoodPieceRemove = async (woodPieceId: number) => {
    removeWoodPieceMutation.mutate({ id: woodPieceId });
  };

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
      onRemove: onWoodPieceRemove,
    },
  });

  useEffect(() => {
    const container = tableContainerRef.current;
    if (!container) {
      return;
    }

    const threshold = 2;
    const updateScrollButtons = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtTop = scrollTop <= threshold;
      const isAtBottom =
        scrollTop + clientHeight >= scrollHeight - threshold;
      setShowScrollTop(!isAtTop);
      setShowScrollBottom(!isAtBottom);
    };

    updateScrollButtons();
    const rafId = window.requestAnimationFrame(updateScrollButtons);
    container.addEventListener("scroll", updateScrollButtons, {
      passive: true,
    });
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      window.cancelAnimationFrame(rafId);
      container.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [woodPieces.length]);

  const scrollToBottom = () => {
    if (!tableContainerRef.current) {
      return;
    }

    tableContainerRef.current.scrollTo({
      top: tableContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  };

  const scrollToTop = () => {
    if (!tableContainerRef.current) {
      return;
    }

    tableContainerRef.current.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <CustomTable
        table={table}
        containerClassName="p-3 h-[calc(100vh-279px)]"
        containerRef={tableContainerRef}
        hasFooter={true}
      />
      <div className="absolute right-6 bottom-6 z-10 flex flex-col gap-2">
        <button
          type="button"
          onClick={scrollToTop}
          title={t("scrollToTop")}
          aria-label={t("scrollToTop")}
          disabled={!showScrollTop}
          className="h-10 w-10 rounded-full bg-blue-400 text-white shadow-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center">
            <FaAngleUp />
          </span>
        </button>
        <button
          type="button"
          onClick={scrollToBottom}
          title={t("scrollToBottom")}
          aria-label={t("scrollToBottom")}
          disabled={!showScrollBottom}
          className="h-10 w-10 rounded-full bg-blue-400 text-white shadow-md hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center">
            <FaAngleDown />
          </span>
        </button>
      </div>
    </div>
  );
}
