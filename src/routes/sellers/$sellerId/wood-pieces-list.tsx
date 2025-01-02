import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CustomTable } from "../../../components/CustomTable";
import { SumFooter } from "../../../components/SumFooter";
import { TableCellCheckboxReadonly } from "../../../components/TableCellCheckboxReadonly";
import { TableCellReadonly } from "../../../components/TableCellReadonly";
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
        accessorKey: "tree_species_name",
        header: () => t("treeSpecies"),
        size: 200,
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
        size: 80,
        meta: {
          type: "float",
          readonly: true,
        },
        cell: TableCellReadonly,
      },
      {
        accessorKey: "offered_price",
        header: () => t("maxPriceM3"),
        size: 80,
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
        size: 80,
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

  return (
    <div className="">
      <CustomTable
        table={table}
        trClassName="border-b"
        trhClassName="border-b"
        containerClassName="p-3 h-[calc(100vh-297px)]"
      />
    </div>
  );
}
