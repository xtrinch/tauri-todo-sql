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
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { CustomTable } from "../../components/CustomTable";
import { RemoveCell } from "../../components/RemoveCell";
import { TableCell } from "../../components/TableCell";
import { TableCellCheckbox } from "../../components/TableCellCheckbox";
import {
  Seller,
  sellerQueryOptions,
  useRemoveSellerMutation,
  useUpdateSellerMutation,
} from "../../utils/sellerService";

export const Route = createFileRoute("/sellers/$sellerId")({
  params: {
    parse: (params) => ({
      sellerId: z.number().int().parse(Number(params.sellerId)),
    }),
    stringify: ({ sellerId }) => ({ sellerId: `${sellerId}` }),
  },
  component: SellerComponent,
  beforeLoad: ({ location, params }) => {
    const shouldRedirect = [`/sellers/${params.sellerId}`].includes(
      location.pathname
    );

    if (shouldRedirect) {
      redirect({
        to: "/sellers/$sellerId/edit-wood-pieces",
        throw: true,
        params: { sellerId: params.sellerId },
      });
    }
  },
});

function SellerComponent() {
  const { t } = useTranslation();

  const params = Route.useParams();
  const sellerQuery = useSuspenseQuery(sellerQueryOptions(params.sellerId));
  const seller = sellerQuery.data;

  const defaultColumn: Partial<ColumnDef<Seller>> = {
    cell: TableCell,
  };

  const updateSellerMutation = useUpdateSellerMutation(seller.id, () => {});

  const columns = useMemo<ColumnDef<Seller>[]>(
    () => [
      {
        accessorKey: "seller_name",
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

  const columns1 = useMemo<ColumnDef<Seller>[]>(
    () => [
      {
        accessorKey: "ident",
        header: () => t("ident"),
        meta: {},
        size: 100,
      },
      {
        accessorKey: "iban",
        header: () => t("iban"),
        meta: {},
        size: 300,
      },
      {
        accessorKey: "is_flat_rate",
        header: () => t("isFlatRate"),
        meta: {},
        size: 70,
        cell: TableCellCheckbox,
      },
      {
        accessorKey: "is_vat_liable",
        header: () => t("isVatLiable"),
        meta: {},
        size: 70,
        cell: TableCellCheckbox,
      },
      {
        accessorKey: "used_transport",
        header: () => t("usedTransport"),
        meta: {},
        size: 70,
        cell: TableCellCheckbox,
      },
    ],
    []
  );
  const navigate = useNavigate();
  const removeSellerMutation = useRemoveSellerMutation(() => {
    navigate({ to: "/sellers" });
  });

  const sellerData = useMemo(() => {
    return [seller];
  }, [JSON.stringify(seller)]);

  const table = useReactTable({
    data: sellerData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn,
    meta: {
      onEdit: (data: Seller) => {
        updateSellerMutation.mutate(data);
      },
      onRemove: (woodPieceId: number) => {
        removeSellerMutation.mutate({ id: woodPieceId });
      },
    },
  });

  const table1 = useReactTable({
    data: sellerData,
    columns: columns1,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn,
    meta: {
      onEdit: (data: Seller) => {
        updateSellerMutation.mutate(data);
      },
      onRemove: (woodPieceId: number) => {
        removeSellerMutation.mutate({ id: woodPieceId });
      },
    },
  });

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex flex-col space-y-3 p-3">
        <div>
          <CustomTable table={table} />
          <CustomTable table={table1} />
        </div>
      </div>
      <div className="flex flex-wrap divide-x border-b">
        {(
          [
            ["/sellers/$sellerId/edit-wood-pieces", t("editWoodPieces")],
            ["/sellers/$sellerId/wood-pieces-list", t("woodPieces")],
            ["/sellers/$sellerId/sold-pieces-list", t("soldWoodPieces")],
          ] as const
        ).map(([to, label]) => {
          return (
            <Link
              key={to}
              to={to}
              params={{
                sellerId: seller.id,
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
