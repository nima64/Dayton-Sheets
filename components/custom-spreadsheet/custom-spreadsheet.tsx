import * as React from "react";
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getGroupedRowModel,
    RowData,
    getExpandedRowModel,
    GroupingState,
    ExpandedState,
    Table
} from "@tanstack/react-table";
import { GenericRow, SpreadsheetMeta, SpreadSheetProps } from "./spreadsheet.types";
import { useRef, useState } from "react";
import { getColumnsFromRole } from "./columns";
import { defaultColumn } from "./cell";
import { useSpreadsheetNavigation } from "../custom-spreadsheet/use-spreadsheet-navigation";



declare module '@tanstack/react-table' {
    interface TableMeta<TData extends RowData> extends SpreadsheetMeta<TData> { }
}


const ColumnLabels = <TData extends RowData>({table}:{table: Table<TData>}) => (
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
                    {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
            ))}
        </tr>
    ))

);

export default function CustomSpreadSheet({ data, onKeyUp, onChange, role }: SpreadSheetProps) {
    const [localData, setLocalData] = React.useState<GenericRow[]>(data);
    const [grouping, setGrouping] = React.useState<GroupingState>(['rowId']);
    const [expanded, setExpanded] = React.useState<ExpandedState>({});
    const tableRef = useRef<HTMLDivElement>(null);
    const { handleKeyDown } = useSpreadsheetNavigation(localData, tableRef);


    const table = useReactTable({
        data: localData,
        columns: getColumnsFromRole(role),
        state: {
            // grouping,
            // expanded,

        },
        defaultColumn,
        getCoreRowModel: getCoreRowModel(),
        // onGroupingChange: setGrouping,
        // onExpandedChange: setExpanded,
        // getGroupedRowModel: getGroupedRowModel(),
        getExpandedRowModel: getExpandedRowModel(),
        // Remove the problematic initialState
        // autoResetExpanded: false,
        // columnResizeMode: 'onChange',
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
            onKeyDown: handleKeyDown,
            onChange: onChange
        },
    });

    return (
        <div className="p-2 w-full overflow-auto h-svh scroll-snap-y-container">
            <div ref={tableRef} className="h-9/12 overflow-auto overflow-x-scroll border border-gray-300 rounded-sm">
                <table className="min-w-full bg-white text-sm" style={{ width: table.getCenterTotalSize() }}>
                    <thead>
                        <ColumnLabels table={table}/>
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
