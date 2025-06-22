import { ColumnDef, createColumnHelper, RowData } from "@tanstack/react-table";
import { useState } from "react";

type userRole = 'buyer' | 'seller';


type Printer = {
    rowId: string;
    make: string;
    model: string;
    config: string;
    qty: string; // Optional field for quantity
    price: string; // Optional field for quantity
    seller: string; // Optional field for quantity
    [key: string]: any; // <-- Add this line
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

type SpreadSheetProps = {
    data: GenericRow[];
    onKeyUp?: (e: React.KeyboardEvent) => void;
    onKeyDown?: (e: React.KeyboardEvent, row:number, colId:string) => void;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>, row: number, colId: string) => void;
    role?: 'buyer' | 'seller';
    columnIds?: string[];
};

export interface BaseTableMeta<TData extends RowData> {
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
}

export interface SpreadsheetMeta<TData extends RowData> extends BaseTableMeta<TData> {
  onKeyUp?: (e: React.KeyboardEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent, row: number, colId: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>, row: number, colId: string) => void;
}




export type { Printer, SpreadSheetProps, userRole};
