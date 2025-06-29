import { CellContext, ColumnDef, createColumnHelper, flexRender, Header, RowData, SortingFn, sortingFns } from "@tanstack/react-table";
import { GenericRow, userRole } from "./spreadsheet.types";
import { useState } from "react";


// Alternative: Custom sorting function that completely excludes empty strings
const sortExcludingEmpty: SortingFn<any> = (rowA, rowB, columnId) => {
    const aValue = rowA.getValue(columnId);
    const bValue = rowB.getValue(columnId);

    // Convert to strings for comparison
    const aStr = String(aValue || '').trim();
    const bStr = String(bValue || '').trim();

    // If either is empty, don't change their relative position
    if (aStr === '' || bStr === '') return 0;

    // For non-empty strings, use alphanumeric sorting
    return sortingFns.alphanumeric(rowA, rowB, columnId);
};

const columnHelper = createColumnHelper<GenericRow>();

const getColumnsFromRole = (role: userRole = 'buyer') => [
    columnHelper.accessor("rowId", {
        header: "Row",
        size: 30,
        minSize: 30,
        maxSize: 80,
        cell: ({ getValue }) => {
            const raw = getValue() as string;
            const parsed = raw.startsWith('r') ? raw.slice(1) : raw;
            return (
                <div className="px-1 py-0.5 text-gray-600 font-mono text-xs">
                    {parsed}
                </div>
            );
        },
    }),
    columnHelper.accessor("make", {
        header: "Make",
        size: 100,
        minSize: 80,
        maxSize: 120,
        meta: { readOnly: role === 'seller' },
    }),
    columnHelper.accessor("model", {
        header: "Model",
        size: 150,
        minSize: 120,
        maxSize: 200,
        meta: { readOnly: role === 'seller' },
    }),
    columnHelper.accessor("config", {
        header: "Specific Configuration",
        size: 150,
        minSize: 120,
        maxSize: 200,
        meta: { readOnly: role === 'seller' },
    }),
    columnHelper.accessor("price1", {
        header: "Price Quote 9/10 no retail box",
        size: 160,
        meta: { readOnly: role === 'buyer' },
    }),
    columnHelper.accessor("qty1", {
        header: "Qty",
        size: 60,
        meta: { readOnly: role === 'buyer' },
    }),
    columnHelper.accessor("price2", {
        header: "Price Quote 10/10 no retail box",
        size: 160,
        meta: { readOnly: role === 'buyer' },
    }),
    columnHelper.accessor("qty2", {
        header: "Qty",
        size: 60,
        meta: { readOnly: role === 'buyer' },
    }),
    columnHelper.accessor("price3", {
        header: "Price Quote 9/10-10/10 with retail box",
        size: 180,
        meta: { readOnly: role === 'buyer' },
    }),
    columnHelper.accessor("qty3", {
        header: "Qty",
        size: 60,
        meta: { readOnly: role === 'buyer' },
    }),
    columnHelper.accessor("substitution", {
        header: "Substitution Product(s)",
        size: 180,
        meta: { readOnly: role === 'buyer' },
    }),
    columnHelper.accessor("notes", {
        header: "Additional Notes",
        size: 180,
        meta: { readOnly: role === 'buyer' },
    }),
];


const TableHeaderWithSortBtn = <TData extends RowData>(header: Header<TData, unknown>) => (
    <div
        {...{
            className: header.column.getCanSort()
                ? 'cursor-pointer select-none'
                : '',
            onClick: header.column.getToggleSortingHandler(),
        }}
    >
        {flexRender(
            header.column.columnDef.header,
            header.getContext()
        )}
        {{
            asc: ' 🔼',
            desc: ' 🔽',
        }[header.column.getIsSorted() as string] ?? null}
    </div>
);


// cell moved into different function because its a react hook and has to follow Uppercase rule
function EditableCell({ getValue, row: { index: rowIdx }, column, column: { id: colIdx }, table }: CellContext<GenericRow, unknown>) {
  const initialValue = getValue() ?? '';
  const [value, setValue] = useState(initialValue);
  const readOnly = column.columnDef.meta?.readOnly;

  return (
    <input
      data-row={rowIdx}
      data-col={colIdx}
      className={`
        w-full px-1 py-0.5 text-sm text-left border-0 bg-transparent focus:outline-none ${
          readOnly 
            ? 'text-gray-400 cursor-not-allowed bg-gray-100' 
            : 'focus:bg-white focus:border focus:border-blue-300'
        }`}
      value={value as string}
      onChange={e => {
        if (column.columnDef.meta?.readOnly) return;
        setValue(e.target.value);
        table.options.meta?.onChange?.(e, rowIdx, colIdx);
      }}
      onBlur={e => {
        console.log('triggered on blur');
        table.options.meta?.updateData(rowIdx, colIdx, e.target.value);
        table.options.meta?.onBlur?.(e, rowIdx, colIdx);
      }}
      onKeyUp={table.options.meta?.onKeyUp}
      onKeyDown={e => table.options.meta?.onKeyDown?.(e, rowIdx, colIdx)}
    />
  );
}

const defaultColumn: Partial<ColumnDef<GenericRow>> = {
    cell: (props) => <EditableCell {...props}/>,
    sortingFn: sortExcludingEmpty
};

export { getColumnsFromRole, sortExcludingEmpty, defaultColumn, TableHeaderWithSortBtn };