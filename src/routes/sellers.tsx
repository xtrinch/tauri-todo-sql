import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/sellers")({
  component: SellersComponent,
  beforeLoad: ({ location }) => {
    const shouldRedirect = [`/sellers`].includes(location.pathname);

    if (shouldRedirect) {
      redirect({ to: "/sellers/list", throw: true });
    }
  },
});

function SellersComponent() {
  return (
    <>
      <div className="flex items-center border-b">
        <h2 className="text-xl p-2">Sellers</h2>
      </div>
      <div className="flex flex-wrap divide-x">
        {(
          [
            ["/sellers/list", "List"],
            // ["/sellers/new", "Add new"],
          ] as const
        ).map(([to, label]) => {
          return (
            <Link
              key={to}
              to={to}
              activeProps={{ className: `font-bold` }}
              className="p-2"
            >
              {label}
            </Link>
          );
        })}
      </div>
      <hr />
      <Outlet />
    </>
  );
}
