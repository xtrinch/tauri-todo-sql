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
import { useTranslation } from "react-i18next";
import { CustomTable } from "../../../components/CustomTable";
import { SellerPiecesExport } from "../../../components/SellerPiecesExport";
import { SumFooter } from "../../../components/SumFooter";
import { TableCellCheckboxReadonly } from "../../../components/TableCellCheckboxReadonly";
import { TableCellReadonly } from "../../../components/TableCellReadonly";
import { saveToPDF } from "../../../utils/pdf";
import { sellerQueryOptions } from "../../../utils/sellerService";
import { treeSpeciesQueryOptions } from "../../../utils/treeSpeciesService";
import {
  WoodPiece,
  woodPiecesQueryOptions,
} from "../../../utils/woodPieceService";
export const Route = createFileRoute("/sellers/$sellerId/wood-pieces-list")({
  component: SoldPiecesList,
});

function SoldPiecesList() {
  const { t, i18n } = useTranslation();

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

  const treeSpeciesQuery = useSuspenseQuery(
    treeSpeciesQueryOptions({ language: i18n.language as "en" | "sl" })
  );
  const treeSpeciesData = treeSpeciesQuery.data;

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
        size: 100,
      },
      {
        accessorKey: "tree_species_name",
        header: () => t("treeSpecies"),
        size: 200,
      },
      {
        accessorKey: "length",
        header: () => t("lengthM"),
        size: 80,
        meta: {
          type: "float",
          decimalPlaces: 1,
        },
      },
      {
        accessorKey: "width",
        header: () => t("widthCm"),
        size: 80,
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "volume",
        header: () => t("volumeM3"),
        size: 80,
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
          readonly: true,
        },
        cell: TableCellReadonly,
      },
      {
        accessorKey: "offered_price",
        header: () => t("maxPriceM3"),
        size: 120,
        meta: {
          type: "float",
          readonly: true,
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
        cell: TableCellCheckboxReadonly,
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
        accessorKey: "buyer_name",
        header: () => t("buyer"),
        size: 180,
        meta: {
          readonly: true,
        },
        cell: TableCellReadonly,
      },
    ],
    [treeSpeciesData]
  );

  const table = useReactTable({
    data: woodPieces,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCellReadonly,
    },
    meta: {},
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
        <SellerPiecesExport woodPiecesData={woodPieces} seller={seller} />
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
          >
            {t("export")}
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
