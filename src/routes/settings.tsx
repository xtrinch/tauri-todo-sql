import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CustomTable } from "../components/CustomTable";
import { TableCell } from "../components/TableCell";
import {
  Settings,
  settingsQueryOptions,
  useUpdateSettingsMutation,
} from "../utils/settingsService";

export const Route = createFileRoute("/settings")({
  component: SettingsComponent,
});

function SettingsComponent() {
  const { t, i18n } = useTranslation();

  const settingsQuery = useSuspenseQuery(
    settingsQueryOptions({
      ...Route.useLoaderDeps(),
      language: i18n.language as "en" | "sl",
    })
  );
  const settingsData = settingsQuery.data;

  const columns = useMemo<ColumnDef<Settings>[]>(
    () => [
      {
        accessorKey: "licitator_fixed_cost",
        header: () => t("licitatorFixedCost"),
        size: 150,
        meta: {},
      },
      {
        accessorKey: "licitator_percentage",
        header: () => t("licitatorPercentage"),
        size: 150,
        meta: {},
      },
      {
        accessorKey: "bundle_cost",
        header: () => t("bundleCost"),
        size: 150,
        meta: {},
      },
    ],
    []
  );

  const updateSettingsMutation = useUpdateSettingsMutation({
    onError: () => {
      toast.error(t("couldNotUpdate"));
    },
  });

  const table = useReactTable({
    data: [settingsData],
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCell,
    },
    meta: {
      onEdit: (data: Settings) => {
        updateSettingsMutation.mutate(data);
      },
    },
  });

  return (
    <div className="">
      <CustomTable
        table={table}
        containerClassName="p-3 h-[calc(100vh-53px)] overflow-auto"
        hasFooter={true}
      />
    </div>
  );
}
