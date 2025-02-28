import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { save } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { CustomTable } from "../components/CustomTable";
import { DynamicStatsTable } from "../components/DynamicStatsTable";
import { TableCellReadonly } from "../components/TableCellReadonly";
import { PdfTypeEnum, saveToPDF } from "../utils/pdf";
import { settingsQueryOptions } from "../utils/settingsService";
import { statsQueryOptions } from "../utils/statsService";

export const Route = createFileRoute("/statistics")({
  component: StatisticsComponent,
});

function StatisticsComponent() {
  const { t, i18n } = useTranslation();

  const statisticsQuery = useSuspenseQuery(
    statsQueryOptions({
      ...Route.useLoaderDeps(),
      language: i18n.language as "en" | "sl",
    })
  );

  const settingsQuery = useSuspenseQuery(
    settingsQueryOptions({
      ...Route.useLoaderDeps(),
      language: i18n.language as "en" | "sl",
    })
  );
  const settingsData = settingsQuery.data;

  const columns = useMemo<ColumnDef<unknown, any>[]>(
    () => [
      {
        accessorKey: "label",
        size: 650,
        header: () => t("summary"),
      },
      {
        accessorKey: "value",
        size: 100,
        header: () => t("value"),
      },
      {
        accessorKey: "unit",
        size: 90,
        header: () => t("unit"),
      },
    ],
    []
  );

  const data: { label: string; value: string; unit: string; bold?: boolean }[] =
    useMemo(
      () => [
        {
          label: t("numWoodPieces"),
          value: `${statisticsQuery.data.num_wood_pieces || 0}`,
          unit: "",
        },
        {
          label: t("numUnsoldWoodPieces"),
          value: `${statisticsQuery.data.num_unsold_wood_pieces || 0}`,
          unit: "",
        },
        {
          label: t("totalVolume"),
          value: `${(statisticsQuery.data.total_volume || 0).toFixed(2)}`,
          unit: "m3",
        },
        {
          label: t("offeredMaxPrice"),
          value: `${(statisticsQuery.data.offered_max_price || 0).toFixed(2)}`,
          unit: "EUR / m3",
        },
      ],
      [i18n.language, statisticsQuery.data]
    );

  const dataIncoming: {
    label: string;
    value: string;
    unit: string;
    bold?: boolean;
  }[] = useMemo(
    () => [
      {
        label: t("loggingCosts"),
        value: `${(statisticsQuery.data.total_logging_costs || 0).toFixed(2)}`,
        unit: "EUR",
      },
      {
        label: t("transportCosts"),
        value: `${(statisticsQuery.data.total_transport_costs || 0).toFixed(2)}`,
        unit: "EUR",
      },
      {
        label: `${t("costsTo350")} (${settingsData.licitator_fixed_cost} EUR / m3)`,
        value: `${(statisticsQuery.data.costs_below_350 || 0).toFixed(2)}`,
        unit: "EUR",
      },
      {
        label: `${t("costsAbove350")} (${settingsData.licitator_percentage * 100}%)`,
        value: `${(statisticsQuery.data.costs_above_350 || 0).toFixed(2)}`,
        unit: "EUR",
      },
      {
        label: `${t("bundleCosts")} (${settingsData.bundle_cost} EUR / m3)`,
        value: `${(statisticsQuery.data.total_bundle_costs || 0).toFixed(2)}`,
        unit: "EUR",
      },
      {
        label: `${t("loadingCosts")} (x EUR / m3)`,
        value: `${(statisticsQuery.data.total_loading_costs || 0).toFixed(2)}`,
        unit: "EUR",
      },
      {
        label: t("totalIncome"),
        value: `${(statisticsQuery.data.total_income || 0).toFixed(2)}`,
        unit: "EUR",
      },
    ],
    [i18n.language, statisticsQuery.data]
  );

  const dataBalance: {
    label: string;
    value: string;
    unit: string;
    bold?: boolean;
  }[] = useMemo(
    () => [
      {
        label: t("sellersNetValue"),
        value: `-${(statisticsQuery.data.sellers_net || 0).toFixed(2)}`,
        unit: "EUR",
      },
      {
        label: t("buyersNetValue"),
        value: `${(statisticsQuery.data.buyers_net || 0).toFixed(2)}`,
        unit: "EUR",
      },
      {
        label: t("sellersCosts"),
        value: `${(statisticsQuery.data.seller_costs || 0).toFixed(2)}`,
        unit: "EUR",
      },
      {
        label: t("buyersCosts"),
        value: `${(statisticsQuery.data.buyer_costs || 0).toFixed(2)}`,
        unit: "EUR",
      },
      {
        label: t("totalIncome"),
        value: `${(statisticsQuery.data.total_income || 0).toFixed(2)}`,
        unit: "EUR",
      },
    ],
    [i18n.language, statisticsQuery.data]
  );

  const tableData = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCellReadonly,
    },
    meta: {},
  });

  const tableDataIncoming = useReactTable({
    data: dataIncoming,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn: {
      cell: TableCellReadonly,
    },
    meta: {},
  });

  const tableBalance = useReactTable({
    data: dataBalance,
    columns: columns,
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
          name: "pdf",
          extensions: ["pdf"],
        },
      ],
      defaultPath: t("statisticsPDFName"),
    });
    let toastId: string;
    if (path) {
      toastId = toast.loading(t("generating"), {
        position: "top-center",
      });
      try {
        await saveToPDF(
          path,
          {
            statistics: statisticsQuery.data,
            overallData: data,
          },
          PdfTypeEnum.statistics,
          i18n.language
        );
      } catch (e) {
        let error = e as Error;
        toast.error(`${error.message}`, {
          duration: 10000,
        });
        throw e;
      } finally {
        toast.dismiss(toastId);
      }

      await openPath(path);
      toast.success(t("success"));
    }
  };

  return (
    <>
      <div className="p-3 flex flex-col space-y-5 overflow-auto max-h-[calc(100vh-55px)]">
        <h2 className="font-bold text-lg">{t("statistics")}</h2>
        <div>
          <button
            className="bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
            onClick={exportToFile}
          >
            {t("exportStatistics")}
          </button>
        </div>
        <h3 className="font-bold text-lg">{t("total")}</h3>
        <CustomTable
          sizeEstimate={45}
          table={tableData}
          trClassName="border-b"
          trhClassName="border-b"
          containerClassName="!overflow-visible"
        />
        <h3 className="font-bold text-lg">{t("incomeLicitator")}</h3>
        <CustomTable
          sizeEstimate={45}
          table={tableDataIncoming}
          trClassName="border-b"
          trhClassName="border-b"
          containerClassName="!overflow-visible"
        />
        <h3 className="font-bold text-lg">{t("balance")}</h3>
        <CustomTable
          sizeEstimate={45}
          table={tableBalance}
          trClassName="border-b"
          trhClassName="border-b"
          containerClassName="!overflow-visible"
        />
        <DynamicStatsTable
          title={t("statsPerSpecies")}
          woodPieces={statisticsQuery.data.top_logs.top_logs_per_volume || []}
          woodPiecesTotal={statisticsQuery.data.top_logs.top_logs_total || []}
          includeTreeSpecies
          volume={statisticsQuery.data.total_volume || 0}
        />
        {statisticsQuery.data.top_logs_by_species.map((ts) => {
          if (!ts.top_logs_per_volume?.length) {
            return <></>;
          }
          return (
            <DynamicStatsTable
              key={ts.id}
              title={ts.tree_species_name}
              woodPieces={ts.top_logs_per_volume || []}
              woodPiecesTotal={ts.top_logs_total || []}
              volume={ts.volume}
              averageOfferedPrice={
                statisticsQuery.data.stats_by_species[ts.id]?.avg_offered_price
              }
            />
          );
        })}
      </div>
    </>
  );
}
