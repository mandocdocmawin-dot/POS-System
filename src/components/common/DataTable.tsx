import {useSearchParams} from 'react-router-dom';
import { useId, useState, type ReactNode } from "react";
export interface Column<T> {
  id: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
}
export function DataTable<T>({
  columns,
  rows,
  rowKey,
  caption,
  searchText,
  loading = false,
  error,
  selection,
  onSelectionChange,
  actions,
  onRowClick,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  caption: string;
  searchText?: (row: T) => string;
  loading?: boolean;
  error?: string;
  selection?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actions?: (row: T) => ReactNode;
  onRowClick?: (row:T)=>void;
}) {
  const id = useId();
  const [searchParams,setSearchParams]=useSearchParams();
  const query=searchParams.get('q')??'';
  const setQuery=(value:string)=>{setSearchParams(params=>{if(value)params.set('q',value);else params.delete('q');return params;},{replace:true});};
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState<{ id: string; direction: number }>({
    id: "",
    direction: 1,
  });
  const filtered = rows.filter(
    (r) =>
      !searchText || searchText(r).toLowerCase().includes(query.toLowerCase()),
  );
  const column = columns.find((c) => c.id === sort.id);
  if (column?.sortValue)
    filtered.sort((a, b) => {
      const x = column.sortValue!(a),
        y = column.sortValue!(b);
      return (
        (typeof x === "number" && typeof y === "number"
          ? x - y
          : String(x).localeCompare(String(y))) * sort.direction
      );
    });
  const pages = Math.max(1, Math.ceil(filtered.length / size)),
    current = Math.min(page, pages);
  const visible = filtered.slice((current - 1) * size, current * size);
  const selected = selection ?? [];
  const all =
    visible.length > 0 && visible.every((r) => selected.includes(rowKey(r)));
  const toggle = (key: string) =>
    onSelectionChange?.(
      selected.includes(key)
        ? selected.filter((k) => k !== key)
        : [...selected, key],
    );
  return (
    <div className="min-w-0">
      {searchText && (
        <div className="p-3">
          <label className="sr-only" htmlFor={id}>
            Search {caption}
          </label>
          <input
            id={id}
            className="w-full sm:max-w-sm"
            placeholder={`Search ${caption.toLowerCase()}…`}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
        </div>
      )}
      {error && (
        <p role="alert" className="p-4 text-red-500">
          {error}
        </p>
      )}
      <div className="w-full overflow-x-auto">
        <table
          className="w-full whitespace-nowrap text-left text-xs"
          aria-busy={loading}
        >
          <caption className="sr-only">{caption}</caption>
          <thead className="bg-slate-50 text-slate-500 dark:bg-slate-800/70">
            <tr>
              {onSelectionChange && (
                <th className="px-4">
                  <input
                    type="checkbox"
                    aria-label="Select visible rows"
                    checked={all}
                    onChange={() =>
                      onSelectionChange(
                        all
                          ? selected.filter(
                              (k) => !visible.some((r) => rowKey(r) === k),
                            )
                          : [...new Set([...selected, ...visible.map(rowKey)])],
                      )
                    }
                  />
                </th>
              )}
              {columns.map((c) => (
                <th
                  key={c.id}
                  scope="col"
                  className="px-4 py-3 font-medium"
                  aria-sort={
                    sort.id === c.id
                      ? sort.direction === 1
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                >
                  {c.sortValue ? (
                    <button
                      onClick={() =>
                        setSort({
                          id: c.id,
                          direction: sort.id === c.id ? -sort.direction : 1,
                        })
                      }
                    >
                      {c.header}{" "}
                      {sort.id === c.id
                        ? sort.direction === 1
                          ? "↑"
                          : "↓"
                        : "↕"}
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
              {actions && <th scope="col">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading
              ? Array.from({ length: 5 }, (_, i) => (
                  <tr key={i}>
                    <td colSpan={columns.length + 2} className="p-4">
                      <div className="h-5 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
                    </td>
                  </tr>
                ))
              : visible.map((r) => (
                  <tr
                    key={rowKey(r)}
                    onClick={e=>{if(!(e.target as HTMLElement).closest('a,button,input,select'))onRowClick?.(r);}}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    {onSelectionChange && (
                      <td className="px-4">
                        <input
                          type="checkbox"
                          aria-label={`Select ${searchText?.(r) ?? rowKey(r)}`}
                          checked={selected.includes(rowKey(r))}
                          onChange={() => toggle(rowKey(r))}
                        />
                      </td>
                    )}
                    {columns.map((c) => (
                      <td className="px-4 py-3" key={c.id}>
                        {c.cell(r)}
                      </td>
                    ))}
                    {actions && <td className="px-4 py-3">{actions(r)}</td>}
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
      {!loading && !visible.length && (
        <p className="p-10 text-center text-slate-500">No matching items.</p>
      )}
      {(searchText || onSelectionChange) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 p-3 text-xs dark:border-slate-800">
          <span>
            {filtered.length} items{" "}
            {onSelectionChange && `· ${selected.length} selected`}
          </span>
          <div className="flex items-center gap-3">
            <label>
              Rows{" "}
              <select
                aria-label="Rows per page"
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(1);
                }}
              >
                {[10, 25, 50].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <button
              className="btn"
              disabled={current === 1}
              onClick={() => setPage(current - 1)}
            >
              Previous
            </button>
            <span>
              {current} / {pages}
            </span>
            <button
              className="btn"
              disabled={current === pages}
              onClick={() => setPage(current + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
