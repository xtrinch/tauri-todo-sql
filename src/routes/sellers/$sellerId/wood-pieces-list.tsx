import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { save } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import { useMemo } from "react";
import { FaFilePdf } from "react-icons/fa6";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CustomTable } from "../../../components/CustomTable";
import { SumFooter } from "../../../components/SumFooter";
import { TableCellCheckbox } from "../../../components/TableCellCheckbox";
import { TableCellReadonly } from "../../../components/TableCellReadonly";
import { PdfTypeEnum, saveToPDF } from "../../../utils/pdf";
import { sellerQueryOptions } from "../../../utils/sellerService";
import {
  useUpdateWoodPieceMutation,
  WoodPiece,
  woodPiecesQueryOptions,
} from "../../../utils/woodPieceService";
export const Route = createFileRoute("/sellers/$sellerId/wood-pieces-list")({
  component: SoldPiecesList,
});

function SoldPiecesList() {
  const { t, i18n } = useTranslation();
  const updateWoodPieceMutation = useUpdateWoodPieceMutation({
    onError: () => {
      toast.error(t("couldNotUpdate"));
    },
  });

  const params = Route.useParams();

  const woodPiecesQuery = useSuspenseQuery(
    woodPiecesQueryOptions({
      ...Route.useLoaderDeps(),
      seller_id: params.sellerId,
      relations: [],
      language: i18n.language as "sl" | "en",
      min_price_not_used: true,
    })
  );
  const woodPieces = woodPiecesQuery.data;

  const sellerQuery = useSuspenseQuery(sellerQueryOptions(params.sellerId));
  const seller = sellerQuery.data;

  const columns = useMemo<ColumnDef<WoodPiece>[]>(
    () => [
      {
        accessorKey: "sequence_no",
        header: () => t("seqNo"),
        size: 70,
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "plate_no",
        header: () => t("plateNo"),
        size: 80,
      },
      {
        accessorKey: "tree_species_name",
        header: () => t("treeSpecies"),
        size: 180,
      },
      {
        accessorKey: "length",
        header: () => t("lengthM"),
        size: 60,
        meta: {
          type: "float",
          decimalPlaces: 1,
        },
      },
      {
        accessorKey: "width",
        header: () => t("widthCm"),
        size: 60,
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "volume",
        header: () => t("volumeM3"),
        size: 60,
        meta: {
          type: "float",
        },
        footer: (info) => <SumFooter info={info} measure="m3" />,
      },
      {
        accessorKey: "min_price",
        header: () => t("minPriceM3"),
        size: 120,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "num_offers",
        header: () => t("numOffers"),
        size: 60,
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "offered_price",
        header: () => t("maxPriceM3"),
        size: 120,
        meta: {
          type: "float",
        },
        cell: (info) => (
          <TableCellReadonly
            {...info}
            shouldBeRed={(row: Row<WoodPiece>) => {
              return (
                (row.getValue("bypass_min_price") as number) === 0 &&
                !!(row.getValue("offered_price") as number) &&
                (row.getValue("min_price") as number) >
                  (row.getValue("offered_price") as number)
              );
            }}
          />
        ),
      },
      {
        accessorKey: "bypass_min_price",
        header: () => t("bypassMinPrice"),
        size: 80,
        meta: {},
        cell: TableCellCheckbox,
      },
      {
        accessorKey: "offered_total_price",
        header: () => t("totalPriceM3"),
        size: 80,
        meta: {
          type: "float",
        },
        cell: TableCellReadonly,
      },
      {
        accessorKey: "buyer_name",
        header: () => t("buyer"),
        size: 180,
        meta: {},
        cell: TableCellReadonly,
      },
    ],
    []
  );

  const table = useReactTable({
    data: woodPieces,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCellReadonly,
    },
    meta: {
      onEdit: (data: WoodPiece) => {
        updateWoodPieceMutation.mutate(data);
      },
    },
  });

  const exportToFile = async () => {
    const path = await save({
      filters: [
        {
          name: "Wood pieces Filter",
          extensions: ["pdf"],
        },
      ],
      defaultPath: t("woodPieces"),
    });
    if (path) {
      await saveToPDF(
        path,
        { woodPiecesData: woodPieces, seller: seller },
        PdfTypeEnum.sellerPieces,
        i18n.language
      );

      await openPath(path);
    }
  };

  return (
    <div className="">
      <CustomTable
        header={
          <button
            className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
            onClick={exportToFile}
            title={t("export")}
          >
            <span className="inline-flex items-center gap-2">
              <FaFilePdf aria-hidden />
              {t("export")}
            </span>
          </button>
        }
        table={table}
        trClassName="border-b"
        trhClassName="border-b"
        containerClassName="p-3 h-[calc(100vh-268px)]"
        hasFooter={true}
      />
    </div>
  );
}
