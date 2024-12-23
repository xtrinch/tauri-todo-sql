import {
  Link,
  Outlet,
  createFileRoute,
  redirect,
} from "@tanstack/react-router";

export const Route = createFileRoute("/buyers")({
  component: BuyersComponent,
  beforeLoad: ({ location }) => {
    const shouldRedirect = [`/buyers`].includes(location.pathname);

    if (shouldRedirect) {
      redirect({ to: "/buyers/list", throw: true });
    }
  },
});

function BuyersComponent() {
  return (
    <>
      <div className="flex items-center border-b">
        <h2 className="text-xl p-2">Buyers</h2>
      </div>
      <div className="flex flex-wrap divide-x">
        {(
          [
            ["/buyers/list", "List"],
            ["/buyers/new", "Add new"],
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
