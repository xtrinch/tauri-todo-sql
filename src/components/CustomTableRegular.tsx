import { flexRender, Table } from "@tanstack/react-table";

export function CustomTable<TableItem>({
  table,
  trClassName,
  trhClassName,
  trfClassName,
}: {
  table: Table<TableItem>;
  trClassName?: string;
  trhClassName?: string;
  trfClassName?: string;
}) {
  return (
    <table style={{ tableLayout: "fixed" }}>
      <thead>
        {table.getHeaderGroups().map((headerGroup) => (
          <tr key={headerGroup.id} className={trhClassName}>
            {headerGroup.headers.map((header) => (
              <th
                key={header.id}
                style={{
                  width: `${header.getSize()}px`,
                  minWidth: `${header.getSize()}px`,
                  maxWidth: `${header.getSize()}px`,
                }}
                className="px-1 pb-1 align-bottom"
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
          <tr key={row.id} className={trClassName}>
            {row.getVisibleCells().map((cell) => (
              <td
                key={cell.id}
                style={{
                  width: `${cell.column.getSize()}px`,
                  minWidth: `${cell.column.getSize()}px`,
                  maxWidth: `${cell.column.getSize()}px`,
                }}
                className="px-1 pb-1 align-middle"
              >
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>
        {table.getFooterGroups().map((footerGroup) => (
          <tr key={footerGroup.id} className={trfClassName}>
            {footerGroup.headers.map((footer) => (
              <th
                key={footer.id}
                style={{
                  width: `${footer.getSize()}px`,
                  minWidth: `${footer.getSize()}px`,
                  maxWidth: `${footer.getSize()}px`,
                }}
                className="px-1 pb-1 align-bottom"
              >
                {footer.isPlaceholder
                  ? null
                  : flexRender(
                      footer.column.columnDef.footer,
                      footer.getContext()
                    )}
              </th>
            ))}
          </tr>
        ))}
      </tfoot>
    </table>
  );
}
