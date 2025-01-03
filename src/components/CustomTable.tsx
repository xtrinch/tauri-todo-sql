import { flexRender, Row, Table } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import { memo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { CustomTableMeta } from "./TableCell";

export function CustomTable<TableItem>({
  table,
  trClassName,
  trhClassName,
  trfClassName,
  containerClassName,
}: {
  table: Table<TableItem>;
  trClassName?: string;
  trhClassName?: string;
  trfClassName?: string;
  containerClassName?: string;
}) {
  const { t } = useTranslation();

  const parentRef = useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();
  const getItemKey = useCallback((index: number) => {
    return rows[index]?.id;
  }, []);

  const virtualizer = useVirtualizer({
    count:
      rows.length + ((table.options?.meta as CustomTableMeta).onAdd ? 1 : 0),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 45,
    overscan: 20,
    getItemKey: getItemKey,
    // scrollToFn: scrollToFn,
  });
  const items = virtualizer.getVirtualItems();

  const [paddingTop, paddingBottom] =
    items.length > 0
      ? [
          Math.max(0, items[0].start - virtualizer.options.scrollMargin),
          Math.max(0, virtualizer.getTotalSize() - items[items.length - 1].end),
        ]
      : [0, 0];

  return (
    <div
      ref={parentRef}
      className={`${containerClassName || ""} overflow-auto max-h-full will-change-transform contain-paint`}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize() + 45}px`,
          paddingTop,
          paddingBottom,
        }}
      >
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
            {virtualizer.getVirtualItems().map((virtualRow, index) => {
              const row = rows[virtualRow.index];
              if (!row)
                return (
                  <>
                    {table.getFooterGroups().map((footerGroup) => (
                      <tr
                        key={footerGroup.id}
                        className={trfClassName}
                        style={{
                          height: `${virtualRow.size}px`,
                        }}
                        data-index={index}
                        ref={virtualizer.measureElement}
                      >
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
                  </>
                );
              return (
                <tr
                  key={row.id}
                  className={trClassName}
                  style={{
                    height: `${virtualRow.size}px`,
                  }}
                  data-index={index}
                  ref={virtualizer.measureElement}
                >
                  <MemoizedListItem
                    row={row}
                    isScrolling={virtualizer.isScrolling}
                  />
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const MemoizedListItem = memo(
  ({ row, isScrolling }: { row: Row<any>; isScrolling: boolean }) => {
    return (
      <>
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
            {flexRender(cell.column.columnDef.cell, {
              ...cell.getContext(),
              isScrolling: isScrolling,
            })}
          </td>
        ))}
      </>
    );
  }
);
