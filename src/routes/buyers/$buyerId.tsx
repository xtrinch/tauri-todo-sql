import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
  Link,
  Outlet,
  redirect,
  useNavigate,
} from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { CustomTable } from "../../components/CustomTable";
import { RemoveCell } from "../../components/RemoveCell";
import { TableCell } from "../../components/TableCell";
import {
  Buyer,
  buyerQueryOptions,
  useRemoveBuyerMutation,
  useUpdateBuyerMutation,
} from "../../utils/buyerService";

export const Route = createFileRoute("/buyers/$buyerId")({
  params: {
    parse: (params) => ({
      buyerId: z.number().int().parse(Number(params.buyerId)),
    }),
    stringify: ({ buyerId }) => ({ buyerId: `${buyerId}` }),
  },
  component: BuyerComponent,
  beforeLoad: ({ location, params }) => {
    const shouldRedirect = [`/buyers/${params.buyerId}`].includes(
      location.pathname
    );

    if (shouldRedirect) {
      redirect({
        to: "/buyers/$buyerId/wood-piece-offers-list",
        throw: true,
        params: { buyerId: params.buyerId },
      });
    }
  },
});

function BuyerComponent() {
  const { t } = useTranslation();

  const params = Route.useParams();
  const buyerQuery = useSuspenseQuery(buyerQueryOptions(params.buyerId));
  const buyer = buyerQuery.data;

  const defaultColumn: Partial<ColumnDef<Buyer>> = {
    cell: TableCell,
  };

  const updateBuyerMutation = useUpdateBuyerMutation(buyer.id, () => {});

  const columns = useMemo<ColumnDef<Buyer>[]>(
    () => [
      {
        accessorKey: "buyer_name",
        header: () => t("name"),
        meta: {},
        size: 200,
      },
      {
        accessorKey: "address_line1",
        header: () => t("addressLine1"),
        meta: {},
        size: 200,
      },
      {
        accessorKey: "address_line2",
        header: () => t("addressLine2"),
        meta: {},
        size: 200,
      },
      {
        id: "1",
        header: () => "",
        accessorFn: () => 1,
        meta: {
          readonly: true,
        },
        cell: RemoveCell,
      },
    ],
    []
  );
  const navigate = useNavigate();
  const removeBuyerMutation = useRemoveBuyerMutation({
    onSuccess: () => {
      navigate({ to: "/buyers" });
    },
    onError: () => {
      toast.error(t("couldNotDelete"));
    },
  });

  const buyerData = useMemo(() => {
    return [buyer];
  }, [JSON.stringify(buyer)]);

  const table = useReactTable({
    data: buyerData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn,
    meta: {
      onEdit: (data: Buyer) => {
        updateBuyerMutation.mutate(data);
      },
      onRemove: (woodPieceId: number) => {
        removeBuyerMutation.mutate({ id: woodPieceId });
      },
    },
  });

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex flex-col space-y-3 p-3">
        <h3>{t("buyer")}</h3>
        <CustomTable table={table} />
      </div>
      <div className="flex flex-wrap divide-x border-b">
        {(
          [
            ["/buyers/$buyerId/wood-piece-offers-list", t("woodPieceOffers")],
            ["/buyers/$buyerId/bought-pieces-list", t("boughtWoodPieces")],
          ] as const
        ).map(([to, label]) => {
          return (
            <Link
              key={to}
              to={to}
              params={{
                buyerId: buyer.id,
              }}
              className="p-2  text-blue-700"
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
