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
import {
  Seller,
  sellersQueryOptions,
  useCreateSellerMutation,
} from "../../utils/sellerService";

type SellersViewSortBy = "name" | "id";

export const Route = createFileRoute("/sellers/list")({
  validateSearch: z.object({
    sellersView: z
      .object({
        sortBy: z.enum(["name", "id"]).optional(),
        filterBy: z.string().optional(),
      })
      .optional(),
  }).parse,
  search: {
    // Retain the sellersView search param while navigating
    // within or to this route (or it's children!)
    middlewares: [retainSearchParams(["sellersView"])],
  },
  loader: (opts) => {
    opts.context.queryClient.ensureQueryData(sellersQueryOptions(opts.deps));
  },
  component: SellersComponent,
});

function SellersComponent() {
  const navigate = useNavigate({ from: Route.fullPath });
  const { sellersView } = Route.useSearch();
  const sellersQuery = useSuspenseQuery(
    sellersQueryOptions(Route.useLoaderDeps())
  );
  const sellers = sellersQuery.data;
  const sortBy = sellersView?.sortBy ?? "name";
  const filterBy = sellersView?.filterBy;

  const [filterDraft, setFilterDraft] = React.useState(filterBy ?? "");

  React.useEffect(() => {
    setFilterDraft(filterBy ?? "");
  }, [filterBy]);

  const createSellerMutation = useCreateSellerMutation((seller: Seller) => {
    navigate({
      to: "/sellers/list/$sellerId",
      params: { sellerId: seller.id },
    });
  });

  const onAdd = () => {
    createSellerMutation.mutate({
      name: "New seller",
    });
  };
  const sortedSellers = React.useMemo(() => {
    if (!sellers) return [];

    return !sortBy
      ? sellers
      : [...sellers].sort((a, b) => {
          return a[sortBy] > b[sortBy] ? 1 : -1;
        });
  }, [sellers, sortBy]);

  const filteredSellers = React.useMemo(() => {
    if (!filterBy) return sortedSellers;

    return sortedSellers.filter((seller) =>
      seller.name.toLowerCase().includes(filterBy.toLowerCase())
    );
  }, [sortedSellers, filterBy]);

  const setSortBy = (sortBy: SellersViewSortBy) =>
    navigate({
      search: (old) => {
        return {
          ...old,
          sellersView: {
            ...(old?.sellersView ?? {}),
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
          sellersView: {
            ...old?.sellersView,
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
        <div className="py-2 px-3 flex gap-2 items-center bg-gray-100 dark:bg-gray-800">
          <div>Sort By:</div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SellersViewSortBy)}
            className="flex-1 border p-1 px-2 rounded"
          >
            {["name", "id"].map((d) => {
              return <option key={d} value={d} children={d} />;
            })}
          </select>
        </div>
        <div className="py-2 px-3 flex gap-2 items-center bg-gray-100 dark:bg-gray-800">
          <div>Filter By:</div>
          <input
            value={filterDraft}
            onChange={(e) => setFilterDraft(e.target.value)}
            placeholder="Search Names..."
            className="min-w-0 flex-1 border p-1 px-2 rounded"
          />
        </div>
        <button
          className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50 w-100 h-10"
          onClick={onAdd}
        >
          Add new
        </button>
        {filteredSellers?.map((seller) => {
          return (
            <div key={seller.id}>
              <Link
                to="/sellers/list/$sellerId"
                params={{
                  sellerId: seller.id,
                }}
                className="block py-2 px-3 text-blue-700"
                activeProps={{ className: `font-bold` }}
              >
                <pre className="text-sm">
                  {seller.name}{" "}
                  <MatchRoute
                    to="/sellers/list/$sellerId"
                    search={{
                      sellerId: seller.id,
                    }}
                    params={{
                      sellerId: seller.id,
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
