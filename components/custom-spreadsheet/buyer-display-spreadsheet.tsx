import * as React from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    getGroupedRowModel,
    RowData,
    getExpandedRowModel,
    GroupingState,
    ExpandedState,
    getSortedRowModel,
    getFilteredRowModel,
    Row,
    createColumnHelper
} from "@tanstack/react-table";
import { BuyerDisplayRow, BuyerDisplaySpreadSheetProps, SpreadsheetMeta, SpreadSheetProps } from "./spreadsheet.types";
import { useRef, useState } from "react";
import { useSpreadsheetNavigation } from "./use-spreadsheet-navigation";
import { TableHeaderWithSortBtn } from "./columns";


const columnHelper = createColumnHelper<BuyerDisplayRow>(); // Replace YourDataType with your actual type

const columns = [
    columnHelper.accessor("rowId", {
        header: "Row ID",
        cell: (info) => info.getValue()?.toString().slice(1) || '',
    }),
    columnHelper.accessor("make", {
        header: "Make",
    }),
    columnHelper.accessor("model", {
        header: "Model",
    }),
    columnHelper.accessor("config", {
        header: "Configuration",
    }),
    columnHelper.accessor("sellerId", {
        header: "Seller Id",
    }),
    columnHelper.accessor("price1", {
        header: "Price Quote 9/10 no retail box",
    }),
    columnHelper.accessor("qty1", {
        header: "Qty",
    }),
    columnHelper.accessor("price2", {
        header: "Price Quote 10/10 no retail box",
    }),
    columnHelper.accessor("qty2", {
        header: "Qty",
    }),
    columnHelper.accessor("price3", {
        header: "Price Quote 9/10-10/10 with retail box",
    }),
    columnHelper.accessor("qty3", {
        header: "Qty",
    }),
    columnHelper.accessor("substitution", {
        header: "Substitution",
    }),
    columnHelper.accessor("notes", {
        header: "Notes",
    }),
];


// Default column configuration
const defaultColumn = {
    size: 120,
    minSize: 50,
    maxSize: 500,
};


declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> extends SpreadsheetMeta<TData> { }
}


export default function BuyerSpreadSheet({ data, onKeyUp, onBlur, onChange, role }: BuyerDisplaySpreadSheetProps) {
    const [localData, setLocalData] = React.useState<BuyerDisplayRow[]>(data);
    const [grouping, setGrouping] = React.useState<GroupingState>(['rowId']);
    const [expanded, setExpanded] = React.useState<ExpandedState>({});
    const tableRef = useRef<HTMLDivElement>(null);


    const table = useReactTable({
        data: data,
        initialState: {},
        state: {
            grouping,
            expanded,
        },
        columns: columns,
        defaultColumn,
        getCoreRowModel: getCoreRowModel(),
        onGroupingChange: setGrouping,
        onExpandedChange: setExpanded,
        getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSortedRowModel: getSortedRowModel(), //provide a sorting row model
        getFilteredRowModel: getFilteredRowModel(), // needed for client-side filtering
        autoResetExpanded: false,
        columnResizeMode: 'onChange',

        meta: {
            updateData: (rowIndex: number, columnId: string, value: unknown) => {
                // Performance Optimization
                // Pushes to next event loop tick
                setTimeout(() => {
                    console.log('update was triggered');
                    setLocalData(old =>
                        old.map((row, index) => {
                            if (index === rowIndex) {
                                return { ...old[rowIndex], [columnId]: value };
                            }
                            return row;
                        })
                    );
                }, 0);
            },
            onKeyUp,
            onKeyDown: useSpreadsheetNavigation(localData, tableRef),
            onChange,
            onBlur
        },
    });

    const RowToggleBtn = ({ cell, row }: { cell: any, row: Row<BuyerDisplayRow> }) => (
        <button onClick={row.getToggleExpandedHandler()}>{row.getIsExpanded() ? '▼' : '▶'}</button>
    );

    const CellAndDisplayFirstSubRow = (row: Row<BuyerDisplayRow>) => {
        const sortedRows = table.getSortedRowModel().rows;
        const sortedRow = sortedRows.find((sortedRow) => sortedRow.id == row.id);
        const firstRow = sortedRow != undefined ? sortedRow.subRows[0] : row.subRows[0];
        // show the first row of the grouped with the drop down icon
        if (row.getIsGrouped()) {
            return (
                firstRow.getAllCells().map(cell =>
                (<td
                    key={cell.id}
                    className="border-r border-gray-200 last:border-r-0 py-0.5 px-1"
                >
                    {(cell.column.id === "rowId" && row.subRows.length > 1) &&
                        (<RowToggleBtn cell={cell} row={row} />)
                    }
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>)
                )
            );
        }

        return (
            row.getVisibleCells().map(cell => (
                <td
                    key={cell.id}
                    className="border-r border-gray-200 last:border-r-0 py-0.5 px-1"
                    style={{
                        // width: cell.column.getSize(),
                        width: cell.column.columnDef.size,
                        minWidth: cell.column.columnDef.minSize,
                        maxWidth: cell.column.columnDef.maxSize,
                    }}
                >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
            ))
        );

    }


    return (
        <div className="p-2 w-full overflow-auto h-svh scroll-snap-y-container">
            <div ref={tableRef} className="h-9/12 overflow-auto overflow-x-scroll border border-gray-300 rounded-sm">
                <table className="min-w-full bg-white text-sm" style={{ width: table.getCenterTotalSize() }}>
                                       <thead>
                    {
                        table.getHeaderGroups().map(headerGroup => (
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
                                        {TableHeaderWithSortBtn(header)}
                                    </th>
                                ))}
                            </tr>
                        ))
                    }
                </thead>

                    <tbody className="divide-y divide-gray-200">
                        {table.getRowModel().rows.map(row => (


                            <tr key={row.id} className="hover:bg-gray-50">
                                {CellAndDisplayFirstSubRow(row)}
                            </tr>
                        ))}
                    </tbody>

                </table>
            </div>
        </div>
    );
}
