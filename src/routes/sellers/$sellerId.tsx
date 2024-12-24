import { useSuspenseQuery } from "@tanstack/react-query";
import {
  createFileRoute,
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
import { z } from "zod";
import { CustomTable } from "../../components/CustomTable";
import { RemoveCell } from "../../components/RemoveCell";
import { TableCell } from "../../components/TableCell";
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
        to: "/sellers/$sellerId/wood-pieces-list",
        throw: true,
        params: { sellerId: params.sellerId },
      });
    }
  },
});

function SellerComponent() {
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
        accessorKey: "name",
        header: () => "Name",
        meta: {},
      },
      {
        accessorKey: "address_line1",
        header: () => "Address line 1",
        meta: {},
      },
      {
        accessorKey: "address_line2",
        header: () => "Address line 2",
        meta: {},
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

  return (
    <div className="flex flex-col space-y-3">
      <h3>Seller</h3>
      <CustomTable table={table} />
      <h3>Wood pieces</h3>
      <Outlet />
    </div>
  );
}
