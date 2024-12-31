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
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import Select, { Options } from "react-select";
import { z } from "zod";
import { Spinner } from "../components/Spinner";
import {
  Seller,
  sellersQueryOptions,
  useCreateSellerMutation,
} from "../utils/sellerService";

type SellersViewSortBy = "seller_name" | "id";
const sortDirections = { seller_name: "ASC", id: "DESC" };

export const Route = createFileRoute("/sellers")({
  validateSearch: z.object({
    sellersView: z
      .object({
        sortBy: z.enum(["seller_name", "id"]).optional(),
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
  const { t } = useTranslation();
  const navigate = useNavigate({ from: Route.fullPath });
  const { sellersView } = Route.useSearch();
  const sortBy = sellersView?.sortBy ?? "id";
  const filterBy = sellersView?.filterBy;
  const sortDirection = sortDirections[sortBy];

  const sellersQuery = useSuspenseQuery(
    sellersQueryOptions({
      ...Route.useLoaderDeps(),
      sortBy,
      filterBy,
      sortDirection: sortDirection as "ASC" | "DESC",
    })
  );
  const sellers = sellersQuery.data;

  const [filterDraft, setFilterDraft] = React.useState(filterBy ?? "");

  React.useEffect(() => {
    setFilterDraft(filterBy ?? "");
  }, [filterBy]);

  const createSellerMutation = useCreateSellerMutation({
    onSuccess: (seller: Seller) => {
      navigate({
        to: "/sellers/$sellerId",
        params: { sellerId: seller.id },
      });
    },
    onError: () => {
      toast.error(t("couldNotCreate"));
    },
  });

  const onAdd = () => {
    createSellerMutation.mutate({});
  };

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

  // Debounced effect for updating the search filter
  React.useEffect(() => {
    const handler = setTimeout(() => {
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
    }, 1000); // 2-second debounce

    return () => {
      clearTimeout(handler); // Cleanup timeout on dependency change
    };
  }, [filterDraft]);

  const options = [
    { value: "id", label: t("sortId") },
    { value: "seller_name", label: t("name") },
  ] as Options<{ value: any; label: any }>;

  return (
    <div className="flex-1 flex">
      <div className="divide-y h-[calc(100vh-53px)] overflow-auto min-w-[280px]">
        <div className="py-2 px-3 flex gap-2 items-center bg-gray-100">
          <div>{t("sort")}:</div>
          <Select
            options={options}
            isSearchable={true}
            onChange={(newValue) =>
              setSortBy(newValue?.value as SellersViewSortBy)
            }
            value={{
              value: sortBy,
              label: options.find((v) => v.value === sortBy)?.label,
            }}
          />
        </div>
        <div className="py-2 px-3 flex gap-2 items-center bg-gray-100">
          <div>Filter:</div>
          <input
            value={filterDraft}
            onChange={(e) => setFilterDraft(e.target.value)}
            placeholder={t("searchNames")}
            className="min-w-0 flex-1 border p-1 px-2 rounded"
            spellCheck="false"
          />
        </div>
        <button
          className="bg-blue-500 rounded p-2 uppercase text-white font-black disabled:opacity-50 w-100 h-10 m-2"
          onClick={onAdd}
        >
          {t("addNew")}
        </button>
        {sellers?.map((seller) => {
          return (
            <div key={seller.id}>
              <Link
                to="/sellers/$sellerId"
                params={{
                  sellerId: seller.id,
                }}
                className="block py-2 px-3 text-blue-700"
                activeProps={{ className: `font-bold bg-gray-100` }}
              >
                <div className="text-m">
                  {seller.seller_name || t("noName")}
                  <MatchRoute
                    to="/sellers/$sellerId"
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
                </div>
              </Link>
            </div>
          );
        })}
      </div>
      <div className="flex-initial border-l h-[calc(100vh-53px)] overflow-auto w-full">
        <Outlet />
      </div>
    </div>
  );
}
