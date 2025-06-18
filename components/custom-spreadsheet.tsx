import * as React from "react";
import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
    RowData
} from "@tanstack/react-table";

declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> {
        updateData: (rowIndex: number, columnId: string, value: unknown) => void
    }
}

type Printer = {
    rowId: string;
    make: string;
    model: string;
    config: string;
    qty: string; // Optional field for quantity
};

const initialData: Printer[] = [
    { rowId: 'r1', make: 'HP', model: 'OfficeJet Pro 9015', config: 'Duplex',qty:"1" },
    { rowId: 'r2', make: 'Canon', model: 'PIXMA TR4520', config: 'Color',qty:"1" },
    { rowId: 'r3', make: 'Epson', model: 'EcoTank ET-2760', config: 'Wireless',qty:"1" },
    { rowId: 'r4', make: 'Brother', model: 'HL-L2350DW', config: 'Monochrome' ,qty:"1"},
    { rowId: 'r5', make: 'Lexmark', model: 'MS421dn', config: 'Duplex' ,qty:"1"},
];

const columnHelper = createColumnHelper<Printer>();

const columns = [
    columnHelper.accessor("rowId", {
        header: "Row ID",
        size: 80,        // Small size for ID column
        minSize: 60,     // Minimum width
        maxSize: 100,    // Maximum width
    }),
    columnHelper.accessor("make", {
        header: "Make",
        size: 120,
        minSize: 100,
        maxSize: 150,
    }),
    columnHelper.accessor("model", {
        header: "Model",
        size: 200,
        minSize: 150,
        maxSize: 250,
    }),
    columnHelper.accessor("config", {
        header: "Config",
        size: 120,
        minSize: 100,
        maxSize: 150,
    }),
        columnHelper.accessor("qty", {
        header: "Qty",
        size: 120,
        minSize: 100,
        maxSize: 150,
    }),
];

const defaultColumn: Partial<ColumnDef<Printer>> = {
    cell: ({ getValue, row: { index }, column: { id }, table }) => {
        const initialValue = getValue();
        const [value, setValue] = React.useState(initialValue);

        const onBlur = () => {
            table.options.meta?.updateData(index, id, value);
        };

        React.useEffect(() => {
            setValue(initialValue);
        }, [initialValue]);

        return (
            <input
                className="w-full px-2 py-1 font-medium text-left border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 focus:outline-none "
                value={value as string}
                onChange={e => setValue(e.target.value)}
                onBlur={onBlur}
            />
        );
    },
};

export default function CustomSpreadSheet() {
    const [data, setData] = React.useState<Printer[]>(initialData);

    const table = useReactTable({
        data,
        columns,
        defaultColumn,
        getCoreRowModel: getCoreRowModel(),
        columnResizeMode: 'onChange', // Enable column resizing
        meta: {
            updateData: (rowIndex: number, columnId: string, value: unknown) => {
                setData(old =>
                    old.map((row, index) => {
                        if (index === rowIndex) {
                            return {
                                ...old[rowIndex],
                                [columnId]: value,
                            };
                        }
                        return row;
                    })
                );
            },
        },
    });

    return (
        <div className="p-6">
            <div className="overflow-x-auto border border-gray-300 rounded-sm">
                <table className="min-w-full bg-white" style={{ width: table.getCenterTotalSize() }}>
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr className="bg-gray-100 border-b" key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th 
                                        key={header.id}
                                        className="border-r border-gray-300 last:border-r-0 p-2 text-left font-semibold text-gray-700"
                                        style={{
                                            width: header.getSize(),
                                            minWidth: header.column.columnDef.minSize,
                                            maxWidth: header.column.columnDef.maxSize,
                                        }}
                                    >
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        
                                        {/* Column resizer */}
                                        <div
                                            onMouseDown={header.getResizeHandler()}
                                            onTouchStart={header.getResizeHandler()}
                                            className={`absolute right-0 top-0 h-full w-1 bg-gray-400 cursor-col-resize hover:bg-blue-500 ${
                                                header.column.getIsResizing() ? 'bg-blue-500' : ''
                                            }`}
                                            style={{
                                                transform: header.column.getIsResizing()
                                                    ? `translateX(${table.getState().columnSizingInfo.deltaOffset}px)`
                                                    : '',
                                            }}
                                        />
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id} className="hover:bg-gray-50">
                                {row.getVisibleCells().map((cell) => (
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