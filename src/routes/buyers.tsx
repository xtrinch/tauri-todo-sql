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
import { FaPlus } from "react-icons/fa6";
import Select, { Options } from "react-select";
import { z } from "zod";
import {
  Buyer,
  buyersQueryOptions,
  useCreateBuyerMutation,
} from "../utils/buyerService";

type BuyersViewSortBy = "buyer_name" | "id";
const sortDirections = { buyer_name: "ASC", id: "DESC" };

export const Route = createFileRoute("/buyers")({
  validateSearch: z.object({
    buyersView: z
      .object({
        sortBy: z.enum(["buyer_name", "id"]).optional(),
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
  const { t } = useTranslation();

  const navigate = useNavigate({ from: Route.fullPath });
  const { buyersView } = Route.useSearch();
  const sortBy = buyersView?.sortBy ?? "id";
  const filterBy = buyersView?.filterBy;
  const sortDirection = sortDirections[sortBy];

  const buyersQuery = useSuspenseQuery(
    buyersQueryOptions({
      ...Route.useLoaderDeps(),
      sortBy,
      filterBy,
      sortDirection: sortDirection as "ASC" | "DESC",
    })
  );
  const buyers = buyersQuery.data;

  const [filterDraft, setFilterDraft] = React.useState(filterBy ?? "");

  React.useEffect(() => {
    setFilterDraft(filterBy ?? "");
  }, [filterBy]);

  const createBuyerMutation = useCreateBuyerMutation({
    onSuccess: (buyer: Buyer) => {
      navigate({
        to: "/buyers/$buyerId",
        params: { buyerId: buyer.id },
      });
    },
    onError: () => {
      toast.error(t("couldNotCreate"));
    },
  });

  const onAdd = () => {
    createBuyerMutation.mutate({});
  };

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

  // Debounced effect for updating the search filter
  React.useEffect(() => {
    const handler = setTimeout(() => {
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
    }, 1000); // 2-second debounce

    return () => {
      clearTimeout(handler); // Cleanup timeout on dependency change
    };
  }, [filterDraft]);

  const options = [
    { value: "id", label: t("sortId") },
    { value: "buyer_name", label: t("name") },
  ] as Options<{ value: any; label: any }>;

  return (
    <div className="flex-1 flex">
      <div className="divide-y h-[calc(100vh-53px)] overflow-auto min-w-[320px]">
        <div className="py-2 px-3 flex gap-2 items-center bg-gray-100">
          <div>{t("sort")}:</div>
          <Select
            options={options}
            isSearchable={true}
            onChange={(newValue) =>
              setSortBy(newValue?.value as BuyersViewSortBy)
            }
            value={{
              value: sortBy,
              label: options.find((v) => v.value === sortBy)?.label,
            }}
            placeholder={t("select")}
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
          className="bg-green-400 rounded p-2 uppercase text-white font-black disabled:opacity-50 w-10 h-10 m-2 justify-center items-center flex text-2xl"
          onClick={onAdd}
        >
          <FaPlus />
        </button>
        <div className="max-h-[calc(100vh-215px)] h-[calc(100vh-215px)] overflow-auto">
          {buyers?.map((buyer) => {
            return (
              <div key={buyer.id}>
                <Link
                  to="/buyers/$buyerId"
                  params={{
                    buyerId: buyer.id,
                  }}
                  className="block py-2 px-3 text-blue-600 border-b bg-[#eee]"
                  activeProps={{
                    className: `font-bold bg-gray-100 !bg-gray-50`,
                  }}
                >
                  <div className="text-m">
                    {buyer.buyer_name || t("noName")}{" "}
                    {buyer.ident ? `(${buyer.ident})` : ""}
                    <MatchRoute
                      to="/buyers/$buyerId"
                      search={{
                        buyerId: buyer.id,
                      }}
                      params={{
                        buyerId: buyer.id,
                      }}
                      pending
                    ></MatchRoute>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
      <div className="flex-initial border-l h-[calc(100vh-53px)] overflow-auto w-full">
        <Outlet />
      </div>
    </div>
  );
}
