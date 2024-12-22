import { useNavigate } from "@tanstack/react-router";
import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useEffect, useMemo } from "react";
import {
  Seller,
  useRemoveSellerMutation,
  useUpdateSellerMutation,
} from "../utils/sellerService";
import { CustomTable } from "./CustomTable";
import { RemoveCell } from "./RemoveCell";
import { TableCell } from "./TableCell";

export function SellerTable(data: { seller: Seller }) {
  const defaultColumn: Partial<ColumnDef<Seller>> = {
    cell: TableCell,
  };

  const updateSellerMutation = useUpdateSellerMutation(
    data.seller.id,
    () => {}
  );

  const columns = useMemo<ColumnDef<Seller>[]>(
    () => [
      // {
      //   accessorKey: "id",
      //   header: () => "Id",
      //   meta: {
      //     readonly: true,
      //   },
      // },
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
    return [data.seller];
  }, [data.seller.id]);

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

  useEffect(() => {
    // table.reset();
  }, [data.seller.id]);
  return (
    <>
      <CustomTable table={table} />
    </>
  );
}
