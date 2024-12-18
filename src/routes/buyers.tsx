import {
  Link,
  Outlet,
  createFileRoute,
  useNavigate,
} from "@tanstack/react-router";
import * as React from "react";

export const Route = createFileRoute("/buyers")({
  component: KupciComponent,
});

function KupciComponent() {
  const navigate = useNavigate();
  React.useEffect(() => {
    navigate({ to: "/buyers/list" });
  }, []);

  return (
    <>
      <div className="flex items-center border-b">
        <h2 className="text-xl p-2">Kupci</h2>
      </div>
      <div className="flex flex-wrap divide-x">
        {(
          [
            ["/buyers/list", "Seznam"],
            ["/buyers/new", "Dodaj kupca"],
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
