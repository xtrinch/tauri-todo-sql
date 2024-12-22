import { flexRender, Table } from "@tanstack/react-table";
import { FooterAddCell } from "./FooterAddCell";
import { CustomTableMeta } from "./TableCell";

export function CustomTable<TableItem>({ table }: { table: Table<TableItem> }) {
  const meta = table.options.meta as CustomTableMeta;

  return (
    <table style={{ tableLayout: "fixed" }}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                style={{
                  width: `${header.getSize()}px`,
                  minWidth: `${header.getSize()}px`,
                  maxWidth: `${header.getSize()}px`,
                }}
              >
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
              <td
                key={cell.id}
                style={{
                  width: `${cell.column.getSize()}px`,
                  minWidth: `${cell.column.getSize()}px`,
                  maxWidth: `${cell.column.getSize()}px`,
                }}
                className="px-1"
              >
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
