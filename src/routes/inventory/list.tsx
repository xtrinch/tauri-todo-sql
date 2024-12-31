import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Select from "react-select";
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

export const Route = createFileRoute("/inventory/list")({
  component: ListInventoryComponent,
});

function ListInventoryComponent() {
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
        accessorKey: "seller_id",
        header: () => t("seller"),
        size: 200,
        cell: (data) =>
          DropdownCellReadonly({
            ...data,
            choices: sellers.map((ts) => ({
              value: ts.id,
              label: ts.seller_name,
            })),
          }),
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
                tree_species_id_label: newValue?.label || "No label",
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
          <div className="text-sm">{t("maxPrice")}</div>
          <Select
            className="w-[200px]"
            options={[
              { label: t("isDefined"), value: "offered_price_isnotnull" },
              { label: t("isNotDefined"), value: "offered_price_isnull" },
            ]}
            isSearchable={true}
            onChange={(newValue) =>
              setFilters((prev) => ({
                ...prev,
                offered_price__isnull:
                  newValue?.value === "offered_price_isnull",
                offered_price__isnotnull:
                  newValue?.value === "offered_price_isnotnull",
              }))
            }
            value={{
              value: filters?.offered_price__isnull
                ? "offered_price_isnull"
                : filters?.offered_price__isnotnull
                  ? "offered_price_isnotnull"
                  : "",
              label: filters?.offered_price__isnull
                ? t("isNotDefined")
                : filters?.offered_price__isnotnull
                  ? t("isDefined")
                  : "",
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
                seller_id_label: newValue?.label || "No label",
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
      <CustomTable
        table={table}
        trClassName="border-b"
        trhClassName="border-b"
      />
    </div>
  );
}
