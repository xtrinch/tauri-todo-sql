import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

export const Route = createFileRoute("/inventory")({
  component: WoodPiecesList,
  beforeLoad: ({ location }) => {
    const shouldRedirect = [`/inventory`].includes(location.pathname);

    if (shouldRedirect) {
      redirect({
        to: "/inventory/edit",
        throw: true,
      });
    }
  },
});

function WoodPiecesList() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex flex-wrap divide-x border-b">
        {(
          [
            ["/inventory/edit", t("edit")],
            ["/inventory/list", t("list")],
          ] as const
        ).map(([to, label]) => {
          return (
            <Link
              key={to}
              to={to}
              className="p-2  text-blue-700"
              activeProps={{ className: `font-bold bg-gray-100` }}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <div className="p-3 h-[calc(100vh-100px)] overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}