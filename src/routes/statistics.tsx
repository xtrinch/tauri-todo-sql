import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/statistics")({
  component: Statistics,
  beforeLoad: ({ location }) => {
    const shouldRedirect = [`/statistics`].includes(location.pathname);

    if (shouldRedirect) {
      redirect({
        to: "/statistics/general",
        throw: true,
      });
    }
  },
});

function Statistics() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex flex-wrap divide-x border-b">
        {(
          [
            ["/statistics/general", t("generalStatistics")],
            ["/statistics/for-buyers", t("statisticsForBuyers")],
          ] as const
        ).map(([to, label]) => {
          return (
            <Link
              key={to}
              to={to}
              className="p-2  text-blue-600"
              activeProps={{ className: `font-bold bg-gray-100` }}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <div className="h-[calc(100vh-94px)] overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
