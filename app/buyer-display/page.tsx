'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '../firebase/firebase-client';
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore';

function BuyerSheetView() {
  const searchParams = useSearchParams();
  const templateId = searchParams.get('templateId');

  const [mergedRows, setMergedRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (templateId) {
      loadMergedSheet(templateId);
    }
  }, [templateId]);

  const loadMergedSheet = async (templateId: string) => {
    const metadataSnap = await getDoc(doc(db, 'sheets-metadata', templateId));
    if (!metadataSnap.exists()) return;
    const metadata = metadataSnap.data();
  
    const buyerTemplateSnap = await getDoc(doc(db, 'buyers', metadata.buyerId, 'template-sheets', templateId));
    const buyerRows = buyerTemplateSnap.data()?.rows || [];
  
    // Load seller emails
    const sellerDocs = await Promise.all(
      metadata.sellerIds.map((id: string) => getDoc(doc(db, "users", id)))
    );
  
    const sellerMap = new Map(
      sellerDocs
        .filter(snap => snap.exists())
        .map(snap => [snap.id, snap.data()?.email || snap.id])
    );
  
    const sellerSheetSnaps = await Promise.all(
      metadata.sellerIds.map((sellerId: string) =>
        getDoc(doc(db, 'sellers', sellerId, 'copies', templateId))
          .then(snap => ({ sellerId, snap }))
      )
    );
  
    const sellerData = new Map<string, any[]>();
    for (const { sellerId, snap } of sellerSheetSnaps) {
      const rows = snap.exists() ? snap.data()?.rows || [] : [];
      sellerData.set(sellerId, rows);
    }
  
    const offers: any[] = [];
    for (const buyerRow of buyerRows) {
      for (const [sellerId, sellerRows] of sellerData.entries()) {
        const match = sellerRows.find((r: any) => r.rowId === buyerRow.rowId) || {};
        offers.push({
          rowId: buyerRow.rowId,
          make: buyerRow.make,
          model: buyerRow.model,
          config: buyerRow.config,
          price1: match.price1,
          qty1: match.qty1,
          price2: match.price2,
          qty2: match.qty2,
          price3: match.price3,
          qty3: match.qty3,
          substitution: match.substitution,
          notes: match.notes,
          sellerId: sellerMap.get(sellerId) || sellerId,
        });
      }
    }
  
    setMergedRows(offers);
    setLoading(false);
  };
  

  if (loading) return <div className="p-6">Loading sheet offers...</div>;
  if (!templateId) return <div className="p-6">Missing template ID.</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Offers for Template {templateId}</h1>
      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Row</th>
            <th className="p-2 border">Make</th>
            <th className="p-2 border">Model</th>
            <th className="p-2 border">Config</th>
            <th className="p-2 border">Seller</th>
            <th className="p-2 border">Price1</th>
            <th className="p-2 border">Qty1</th>
            <th className="p-2 border">Price2</th>
            <th className="p-2 border">Qty2</th>
            <th className="p-2 border">Price3</th>
            <th className="p-2 border">Qty3</th>
            <th className="p-2 border">Substitution</th>
            <th className="p-2 border">Notes</th>
          </tr>
        </thead>
        <tbody>
  {mergedRows.map((row, index) => {
    const prev = mergedRows[index - 1];
    const isNewGroup = !prev || prev.rowId !== row.rowId;
    const groupIndex = parseInt(row.rowId.replace("r", "")) || 0;
    const bg = groupIndex % 2 === 0 ? "bg-white" : "bg-gray-50";

    return (
      <tr key={index} className={`${bg} hover:bg-yellow-50`}>
        <td className="border p-1">{row.rowId.replace('r', '')}</td>
        <td className="border p-1">{row.make}</td>
        <td className="border p-1">{row.model}</td>
        <td className="border p-1">{row.config}</td>
        <td className="border p-1 text-xs">{row.sellerId}</td>
        <td className="border p-1">{row.price1}</td>
        <td className="border p-1">{row.qty1}</td>
        <td className="border p-1">{row.price2}</td>
        <td className="border p-1">{row.qty2}</td>
        <td className="border p-1">{row.price3}</td>
        <td className="border p-1">{row.qty3}</td>
        <td className="border p-1">{row.substitution}</td>
        <td className="border p-1">{row.notes}</td>
      </tr>
    );
  })}
</tbody>

      </table>
    </div>
  );
}

export default function Page(){

  return (
    <Suspense>
      <BuyerSheetView></BuyerSheetView>
    </Suspense>
  );
}