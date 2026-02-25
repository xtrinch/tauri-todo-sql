import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { save } from "@tauri-apps/plugin-dialog";
import { openPath } from "@tauri-apps/plugin-opener";
import { useTranslation } from "react-i18next";
import { FaFilePdf } from "react-icons/fa6";
import toast from "react-hot-toast";
import { DynamicStatsTable } from "../../components/DynamicStatsTable";
import { PdfTypeEnum, saveToPDF } from "../../utils/pdf";
import { statsQueryOptions } from "../../utils/statsService";

export const Route = createFileRoute("/statistics/offer-statistics")({
  component: OfferStatisticsComponent,
});

function OfferStatisticsComponent() {
  const { t, i18n } = useTranslation();

  const statisticsQuery = useSuspenseQuery(
    statsQueryOptions({
      ...Route.useLoaderDeps(),
      language: i18n.language as "en" | "sl",
    }),
  );

  const exportToFile = async () => {
    const path = await save({
      filters: [
        {
          name: "pdf",
          extensions: ["pdf"],
        },
      ],
      defaultPath: t("offerStatisticsPDFName"),
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
          },
          PdfTypeEnum.offerStatistics,
          i18n.language,
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
    <div className="p-3 flex flex-col space-y-5">
      <div className="relative">
        <button
          className="absolute right-0 top-0 bg-blue-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 h-10"
          onClick={exportToFile}
        >
          <span className="inline-flex items-center gap-2">
            <FaFilePdf aria-hidden />
            {t("exportOfferStatistics")}
          </span>
        </button>
      </div>
      <DynamicStatsTable
        title={t("statsPerSpecies")}
        woodPieces={statisticsQuery.data.top_logs.top_logs_per_volume || []}
        woodPiecesTotal={statisticsQuery.data.top_logs.top_logs_total || []}
        includeTreeSpecies
        volume={statisticsQuery.data.total_volume || 0}
      />
      {statisticsQuery.data.top_logs_by_species.map((ts) => {
        if (!ts.top_logs_per_volume?.length) {
          return null;
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
  );
}
