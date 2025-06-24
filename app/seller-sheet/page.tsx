"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import CustomSpreadSheet from "@/components/custom-spreadsheet/custom-spreadsheet";
import { auth } from "../firebase/auth-service";
import { db } from "../firebase/firebase-client";


const queuedCells = new Map<string, any>();
const processedCells = new Map<string, any>(); // Pending API updates


function startBatchUpdater(userId: string, templateId: string) {
  setInterval(() => {
    if (queuedCells.size === 0) return;

    // Move user changes to processed
    queuedCells.forEach((update, key) => {
      processedCells.set(key, update); // Latest value wins
    });

    queuedCells.clear();

    const updates = Array.from(processedCells.values());

    fetch(`/api/sheet/batch-update?user=${userId}&templateId=${templateId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ op: "batch_update", data: { updates } }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Update success:", data);
        processedCells.clear();

      })
      .catch((err) => {
        console.error("Update failed:", err);
        //TODO: will it still work if a fetch fails?
        // maybe dump processed cells back into que  
        processedCells.forEach((update, key) => {
          queuedCells.set(key, update); 
        });
      })
      }, 3000);
}

function SellerSheetPage() {
  const [sheetRows, setSheetRows] = useState<any[]>([]);
  const [rowIds, setRowIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const params = useSearchParams();
  const router = useRouter();
  const hasMounted = useHasMounted();

  const [templateId, setTemplateId] = useState<string | null>(null);

  useEffect(() => {
    if (params.get("templateId")) {
      setTemplateId(params.get("templateId"));
    }
  }, [params]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!hasMounted || !templateId) return;
      if (!(firebaseUser && templateId)) return;

      const sellerRef = doc(
        db,
        "sellers",
        firebaseUser.uid,
        "copies",
        templateId
      );
      const sellerSnap = await getDoc(sellerRef);
      if (!sellerSnap.exists()) {
        console.warn("No seller sheet found");
        setLoading(false);
        return;
      }

      const { buyerId, rows: sellerRows = [] } = sellerSnap.data();
      const buyerRef = doc(
        db,
        "buyers",
        buyerId,
        "template-sheets",
        templateId
      );
      const buyerSnap = await getDoc(buyerRef);
      if (!buyerSnap.exists()) {
        console.warn("No buyer template found");
        setLoading(false);
        return;
      }

      const { rows: templateRows = [] } = buyerSnap.data();

      const mergedRows = templateRows.map((templateRow: any) => {
        const sellerRow =
          sellerRows.find((r: any) => r.rowId === templateRow.rowId) || {};
        return {
          rowId: templateRow.rowId,
          make: templateRow.make || "",
          model: templateRow.model || "",
          config: templateRow.config || "",
          price1: sellerRow.price1 || "",
          qty1: sellerRow.qty1 || "",
          price2: sellerRow.price2 || "",
          qty2: sellerRow.qty2 || "",
          price3: sellerRow.price3 || "",
          qty3: sellerRow.qty3 || "",
          substitution: sellerRow.substitution || "",
          notes: sellerRow.notes || "",
        };
      });

      const ids = templateRows.map((r: any) => r.rowId);

      setSheetRows(mergedRows);
      setRowIds(ids);

      startBatchUpdater(firebaseUser.uid, templateId);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [hasMounted, templateId]);


  if (loading) return <div className="p-4 text-center">Loading sheet...</div>;

  return (
    <div className="flex flex-col items-center mt-8 min-h-screen space-y-4 px-4">
      <button
        onClick={() => router.push("/seller-dashboard")}
        className="self-start bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded"
      >
        ← Back to Dashboard
      </button>
      <CustomSpreadSheet
        data={sheetRows}
        role="seller"
        onChange={(e, row, col) => {
          const value = e.currentTarget.value;
          const rowId = rowIds[row];
          if (!rowId) return;
          queuedCells.set(`${row}|${col}`, { rowId, col, value });
          console.log('adding cells', [...queuedCells].map((b) => b[1].value));
        }}
      />

    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading weather...</p>}>
      <SellerSheetPage></SellerSheetPage>
    </Suspense>
  )
}

function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}
