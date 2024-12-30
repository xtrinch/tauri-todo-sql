import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { CustomTable } from "../../components/CustomTable";
import { FooterAddCell } from "../../components/FooterAddCell";
import { RemoveCell } from "../../components/RemoveCell";
import { TableCell } from "../../components/TableCell";
import {
  TreeSpecies,
  treeSpeciesQueryOptions,
  useCreateTreeSpeciesMutation,
  useRemoveTreeSpeciesMutation,
  useUpdateTreeSpeciesMutation,
} from "../../utils/treeSpeciesService";
import { WoodPiece } from "../../utils/woodPieceService";

export const Route = createFileRoute("/treeSpecies/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t, i18n } = useTranslation();

  const createTreeSpeciesMutation = useCreateTreeSpeciesMutation();
  const removeTreeSpeciesMutation = useRemoveTreeSpeciesMutation();
  const updateTreeSpeciesMutation = useUpdateTreeSpeciesMutation();

  const treeSpeciesQuery = useSuspenseQuery(
    treeSpeciesQueryOptions({ language: i18n.language as "en" | "sl" })
  );
  const treeSpeciesData = treeSpeciesQuery.data;

  const columns = useMemo<ColumnDef<TreeSpecies>[]>(
    () => [
      {
        accessorKey: "tree_species_name_slo",
        header: () => t("sloName"),
        size: 220,
        meta: {},
      },
      {
        accessorKey: "latin_name",
        header: () => t("latinName"),
        size: 220,
        meta: {},
      },
      {
        accessorKey: "tree_species_name_en",
        header: () => t("englishName"),
        size: 220,
        meta: {},
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
        footer: (info) => {
          return <FooterAddCell table={info.table} />;
        },
      },
    ],
    [treeSpeciesData]
  );

  const table = useReactTable({
    data: treeSpeciesData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCell,
    },
    meta: {
      onAdd: () => {
        createTreeSpeciesMutation.mutate({});
      },
      onEdit: (data: WoodPiece) => {
        updateTreeSpeciesMutation.mutate(data);
      },
      onRemove: (treeSpeciesId: number) => {
        removeTreeSpeciesMutation.mutate({ id: treeSpeciesId });
      },
    },
  });

  return (
    <div className="p-3 h-[calc(100vh-53px)] overflow-auto">
      <CustomTable table={table} />
    </div>
  );
}
