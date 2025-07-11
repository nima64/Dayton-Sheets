import { GenericRow } from './spreadsheet.types';

/* Enable keyboard navigation on Spread sheet */
export const useSpreadsheetNavigation = (
  localData: GenericRow[],
  tableRef: React.RefObject<HTMLDivElement | null>
) =>  (
    e: React.KeyboardEvent,
    rowIndex: number,
    colID: string
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      const nextRowIndex = rowIndex + 1;
      if (nextRowIndex >= localData.length) return;

      const nextInput = tableRef.current?.querySelector<HTMLInputElement>(
        `input[data-row="${nextRowIndex}"][data-col="${colID}"]`
      );

      if (nextInput) {
        nextInput.focus();
        nextInput.select();
      }
    }
  }


