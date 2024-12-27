import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/inventory")({
  component: WoodPiecesList,
  beforeLoad: ({ location, params }) => {
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
  return (
    <div>
      <div className="flex flex-wrap divide-x border-b">
        {(
          [
            ["/inventory/edit", "Edit"],
            ["/inventory/list", "List"],
          ] as const
        ).map(([to, label]) => {
          return (
            <Link
              key={to}
              to={to}
              className="p-2"
              activeProps={{ className: `font-bold bg-gray-100` }}
            >
              {label}
            </Link>
          );
        })}
      </div>
      <Outlet />
    </div>
  );
}
