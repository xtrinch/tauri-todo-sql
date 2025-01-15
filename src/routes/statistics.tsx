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
      <div>
        {t("offeredMaxPrice")}:{" "}
        {statisticsQuery.data.offered_max_price.toFixed(2)} EUR
      </div>
      <div>
        {t("totalVolume")}: {statisticsQuery.data.total_volume} m3
      </div>
    </div>
  );
}
