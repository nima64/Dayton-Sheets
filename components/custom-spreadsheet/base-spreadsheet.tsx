import * as React from "react";
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    RowData,
    getExpandedRowModel,
    Table,
    getSortedRowModel,
    SortingFn
} from "@tanstack/react-table";
import { GenericRow, SpreadsheetMeta, SpreadSheetProps } from "./spreadsheet.types";
import { useRef } from "react";
import { getColumnsFromRole, defaultColumn, TableHeaderWithSortBtn } from "./columns";
import { useSpreadsheetNavigation } from "../custom-spreadsheet/use-spreadsheet-navigation";

// meta options
declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> extends SpreadsheetMeta<TData> {
    }
    // THIS IS THE MISSING PART - ColumnMeta interface extension
    interface ColumnMeta<TData, TValue> {
        readOnly?: boolean;
        // Add any other column-specific properties you need
    }

}

export default function CustomSpreadSheet({ data, onKeyUp,onBlur, onChange, role }: SpreadSheetProps) {
    const [localData, setLocalData] = React.useState<GenericRow[]>(data);
    const tableRef = useRef<HTMLDivElement>(null);


    const table = useReactTable({
        data: localData,
        columns: getColumnsFromRole(role),
        state: {},
        defaultColumn,
        getCoreRowModel: getCoreRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        getSortedRowModel: getSortedRowModel(), //provide a sorting row model
        meta: {
            updateData: (rowIndex: number, columnId: string, value: unknown) => {
                // Performance Optimization
                // Pushes to next event loop tick
                setTimeout(() => {
                    // console.log('update was triggered');
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
            onBlur,
            onChange: onChange,

        },
    });

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
