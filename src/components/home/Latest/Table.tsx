"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { Fragment, type ReactNode, useState } from "react";

interface TableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  /** When provided, rows become expandable and this renders the expanded panel. */
  renderSubRow?: (row: TData) => ReactNode;
  /** Optional mobile layout override to avoid horizontal scrolling. */
  renderMobileRow?: (row: TData) => ReactNode;
  /** Optional per-row CSS class override (e.g. to highlight BUY rows). */
  getRowClassName?: (row: TData) => string;
}

export default function LatestTable<TData>({
  columns,
  data,
  renderSubRow,
  renderMobileRow,
  getRowClassName,
}: TableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    getRowCanExpand: () => Boolean(renderSubRow),
    state: { sorting, expanded },
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="space-y-3">
      {renderMobileRow && (
        <div className="lg:hidden space-y-3">
          {rows.length ? (
            rows
              .slice(0, 3)
              .map((row) => (
                <Fragment key={row.id}>
                  {renderMobileRow(row.original)}
                </Fragment>
              ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              داده‌ای یافت نشد
            </div>
          )}
        </div>
      )}

      <div
        className={`${renderMobileRow ? "hidden lg:block" : ""} overflow-hidden rounded-xl border border-border bg-background shadow-sm`}
      >
        <Table>
          <TableHeader className="bg-secondary ">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="border-b border-border hover:bg-transparent "
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-4 py-3 text-sm font-semibold text-right vazir-matn"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length ? (
              rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    className={`border-b border-border/50 transition-colors hover:bg-accent/10 ${getRowClassName?.(row.original) ?? ""}`}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-3 text-sm vazir-matn"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {renderSubRow && row.getIsExpanded() && (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={columns.length} className="p-0">
                        {renderSubRow(row.original)}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground vazir-matn"
                >
                  داده‌ای یافت نشد
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
