import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { GenericRow, userRole } from "./spreadsheet.types";

const columnHelper = createColumnHelper<GenericRow>();
const getColumnsFromRole = (role: userRole = 'buyer') => [
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


export { getColumnsFromRole};