import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { statsQueryOptions } from "../utils/statsService";

export const Route = createFileRoute("/statistics")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useTranslation();

  const statisticsQuery = useSuspenseQuery(
    statsQueryOptions({
      ...Route.useLoaderDeps(),
    })
  );

  return (
    <div className="p-3 flex flex-col space-y-5">
      <div className="font-bold text-lg">{t("statistics")}</div>
      <div>
        {t("numWoodPieces")}: {statisticsQuery.data.num_wood_pieces}
      </div>
      {/* <div>
        {t("numWoodPiecesNew")}: {statisticsQuery.data.num_wood_pieces_new}
      </div> */}
      <div>
        {t("offeredMaxPrice")}:{" "}
        {(statisticsQuery.data.offered_max_price || 0).toFixed(2)} EUR
      </div>
      {/* <div>
        {t("offeredMaxPriceNew")}: {statisticsQuery.data.offered_max_price_new}{" "}
        EUR
      </div> */}
      <div>
        {t("totalVolume")}:{" "}
        {(statisticsQuery.data.total_volume || 0).toFixed(2)} m3
      </div>
      {/* <div>
        {t("totalVolumeNew")}:{" "}
        {(statisticsQuery.data.total_volume_new || 0).toFixed(2)} m3
      </div> */}
      <div>
        {t("totalIncome")}:{" "}
        {(statisticsQuery.data.total_income || 0).toFixed(2)} EUR
      </div>
      {/* <div>
        {t("totalIncomeNew")}:{" "}
        {(statisticsQuery.data.total_income_new || 0).toFixed(2)} EUR
      </div> */}
      <div>
        {t("loggingCosts")}: {statisticsQuery.data.total_logging_costs} EUR
      </div>
      {/* <div>
        {t("loggingCosts")}: {statisticsQuery.data.total_logging_costs_new} EUR
      </div> */}
      <div>
        {t("transportCosts")}: {statisticsQuery.data.total_transport_costs} EUR
      </div>
      {/* <div>
        {t("transportCostsNew")}: {statisticsQuery.data.total_transport_costs_new} EUR
      </div> */}
      <div>
        {t("costsTo350")}: {statisticsQuery.data.costs_below_350} EUR
      </div>
      {/* <div>
        {t("costsBelow350New")}: {statisticsQuery.data.costs_below_350_new} EUR
      </div> */}
      <div>
        {t("costsAbove350")}: {statisticsQuery.data.costs_above_350} EUR
      </div>
      {/* <div>
        {t("costsAbove350New")}: {statisticsQuery.data.costs_above_350_new} EUR
      </div> */}
    </div>
  );
}
