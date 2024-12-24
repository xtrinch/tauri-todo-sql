/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Link,
  MatchRoute,
  Outlet,
  createFileRoute,
  retainSearchParams,
  useNavigate,
} from "@tanstack/react-router";
import * as React from "react";
import { z } from "zod";
import { Spinner } from "../../components/Spinner";
import { buyersQueryOptions } from "../../utils/buyerService";

type BuyersViewSortBy = "name" | "id";

export const Route = createFileRoute("/buyers/list")({
  validateSearch: z.object({
    buyersView: z
      .object({
        sortBy: z.enum(["name", "id"]).optional(),
        filterBy: z.string().optional(),
      })
      .optional(),
  }).parse,
  search: {
    // Retain the buyersView search param while navigating
    // within or to this route (or it's children!)
    middlewares: [retainSearchParams(["buyersView"])],
  },
  loader: (opts) => {
    opts.context.queryClient.ensureQueryData(buyersQueryOptions(opts.deps));
  },
  component: BuyersComponent,
});

function BuyersComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { buyersView } = Route.useSearch();
  const buyersQuery = useSuspenseQuery(
    buyersQueryOptions(Route.useLoaderDeps())
  );
  const buyers = buyersQuery.data;
  const sortBy = buyersView?.sortBy ?? "name";
  const filterBy = buyersView?.filterBy;

  const [filterDraft, setFilterDraft] = React.useState(filterBy ?? "");

  React.useEffect(() => {
    setFilterDraft(filterBy ?? "");
  }, [filterBy]);

  const sortedBuyers = React.useMemo(() => {
    if (!buyers) return [];

    return !sortBy
      ? buyers
      : [...buyers].sort((a, b) => {
          return a[sortBy] > b[sortBy] ? 1 : -1;
        });
  }, [buyers, sortBy]);

  const filteredBuyers = React.useMemo(() => {
    if (!filterBy) return sortedBuyers;

    return sortedBuyers.filter((buyer) =>
      buyer.name.toLowerCase().includes(filterBy.toLowerCase())
    );
  }, [sortedBuyers, filterBy]);

  const setSortBy = (sortBy: BuyersViewSortBy) =>
    navigate({
      search: (old) => {
        return {
          ...old,
          buyersView: {
            ...(old?.buyersView ?? {}),
            sortBy,
          },
        };
      },
      replace: true,
    });

  React.useEffect(() => {
    navigate({
      search: (old) => {
        return {
          ...old,
          buyersView: {
            ...old?.buyersView,
            filterBy: filterDraft || undefined,
          },
        };
      },
      replace: true,
    });
  }, [filterDraft]);

  return (
    <div className="flex-1 flex">
      <div className="divide-y">
        <div className="py-2 px-3 flex gap-2 items-center bg-gray-100">
          <div>Sort:</div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as BuyersViewSortBy)}
            className="flex-1 border p-1 px-2 rounded"
          >
            {["name", "id"].map((d) => {
              return <option key={d} value={d} children={d} />;
            })}
          </select>
        </div>
        <div className="py-2 px-3 flex gap-2 items-center bg-gray-100">
          <div>Filter:</div>
          <input
            value={filterDraft}
            onChange={(e) => setFilterDraft(e.target.value)}
            placeholder="Search Names..."
            className="min-w-0 flex-1 border p-1 px-2 rounded"
          />
        </div>
        {filteredBuyers?.map((buyer) => {
          return (
            <div key={buyer.id}>
              <Link
                to="/buyers/list/$buyerId"
                params={{
                  buyerId: buyer.id,
                }}
                className="block py-2 px-3 text-blue-700"
                activeProps={{ className: `font-bold` }}
              >
                <pre className="text-sm">
                  {buyer.name}{" "}
                  <MatchRoute
                    to="/buyers/list/$buyerId"
                    search={{
                      buyerId: buyer.id,
                    }}
                    params={{
                      buyerId: buyer.id,
                    }}
                    pending
                  >
                    {(match) => <Spinner show={!!match} wait="delay-50" />}
                  </MatchRoute>
                </pre>
              </Link>
            </div>
          );
        })}
      </div>
      <div className="flex-initial border-l">
        <Outlet />
      </div>
    </div>
  );
}
