import { RowData } from "@tanstack/react-table";

type userRole = 'buyer' | 'seller';

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

export type BuyerDisplayRow = GenericRow & {
  sellerId: string;
};

type GenericSpreadSheetProps = {
    onKeyUp?: (e: React.KeyboardEvent) => void;
    onKeyDown?: (e: React.KeyboardEvent, row:number, colId:string) => void;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>, row: number, colId: string) => void;
    onBlur?: (e: React.FocusEvent<HTMLInputElement>, row: number, colId: string) => void;
    role?: 'buyer' | 'seller';
    columnIds?: string[];
}
export interface SpreadsheetMeta<TData extends RowData> extends BaseTableMeta<TData> {
  onKeyUp?: (e: React.KeyboardEvent) => void;
  onKeyDown?: (e: React.KeyboardEvent, row: number, colId: string) => void;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>, row: number, colId: string) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>, row: number, colId: string) => void;
}

type SpreadSheetProps = GenericSpreadSheetProps & {
    data: GenericRow[];};
  
type BuyerDisplaySpreadSheetProps = GenericSpreadSheetProps & {
    data: BuyerDisplayRow[];};

export interface BaseTableMeta<TData extends RowData> {
  updateData: (rowIndex: number, columnId: string, value: unknown) => void;
}





export type { SpreadSheetProps, BuyerDisplaySpreadSheetProps, userRole};
