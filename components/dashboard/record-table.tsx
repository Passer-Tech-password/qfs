import type { ReactNode } from "react";

export type RecordColumn<T> = {
  header: string;
  align?: "left" | "right";
  render: (row: T) => ReactNode;
};

export function RecordTable<T extends { id: string }>({
  columns,
  rows,
}: {
  columns: RecordColumn<T>[];
  rows: T[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[620px] border-collapse text-left">
        <thead>
          <tr className="border-b border-slate-100">
            {columns.map((column) => (
              <th
                key={column.header}
                scope="col"
                className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400 ${
                  column.align === "right" ? "text-right" : ""
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-slate-50 last:border-0">
              {columns.map((column) => (
                <td
                  key={column.header}
                  className={`px-4 py-3.5 align-middle text-[12.5px] text-slate-700 ${
                    column.align === "right" ? "text-right" : ""
                  }`}
                >
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

export function RecordTableMessage({
  tone = "muted",
  children,
}: {
  tone?: "muted" | "error";
  children: ReactNode;
}) {
  return (
    <p
      className={`px-2 py-10 text-center text-[12.5px] ${
        tone === "error" ? "text-rose-600" : "text-slate-500"
      }`}
    >
      {children}
    </p>
  );
}
