import { flexRender, Table } from "@tanstack/react-table";
import { FooterAddCell } from "./FooterAddCell";
import { CustomTableMeta } from "./TableCell";

export function CustomTable<TableItem>({ table }: { table: Table<TableItem> }) {
  const meta = table.options.meta as CustomTableMeta;

  return (
    <table>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th key={header.id}>
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </thead>
      <tbody>
        {table.getRowModel().rows.map((row) => (
          <tr key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <td key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      {meta?.onRemove && (
        <tfoot>
          <tr>
            <th colSpan={table.getCenterLeafColumns().length} align="right">
              <FooterAddCell table={table} />
            </th>
          </tr>
        </tfoot>
      )}
    </table>
  );
}
