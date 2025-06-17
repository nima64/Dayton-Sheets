'use client';

import Spreadsheet from "react-spreadsheet";
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth } from "../firebase/auth-service";
import { db } from "../firebase/firebase-client";


export default function SellerSheetPage() {
  const [sheetRows, setSheetRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
    const [hasRun, setHasRun] = useState(false);
  const [columnLabels, setColumnLabels] = useState([

    "Make",
    "Model",
    "Specific Configuration",
    "Price Quote",
    "At Least 9/10 Without Retail Box",
    "Qty"
  ]);

  const params = useSearchParams();
  const templateId = params.get("templateId");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("AUth changed!!")
      if (!(firebaseUser && templateId))
        return;
      console.log("Firebase User:", firebaseUser);
      // Step 1: Get seller copy
      const sellerRef = doc(db, "sellers", firebaseUser.uid, "copies", templateId);
      const sellerSnap = await getDoc(sellerRef);
      console.log("Seller Snapshot:", sellerSnap);
      if (!sellerSnap.exists()) {
        console.warn("No seller sheet found");
        setLoading(false);
        return;
      }


      const { buyerId, rows: sellerRows = [] } = sellerSnap.data();
      console.log("Seller Rows:", sellerRows);

      // Step 2: Get buyer template to fill static fields
      const buyerRef = doc(db, "buyers", buyerId, "template-sheets", templateId);
      const buyerSnap = await getDoc(buyerRef);
      if (!buyerSnap.exists()) {
        console.warn("No buyer template found");
        setLoading(false);
        return;
      }

      const { rows: templateRows = [] } = buyerSnap.data();

      // Step 3: Merge by rowId
      const merged = templateRows.map((templateRow: any) => {
        const sellerRow = sellerRows.find((r: any) => r.rowId === templateRow.rowId) || {};
        return [
          { value: templateRow.make || "" },
          { value: templateRow.model || "" },
          { value: templateRow.config || "" },
          { value: sellerRow.price || "" },
          { value: sellerRow.note || "" },
          { value: sellerRow.qty || "" }
        ];
      });

      setSheetRows(merged);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="p-4 text-center">Loading sheet...</div>;

  return (
    <div className="flex mt-13 justify-center min-h-screen">
      <Spreadsheet
        data={sheetRows}
        columnLabels={columnLabels}
      />
    </div>
  );
}