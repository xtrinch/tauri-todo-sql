import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  Row,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import { CustomTable } from "../../components/CustomTable";
import { TableCellReadonly } from "../../components/TableCellReadonly";
import { buyersQueryOptions } from "../../utils/buyerService";
import { sellersQueryOptions } from "../../utils/sellerService";
import { treeSpeciesQueryOptions } from "../../utils/treeSpeciesService";

import { compact, values } from "lodash";
import { TableCellCheckboxReadonly } from "../../components/TableCellCheckboxReadonly";
import {
  WoodPiece,
  woodPiecesQueryOptions,
} from "../../utils/woodPieceService";

export const Route = createFileRoute("/inventory/list")({
  component: ListInventoryComponent,
});

function ListInventoryComponent() {
  const { t, i18n } = useTranslation();

  const [filters, setFilters] = useState<{
    tree_species_id?: number;
    tree_species_id_label?: string;
    offered_price__isnotnull?: boolean;
    seller_id?: number;
    seller_id_label?: string;
    buyer_id?: number;
    buyer_id_label?: string;
  }>();

  const filtersHaveValue = useMemo(() => {
    return compact(values(filters)).length > 0;
  }, [filters]);

  const woodPiecesQuery = useSuspenseQuery(
    woodPiecesQueryOptions({
      ...Route.useLoaderDeps(),
      ...Route.useParams(),
      relations: [],
      ...filters,
      language: i18n.language as "sl" | "en",
      ...(!filtersHaveValue
        ? { mark_duplicates: true, fill_empty_seq_lines: true }
        : {}),
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
        size: 70,
        meta: {
          type: "integer",
        },
        cell: (cellInfo) => (
          <TableCellReadonly
            {...cellInfo}
            shouldBeRed={(row: Row<WoodPiece>) => {
              return (
                row.getValue("duplicate_seq_no") || !row.getValue("sequence_no")
              );
            }}
          />
        ),
      },
      {
        accessorKey: "plate_no",
        header: () => t("plateNo"),
        size: 100,
        cell: (cellInfo) => (
          <TableCellReadonly
            {...cellInfo}
            shouldBeRed={(row: Row<WoodPiece>) => {
              return row.getValue("duplicate_plate_no");
            }}
          />
        ),
      },
      {
        accessorKey: "duplicate_plate_no",
        header: () => <></>,
        size: 0,
        cell: undefined,
      },
      {
        accessorKey: "duplicate_seq_no",
        header: () => <></>,
        size: 0,
        cell: undefined,
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
          type: "integer",
        },
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
        accessorKey: "volume",
        header: () => t("volumeM3"),
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "seller_name",
        header: () => t("seller"),
        size: 200,
      },
      {
        accessorKey: "min_price",
        header: () => t("minPriceEUR"),
        size: 80,
        meta: {
          type: "float",
          readonly: true,
        },
        cell: TableCellReadonly,
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
        size: 80,
        meta: {
          type: "float",
          readonly: true,
        },
        cell: TableCellReadonly,
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
        size: 200,
        meta: {
          readonly: true,
        },
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
    meta: {},
  });

  return (
    <div>
      <div className="p-3">
        <div className="mb-3">{t("filters")}</div>
        <div className="flex flex-row space-x-3 mb-3">
          <div>
            <div className="text-sm">{t("treeSpecies")}</div>
            <Select
              className="w-[200px]"
              options={treeSpeciesOptions}
              isSearchable={true}
              onChange={(newValue) =>
                setFilters((prev) => ({
                  ...prev,
                  tree_species_id: newValue?.value!,
                  tree_species_id_label: newValue?.label,
                }))
              }
              value={{
                value: filters?.tree_species_id,
                label: filters?.tree_species_id_label,
              }}
              isClearable={true}
              placeholder={t("select")}
            />
          </div>
          <div>
            <div className="text-sm">{t("seller")}</div>
            <Select
              className="w-[200px]"
              options={sellerOptions}
              isSearchable={true}
              onChange={(newValue) =>
                setFilters((prev) => ({
                  ...prev,
                  seller_id: newValue?.value!,
                  seller_id_label: newValue?.label,
                }))
              }
              value={{
                value: filters?.seller_id,
                label: filters?.seller_id_label,
              }}
              isClearable={true}
              placeholder={t("select")}
            />
          </div>
          <div>
            <div className="text-sm">{t("buyer")}</div>
            <Select
              className="w-[200px]"
              options={buyerOptions}
              isSearchable={true}
              onChange={(newValue) =>
                setFilters((prev) => ({
                  ...prev,
                  buyer_id: newValue?.value!,
                  buyer_id_label: newValue?.label!,
                }))
              }
              value={{
                value: filters?.buyer_id,
                label: filters?.buyer_id_label,
              }}
              isClearable={true}
              placeholder={t("select")}
            />
          </div>
        </div>
      </div>
      <CustomTable
        table={table}
        trClassName="border-b"
        trhClassName="border-b"
        containerClassName="p-3 h-[calc(100vh-225px)]"
      />
    </div>
  );
}
