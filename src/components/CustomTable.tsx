import { flexRender, Row, Table } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { memo, ReactElement, useCallback, useRef } from "react";
import useFormTab from "../utils/useFormTab";

export function CustomTable<TableItem>({
  table,
  trClassName,
  trhClassName,
  trfClassName,
  containerClassName,
  sizeEstimate = 45,
  hasFooter,
  header,
}: {
  table: Table<TableItem>;
  trClassName?: string;
  trhClassName?: string;
  trfClassName?: string;
  containerClassName?: string;
  sizeEstimate?: number;
  hasFooter?: boolean;
  header?: ReactElement;
}) {
  useFormTab();
  const parentRef = useRef<HTMLDivElement>(null);
  const { rows } = table.getRowModel();
  const getItemKey = useCallback((index: number) => {
    return rows[index]?.id;
  }, []);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => sizeEstimate,
    overscan: 20,
    getItemKey: getItemKey,
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
      className={`${containerClassName || ""} overflow-auto will-change-transform contain-paint`}
    >
      {header || ""}
      <div
        style={{
          height: `${virtualizer.getTotalSize() + sizeEstimate + (hasFooter ? sizeEstimate : 0)}px`,
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
              if (!row) return <React.Fragment key={index}></React.Fragment>;
              return (
                <tr
                  key={row.id}
                  className={trClassName}
                  // style={{
                  //   height: `${virtualRow.size}px`,
                  // }}
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
          {hasFooter && (
            <tfoot>
              <>
                {table.getFooterGroups().map((footerGroup, index) => (
                  <tr
                    key={footerGroup.id}
                    className={`${trfClassName}`}
                    style={{
                      height: `${sizeEstimate}px`,
                    }}
                    ref={virtualizer.measureElement}
                    data-index={index}
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
            </tfoot>
          )}
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
