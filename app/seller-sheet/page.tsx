// app/(your-path)/seller-sheet/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import CustomSpreadSheet from "@/components/custom-spreadsheet";
import { auth } from "../firebase/auth-service";
import { db } from "../firebase/firebase-client";

type Update = {
  rowId: string;
  col: string;
  value: string;
};

// In-memory queue of pending updates
const queue: Update[] = [];

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

  const [sheetRows, setSheetRows] = useState<any[]>([]);
  const [rowIds, setRowIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const hasMounted = useHasMounted();
  const [templateId, setTemplateId] = useState<string | null>(null);

  // 1) Grab templateId from URL
  useEffect(() => {
    const tid = params.get("templateId");
    if (tid) setTemplateId(tid);
  }, [params]);

  // 2) onAuthStateChanged → load & merge initial data → start retry loop
  useEffect(() => {
    if (!hasMounted || !templateId) return;

    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) return;

      // a) Load seller copy
      const sellerSnap = await getDoc(
        doc(db, "sellers", firebaseUser.uid, "copies", templateId)
      );
      if (!sellerSnap.exists()) {
        console.warn("No seller sheet found");
        setLoading(false);
        return;
      }
      const { buyerId, rows: sellerRows = [] } = sellerSnap.data()!;

      // b) Load buyer template
      const buyerSnap = await getDoc(
        doc(db, "buyers", buyerId, "template-sheets", templateId)
      );
      if (!buyerSnap.exists()) {
        console.warn("No buyer template found");
        setLoading(false);
        return;
      }
      const { rows: templateRows = [] } = buyerSnap.data()!;

      // c) Merge into one array
      const merged = templateRows.map((t: any) => {
        const match = sellerRows.find((r: any) => r.rowId === t.rowId) || {};
        return { ...t, ...match };
      });

      setSheetRows(merged);
      setRowIds(templateRows.map((r: any) => r.rowId));
      setLoading(false);

      // d) Kick off reliable retry loop
      startBatchRetry(firebaseUser.uid, templateId);
    });

    return () => unsub();
  }, [hasMounted, templateId]);

  // Show loading placeholder
  if (loading) {
    return <div className="p-4 text-center">Loading sheet…</div>;
  }

  // Render the sheet UI
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
        onChange={(e, rowIndex, col) => {
          const value = (e.target as HTMLInputElement).value;
          const rowId = rowIds[rowIndex];
          if (!rowId || !col) return;

          // 1) Enqueue the update
          queue.push({ rowId, col, value });

          // 2) Log it in the browser console immediately
          console.log(
            `%c[enqueued update] row=${rowId} col=${col} value="${value}"`,
            "color: teal; font-weight: bold;"
          );
        }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------------
// Reliable batch-update retry loop
// ---------------------------------------------------------------------------------
async function startBatchRetry(userId: string, templateId: string) {
  let backoff = 1000; // start at 1s

  while (true) {
    if (queue.length === 0) {
      // nothing to send → wait and reset backoff
      await sleep(2000);
      backoff = 1000;
      continue;
    }

    // Snapshot pending updates
    const updatesToSend = [...queue];

    try {
      console.groupCollapsed(
        `%c[batch-update] Sending ${updatesToSend.length} updates`,
        "color: purple; font-weight: bold;"
      );
      updatesToSend.forEach((u, i) =>
        console.log(`  [#${i}]`, u)
      );
      console.groupEnd();

      const resp = await fetch(
        `/api/sheet/batch-update?user=${userId}&templateId=${templateId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ op: "batch_update", data: { updates: updatesToSend } }),
        }
      );

      const result = await resp.json();

      if (resp.ok && result.success) {
        console.log(
          `%c[batch-update] Success: cleared ${updatesToSend.length} items`,
          "color: green;"
        );

        // Remove only the ones that succeeded (we assume all succeed if success===true)
        queue.splice(0, updatesToSend.length);
        backoff = 1000;
      } else {
        console.warn("%c[batch-update] Partial/Server error:", "color: orange;", result);
        // If server returned a list of `failed` updates, keep those
        const failed: Update[] = result.failed || updatesToSend;
        queue.splice(0, queue.length, ...failed);
        await sleep(backoff);
        backoff = Math.min(backoff * 2, 30000); // cap at 30s
      }
    } catch (networkErr) {
      console.error("%c[batch-update] Network error, retrying…", "color: red;", networkErr);
      await sleep(backoff);
      backoff = Math.min(backoff * 2, 30000);
    }
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------------
// useHasMounted hook (unchanged)
// ---------------------------------------------------------------------------------
function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);
  return hasMounted;
}
