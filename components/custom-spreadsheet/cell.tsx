import { ColumnDef } from "@tanstack/react-table";
import { GenericRow } from "./spreadsheet.types";
import { useState } from "react";

// Defines what each Cell component is created
export const defaultColumn: Partial<ColumnDef<GenericRow>> = {
    cell: ({ getValue, row: { index: rowIdx }, column, column: {id: colIdx }, table }) => {
        const initialValue = getValue() ?? '';
        const [value, setValue] = useState(initialValue);
        const readOnly = column.columnDef.meta?.readOnly;

        return (
            <input
                data-row={rowIdx}
                data-col={colIdx}
                className={`w-full px-1 py-0.5 text-sm text-left border-0 bg-transparent focus:outline-none ${
                    readOnly ? 'text-gray-400 cursor-not-allowed bg-gray-100' : 'focus:bg-white focus:border focus:border-blue-300'
                }`}
                
                // "w-full px-2 py-1 font-medium text-left border-0 bg-transparent focus:bg-white focus:border focus:border-blue-300 focus:outline-none "
                value={value as string}
                onChange={e => {
                    if(column.columnDef.meta?.readOnly)
                        return

                    setValue(e.target.value);
                    // console.log(initialData[index][id]);
                    table.options.meta?.onChange && table.options.meta?.onChange(e, rowIdx, colIdx);
                    // table.options.meta?.updateData(index, id, e.target.value);

                }}
                onBlur={
                    (e) => {
                        console.log('triggered on blur');
                        // if(!column.columnDef.meta?.readOnly)
                        table.options.meta?.updateData(rowIdx, colIdx, e.target.value);
                    }
                }
                onKeyUp={table.options.meta?.onKeyUp}
                onKeyDown={(e) => table.options.meta?.onKeyDown && table.options.meta?.onKeyDown(e, rowIdx, colIdx)}
            />
        );
    },
};

