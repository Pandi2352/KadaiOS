import type { ReactNode } from 'react';
import { cn } from '@kadai/ui';

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  align?: 'left' | 'right';
}

interface TableProps<T> {
  /** Describes the table for screen readers. */
  caption: string;
  columns: TableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  /** Dims rows while newer data loads. */
  isRefreshing?: boolean;
}

export function Table<T>({ caption, columns, rows, rowKey, isRefreshing = false }: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-md border border-line bg-surface" tabIndex={0} aria-label={caption}>
      <table className={cn('w-full border-collapse text-left', isRefreshing && 'opacity-60')} aria-busy={isRefreshing}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr className="border-b border-line">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-3 py-2 font-medium whitespace-nowrap text-muted',
                  column.align === 'right' && 'text-right',
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-line last:border-b-0">
              {columns.map((column) => (
                <td key={column.key} className={cn('px-3 py-2', column.align === 'right' && 'text-right')}>
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
