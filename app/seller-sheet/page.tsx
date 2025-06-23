// app/(your-folder)/seller-sheet/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, useRef, useCallback } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import CustomSpreadSheet from "@/components/custom-spreadsheet/custom-spreadsheet";
import { auth } from "../firebase/auth-service";
import { db } from "../firebase/firebase-client";

type Update = { rowId: string; col: string; value: string };

export default function Page() {
  return (
    <Suspense fallback={<p>Loading sheet…</p>}>
      <SellerSheetPage />
    </Suspense>
  );
}

function SellerSheetPage() {
  const params = useSearchParams();
  const router = useRouter();
  const templateId = params.get("templateId")!;
  const [sheetRows, setSheetRows] = useState<any[]>([]);
  const [rowIds, setRowIds]       = useState<string[]>([]);
  const [loading, setLoading]     = useState(true);

  // in-flight queue + debounce timer
  const queueRef = useRef<Update[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1) load & merge on auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async user => {
      if (!user) return;
      const sellerSnap = await getDoc(
        doc(db, "sellers", user.uid, "copies", templateId)
      );
      if (!sellerSnap.exists()) {
        console.warn("No seller sheet found");
        setLoading(false);
        return;
      }
      const { buyerId, rows: sellerRows = [] } = sellerSnap.data()!;
      const buyerSnap = await getDoc(
        doc(db, "buyers", buyerId, "template-sheets", templateId)
      );
      if (!buyerSnap.exists()) {
        console.warn("No buyer template found");
        setLoading(false);
        return;
      }
      const templateRows = buyerSnap.data()!.rows || [];
      const merged = templateRows.map((t: any) => {
        const match = sellerRows.find((r: any) => r.rowId === t.rowId) || {};
        return { ...t, ...match };
      });

      setSheetRows(merged);
      setRowIds(templateRows.map((r: any) => r.rowId));
      setLoading(false);
    });

    return () => unsub();
  }, [templateId]);

  // 2) Debounced batch‐update flush
  const flushUpdates = useCallback(async () => {
    const updates = [...queueRef.current];
    if (updates.length === 0) return;

    console.log("[batch] flushing", updates);
    try {
      const resp = await fetch(
        `/api/sheet/batch-update?user=${auth.currentUser?.uid}&templateId=${templateId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ op: "batch_update", data: { updates } }),
        }
      );
      const body = await resp.json();
      console.log("[batch] response", body);

      if (resp.ok && body.success) {
        // drop all succeeded
        queueRef.current = body.failed ?? [];
      } else {
        // keep failures retry next time
        queueRef.current = body.failed ?? updates;
      }
    } catch (err) {
      console.error("[batch] network error, will retry", err);
      // leave queueRef.current intact for next attempt
    }
  }, [templateId]);

  // 3) enqueue + debounce
  const enqueue = useCallback(
    (u: Update) => {
      queueRef.current.push(u);
      console.log("[enqueue]", u);

      if (timerRef.current) clearTimeout(timerRef.current);

      // wait 300ms after last keystroke
      timerRef.current = setTimeout(() => {
        flushUpdates();
      }, 300);
    },
    [flushUpdates]
  );

  // 4) render
  if (loading) {
    return <div className="p-4 text-center">Loading sheet…</div>;
  }

  return (
    <div className="flex flex-col items-center mt-8 space-y-4 px-4">
      <button
        onClick={() => router.push("/seller-dashboard")}
        className="self-start bg-blue-600 hover:bg-blue-700 text-white py-1.5 px-4 rounded"
      >
        ← Back to Dashboard
      </button>

      <CustomSpreadSheet
        data={sheetRows}
        role="seller"
        onChange={(e, rowIndex, colId) => {
          const value = (e.target as HTMLInputElement).value;
          console.log('key value', value);
          const rowId = rowIds[rowIndex];
          if (!rowId || !colId) return;
          enqueue({ rowId, col: colId, value });
        }}
      />
    </div>
  );
}
