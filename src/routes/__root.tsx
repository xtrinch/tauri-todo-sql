import type { QueryClient } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  Link,
  Outlet,
  createRootRouteWithContext,
  useRouterState,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Spinner } from "../components/Spinner";
import type { Auth } from "../utils/auth";

function RouterSpinner() {
  const isLoading = useRouterState({ select: (s) => s.status === "pending" });
  return <Spinner show={isLoading} />;
}

export const Route = createRootRouteWithContext<{
  auth: Auth;
  queryClient: QueryClient;
}>()({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <div className={`min-h-screen flex flex-col`}>
        <div className={`flex items-center border-b gap-2`}>
          <h1 className={`text-3xl p-2`}>App</h1>
          {/* Show a global spinner when the router is transitioning */}
          <div className={`text-3xl`}>
            <RouterSpinner />
          </div>
        </div>
        <div className={`flex-1 flex`}>
          <div className={`divide-y w-56`}>
            {(
              [
                ["/", "Home"],
                ["/buyers", "Buyers"],
                // ["/profile", "Profile"],
                // ["/login", "Login"],
              ] as const
            ).map(([to, label]) => {
              return (
                <div key={to}>
                  <Link
                    to={to}
                    activeOptions={{}}
                    preload="intent"
                    className={`block py-2 px-3 text-blue-700`}
                    // Make "active" links bold
                    activeProps={{ className: `font-bold` }}
                  >
                    {label}
                  </Link>
                </div>
              );
            })}
          </div>
          <div className={`flex-1 border-l`}>
            <Outlet />
          </div>
        </div>
      </div>
      <ReactQueryDevtools buttonPosition="top-right" />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
