'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  doc,
  getDoc,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/firebase/firebase-client';
import BuyerSpreadSheet from '@/components/custom-spreadsheet/buyer-display-spreadsheet';

function BuyerSheetView() {
  const params = useSearchParams();
  const templateId = params.get('templateId')!;
  const [buyerId, setBuyerId] = useState<string>();
  const [buyerRows, setBuyerRows] = useState<any[]>([]);
  const [sellerIds, setSellerIds] = useState<string[]>([]);
  const [sellerMap, setSellerMap] = useState<Record<string, string>>({});
  const [sellerCopies, setSellerCopies] = useState<Record<string, any[]>>({});
  const [mergedRows, setMergedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* Alternatively we could possiblity chain snapshots, then put them inside one another so they'll be
   called consecutively instead of a chain of useffects to reduce rendering */
  useEffect(() => {
    if (!templateId) return;
    const metaRef = doc(db, 'sheets-metadata', templateId);
    const unsubMeta = onSnapshot(metaRef, snap => {
      if (!snap.exists()) return;

      // Fetch seller emails once:
      (async () => {
        const data = snap.data();
        setBuyerId(data.buyerId);
        const ids = data.sellerIds || [];
        setSellerIds(ids);
        const map: Record<string, string> = {};
        await Promise.all(ids.map(async (id: string) => {
          const userSnap = await getDoc(doc(db, 'users', id));
          map[id] = userSnap.exists() ? (userSnap.data()?.email as string) : id;
        }));
        setSellerMap(map);
      })();

    });
    return () => unsubMeta();
  }, []);

  // 2) Listen to buyer template rows
  useEffect(() => {
    if (!templateId || !buyerId) return;
    const tplRef = doc(db, 'buyers', buyerId, 'template-sheets', templateId);
    const unsubTpl = onSnapshot(tplRef, snap => {
      setBuyerRows(snap.exists() ? snap.data()?.rows || [] : []);
      setLoading(false);
    });
    return () => unsubTpl();
  }, [sellerMap, templateId, buyerId]);

  // 3) For each sellerId, listen to its copy
  useEffect(() => {
    const unsubscribes: Unsubscribe[] = [];
    sellerIds.forEach(sellerId => {
      const copyRef = doc(db, 'sellers', sellerId, 'copies', templateId);
      const unsub = onSnapshot(copyRef, snap => {
        setSellerCopies(prev => ({
          ...prev,
          [sellerId]: snap.exists() ? snap.data()?.rows || [] : []
        }));
      });
      unsubscribes.push(unsub);
    });

    return () => unsubscribes.forEach(u => u());
  }, [sellerIds, templateId]);

  // 4) Merge whenever buyerRows or any sellerCopies change
useEffect(() => {
  if (!buyerRows.length) return;

  const merged: any[] = [];

  buyerRows.forEach((bRow: any) => {
    // Extract the product info
    const base = {
      rowId:    bRow.rowId,
      make:     bRow.make,
      model:    bRow.model,
      config:   bRow.config,
      // initialize all seller columns blank:
      price1:   "",
      qty1:     "",
      price2:   "",
      qty2:     "",
      price3:   "",
      qty3:     "",
      substitution: "",
      notes:    "",
      sellerId: ""   // can remain blank if no offers
    };

    // Collect any actual offers
    let sawOffer = false;
    sellerIds.forEach(sellerId => {
      const sRows = sellerCopies[sellerId] || [];
      const match = sRows.find(r => r.rowId === bRow.rowId) || {};
      const hasData = Boolean(
        match.price1    || match.qty1    ||
        match.price2    || match.qty2    ||
        match.price3    || match.qty3    ||
        match.substitution || match.notes
      );

      if (hasData) {
        sawOffer = true;
        merged.push({
          ...base,
          price1: match.price1 ?? "",
          qty1:   match.qty1   ?? "",
          price2: match.price2 ?? "",
          qty2:   match.qty2   ?? "",
          price3: match.price3 ?? "",
          qty3:   match.qty3   ?? "",
          substitution: match.substitution ?? "",
          notes:   match.notes   ?? "",
          sellerId: sellerMap[sellerId] || sellerId
        });
      }
    });

    // If *no* sellers offered, push the base row so the product still appears
    if (!sawOffer) {
      merged.push(base);
    }
  });

  setMergedRows(merged);
}, [buyerRows, sellerCopies, sellerIds, sellerMap]);

  if (loading) return <div className="p-6">Loading sheet offers…</div>;
  if (!templateId) return <div className="p-6">Missing template ID.</div>;

  return (<BuyerSpreadSheet
    data={mergedRows}
  />)

  // return (
  //   <div className="p-6 max-w-7xl mx-auto">
  //     <h1 className="text-2xl font-bold mb-4">
  //       Offers for Template {templateId}
  //     </h1>

  //     <table className="w-full text-sm border">
  //       <thead className="bg-gray-100">
  //         <tr>
  //           <th className="p-2 border">Row</th>
  //           <th className="p-2 border">Make</th>
  //           <th className="p-2 border">Model</th>
  //           <th className="p-2 border">Config</th>
  //           <th className="p-2 border">Seller</th>
  //           <th className="p-2 border">Price1</th>
  //           <th className="p-2 border">Qty1</th>
  //           <th className="p-2 border">Price2</th>
  //           <th className="p-2 border">Qty2</th>
  //           <th className="p-2 border">Price3</th>
  //           <th className="p-2 border">Qty3</th>
  //           <th className="p-2 border">Substitution</th>
  //           <th className="p-2 border">Notes</th>
  //         </tr>
  //       </thead>

  //       <tbody>
  //         {mergedRows.map((row, idx) => (
  //           <tr key={idx} className="hover:bg-gray-50">
  //             <td className="border p-1">{row.rowId.replace('r', '')}</td>
  //             <td className="border p-1">{row.make}</td>
  //             <td className="border p-1">{row.model}</td>
  //             <td className="border p-1">{row.config}</td>
  //             <td className="border p-1 text-xs">
  //               {sellerMap[row.sellerId] || row.sellerId}
  //             </td>
  //             <td className="border p-1">{row.price1}</td>
  //             <td className="border p-1">{row.qty1}</td>
  //             <td className="border p-1">{row.price2}</td>
  //             <td className="border p-1">{row.qty2}</td>
  //             <td className="border p-1">{row.price3}</td>
  //             <td className="border p-1">{row.qty3}</td>
  //             <td className="border p-1">{row.substitution}</td>
  //             <td className="border p-1">{row.notes}</td>
  //           </tr>
  //         ))}
  //       </tbody>
  //     </table>
  //   </div>
  // );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      <BuyerSheetView />
    </Suspense>
  );
}
