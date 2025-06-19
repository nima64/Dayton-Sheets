import * as React from "react";
import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    RowData
} from "@tanstack/react-table";

// Extend TableMeta to allow spreadsheet event handling
declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
        updateData: (rowIndex: number, columnId: string, value: unknown) => void
        onKeyUp?: SpreadSheetProps['onKeyUp'];
        onChange?: SpreadSheetProps['onChange'];
    }
        interface ColumnMeta<TData extends RowData, TValue> {
        readOnly?: boolean;
    }

}

type SpreadSheetProps = {
    data: GenericRow[];
    onKeyUp?: (e: React.KeyboardEvent) => void;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>, row: number, colId: string) => void;
    role?: 'buyer' | 'seller';
    columnIds?: string[];
};

export type GenericRow = {
    rowId: string;
    make: string;
    model: string;
    config: string;
    price1: string;
    qty1: string;
    price2: string;
    qty2: string;
    price3: string;
    qty3: string;
    substitution: string;
    notes: string;
};

const columnHelper = createColumnHelper<GenericRow>();

const getColumns = (role: 'buyer' | 'seller' = 'buyer') => [
    columnHelper.accessor("rowId", {
        header: "Row ID",
        size: 60,
        minSize: 50,
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

const defaultColumn: Partial<ColumnDef<GenericRow>> = {
    cell: ({ getValue, row: { index }, column, column: { id }, table }) => {
        const initialValue = getValue();
        const [value, setValue] = React.useState(initialValue);
        const readOnly = column.columnDef.meta?.readOnly;

        const onBlur = () => {
            if (!readOnly) {
                table.options.meta?.updateData(index, id, value);
            }
        };

        React.useEffect(() => {
            setValue(initialValue);
        }, [initialValue]);

        return (
            <input
                className={`w-full px-1 py-0.5 text-sm text-left border-0 bg-transparent focus:outline-none ${
                    readOnly ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'focus:bg-white focus:border focus:border-blue-300'
                }`}
                value={value as string}
                disabled={readOnly}
                onChange={e => {
                    if (!readOnly) {
                        setValue(e.target.value);
                        table.options.meta?.onChange?.(e, index, id);
                    }
                }}
                onBlur={onBlur}
                onKeyUp={table.options.meta?.onKeyUp}
            />
        );
    },
};

export default function CustomSpreadSheet({ data, onKeyUp, onChange, role = 'buyer' }: SpreadSheetProps) {
    const [localData, setLocalData] = React.useState<GenericRow[]>(data);

    React.useEffect(() => {
        setLocalData(data);
    }, [data]);

    const table = useReactTable({
        data: localData,
        columns: getColumns(role),
        defaultColumn,
        getCoreRowModel: getCoreRowModel(),
        columnResizeMode: 'onChange',
        meta: {
            updateData: (rowIndex, columnId, value) => {
                setLocalData(old =>
                    old.map((row, index) =>
                        index === rowIndex ? { ...row, [columnId]: value } : row
                    )
                );
            },
            onKeyUp,
            onChange,
        },
    });

    return (
        <div className="p-2 w-full overflow-auto h-svh scroll-snap-y-container">
            <div className="h-9/12 overflow-auto overflow-x-scroll border border-gray-300 rounded-sm">
                <table className="min-w-full bg-white text-sm" style={{ width: table.getCenterTotalSize() }}>
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr className="bg-gray-100 border-b" key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th
                                        key={header.id}
                                        className="border-r border-gray-300 last:border-r-0 p-1 text-left font-semibold text-gray-700 text-sm"
                                        style={{
                                            width: header.getSize(),
                                            minWidth: header.column.columnDef.minSize,
                                            maxWidth: header.column.columnDef.maxSize,
                                        }}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                {row.getVisibleCells().map(cell => (
                                    <td
                                        key={cell.id}
                                        className="border-r border-gray-200 last:border-r-0 p-0"
                                        style={{
                                            width: cell.column.getSize(),
                                            minWidth: cell.column.columnDef.minSize,
                                            maxWidth: cell.column.columnDef.maxSize,
                                        }}
                                    >
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
