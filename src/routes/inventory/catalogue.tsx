import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { CustomTable } from "../../components/CustomTable";
import { DropdownCellReadonly } from "../../components/DropdownCellReadonly";
import { TableCellReadonly } from "../../components/TableCellReadonly";
import { buyersQueryOptions } from "../../utils/buyerService";
import { sellersQueryOptions } from "../../utils/sellerService";
import { treeSpeciesQueryOptions } from "../../utils/treeSpeciesService";
import {
  WoodPiece,
  woodPiecesQueryOptions,
} from "../../utils/woodPieceService";

export const Route = createFileRoute("/inventory/catalogue")({
  component: CatalogueComponent,
});

function CatalogueComponent() {
  const { t, i18n } = useTranslation();

  const [filters, setFilters] = useState<{
    tree_species_id?: number;
    tree_species_id_label?: string;
    offered_price__isnull?: boolean;
    offered_price__isnotnull?: boolean;
    seller_id?: number;
    seller_id_label?: string;
    buyer_id?: number;
    buyer_id_label?: string;
  }>();

  const woodPiecesQuery = useSuspenseQuery(
    woodPiecesQueryOptions({
      ...Route.useLoaderDeps(),
      ...Route.useParams(),
      relations: [],
      ...filters,
      language: i18n.language as "sl" | "en",
    })
  );
  const woodPieces = woodPiecesQuery.data;

  const treeSpeciesQuery = useSuspenseQuery(
    treeSpeciesQueryOptions({ language: i18n.language as "en" | "sl" })
  );
  const treeSpeciesData = treeSpeciesQuery.data;
  const treeSpeciesOptions = useMemo(
    () =>
      treeSpeciesData.map((ts) => ({
        value: ts.id,
        label: ts.tree_species_name,
      })),
    [treeSpeciesData]
  );

  const sellersQuery = useSuspenseQuery(sellersQueryOptions({}));
  const sellers = sellersQuery.data;
  const sellerOptions = useMemo(
    () =>
      sellers.map((ts) => ({
        value: ts.id,
        label: ts.seller_name,
      })),
    [sellers]
  );

  const buyersQuery = useSuspenseQuery(buyersQueryOptions({}));
  const buyers = buyersQuery.data;
  const buyerOptions = useMemo(
    () =>
      buyers.map((ts) => ({
        value: ts.id,
        label: ts.buyer_name,
      })),
    [buyers]
  );

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
          DropdownCellReadonly({
            ...data,
            choices: treeSpeciesOptions,
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
        accessorKey: "volume",
        header: () => t("volumeM3"),
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "ident",
        header: () => t("sellerIdent"),
        size: 200,
      },
    ],
    [treeSpeciesOptions]
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
    <div>
      <CustomTable
        table={table}
        trClassName="border-b"
        trhClassName="border-b"
      />
    </div>
  );
}
