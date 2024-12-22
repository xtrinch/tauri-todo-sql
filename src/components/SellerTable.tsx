import {
  ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo } from "react";
import { Seller, useUpdateSellerMutation } from "../utils/sellerService";
import { CustomTable } from "./CustomTable";
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
    ],
    []
  );

  const sellerData = useMemo(() => [data.seller], [data.seller.id]);
  const table = useReactTable({
    data: sellerData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    defaultColumn,
    meta: {
      onEdit: (data: Seller) => {
        updateSellerMutation.mutate(data);
      },
    },
  });
  return (
    <>
      <CustomTable table={table} />
    </>
  );
}
