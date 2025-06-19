'use client';
import { Suspense} from "react";
import BuyerEditSheetPage from "./seller-sheet-content"

export default function () {
  <Suspense fallback={<div className="p-6">Loading your sheet...</div>}>
    <BuyerEditSheetPage/>
  </Suspense>
}
