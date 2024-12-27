import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import Select from "react-select";
import { CustomTable } from "../../components/CustomTable";
import { DropdownCellReadonly } from "../../components/DropdownCellReadonly";
import { TableCellReadonly } from "../../components/TableCellReadonly";
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
  const [filters, setFilters] = useState<{
    tree_species_id?: number;
    tree_species_id_label?: string;
    offered_price__isnull?: boolean;
    offered_price__isnotnull?: boolean;
  }>();

  const woodPiecesQuery = useSuspenseQuery(
    woodPiecesQueryOptions({
      ...Route.useLoaderDeps(),
      ...Route.useParams(),
      relations: [],
      ...filters,
    })
  );
  const woodPieces = woodPiecesQuery.data;

  // TODO: make sure this doesn't remount on window unfocs/focus
  const treeSpeciesQuery = useSuspenseQuery(treeSpeciesQueryOptions({}));
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

  const columns = useMemo<ColumnDef<WoodPiece>[]>(
    () => [
      {
        accessorKey: "sequence_no",
        header: () => "Seq. no.",
        size: 60,
        meta: {
          type: "integer",
        },
      },
      {
        accessorKey: "seller_id",
        header: () => "Seller",
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
        accessorKey: "tree_species_id",
        header: () => "Tree species",
        size: 200,
        cell: (data) =>
          DropdownCellReadonly({
            ...data,
            choices: treeSpeciesOptions,
          }),
      },
      {
        accessorKey: "width",
        header: () => "Width (cm)",
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "length",
        header: () => "Length (m)",
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "volume",
        header: () => "Volume (m3)",
        size: 80,
        meta: {
          type: "float",
        },
      },
      {
        accessorKey: "plate_no",
        header: () => "Plate no",
        size: 100,
      },
      {
        accessorKey: "offered_price",
        header: () => "Max price / m3 (EUR)",
        size: 80,
        meta: {
          type: "float",
          readonly: true,
        },
        cell: TableCellReadonly,
      },
      {
        accessorKey: "offered_total_price",
        header: () => "Total price (EUR)",
        size: 80,
        meta: {
          type: "float",
          readonly: true,
        },
        cell: TableCellReadonly,
      },
      {
        accessorKey: "buyer_name",
        header: () => "Buyer",
        size: 80,
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
    <div className="p-3">
      <div className="mb-3">Filters</div>
      <div className="flex flex-row space-x-3">
        <div>
          <div className="text-sm"> Tree species</div>
          <Select
            className="w-[200px]"
            options={treeSpeciesOptions}
            isSearchable={true}
            onChange={(newValue) =>
              setFilters((prev) => ({
                ...prev,
                tree_species_id: newValue?.value!,
                tree_species_id_label: newValue?.label!,
              }))
            }
            value={{
              value: filters?.tree_species_id,
              label: filters?.tree_species_id_label,
            }}
            isClearable={true}
          />
        </div>
        <div>
          <div className="text-sm">Max price</div>
          <Select
            className="w-[200px]"
            options={[
              { label: "Is defined", value: "offered_price_isnotnull" },
              { label: "Is not defined", value: "offered_price_isnull" },
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
                ? "Is not defined"
                : filters?.offered_price__isnotnull
                  ? "Is defined"
                  : "",
            }}
            isClearable={true}
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
