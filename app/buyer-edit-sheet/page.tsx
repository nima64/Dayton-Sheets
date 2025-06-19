'use client';

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from 'next/navigation';
import { onAuthStateChanged } from "firebase/auth";
import {
  doc, getDoc, updateDoc, collection, getDocs, setDoc
} from "firebase/firestore";
import { auth } from "../firebase/auth-service";
import { db } from "../firebase/firebase-client";
import CustomSpreadSheet from "@/components/custom-spreadsheet";

function BuyerEditSheetPage() {
  const [userId, setUserId] = useState<string | null>(null);
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [rowIds, setRowIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [allSellers, setAllSellers] = useState<{ id: string, email: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const params = useSearchParams();
  const router = useRouter();
  const templateId = params.get("templateId");

  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (!user || !templateId) return;
      setUserId(user.uid);

      const sheetRef = doc(db, "buyers", user.uid, "template-sheets", templateId);
      const snap = await getDoc(sheetRef);
      if (!snap.exists()) return;

      const { rows = [], title = "", category = "" } = snap.data();
      setSheetData(rows);
      setRowIds(rows.map((r: any) => r.rowId));
      setTitle(title);
      setCategory(category);

      const metaRef = doc(db, "sheets-metadata", templateId);
      const metaSnap = await getDoc(metaRef);
      if (metaSnap.exists()) {
        const meta = metaSnap.data();
        setSelectedSellers(meta.sellerIds || []);
      }

      const usersRef = collection(db, "users");
      const usersSnap = await getDocs(usersRef);
      const sellerList = usersSnap.docs
        .filter(doc => doc.data().role === "seller")
        .map(doc => ({ id: doc.id, email: doc.data().email }));
      setAllSellers(sellerList);

      setLoading(false);
    });
  }, [templateId]);

  const toggleSellerSelection = (sellerId: string) => {
    setSelectedSellers(prev =>
      prev.includes(sellerId)
        ? prev.filter(id => id !== sellerId)
        : [...prev, sellerId]
    );
  };

  const handleSave = async () => {
    if (!userId || !templateId) return;

    try {
      await updateDoc(doc(db, "buyers", userId, "template-sheets", templateId), {
        title,
        category,
        rows: sheetData
      });

      const now = new Date().toISOString();
      for (const sellerId of selectedSellers) {
        const sellerRef = doc(db, "sellers", sellerId, "copies", templateId);
        const sellerSnap = await getDoc(sellerRef);

        if (sellerSnap.exists()) {
          const existingData = sellerSnap.data();
          const existingRows = existingData.rows || [];

          const updatedRows = sheetData.map(row => {
            const existing = existingRows.find((r: { rowId: string }) => r.rowId === row.rowId) || {};
            return { rowId: row.rowId, ...existing };
          });

          await setDoc(sellerRef, {
            ...existingData,
            rows: updatedRows,
            lastSynced: now
          });
        } else {
          const sellerRows = sheetData.map(row => ({ rowId: row.rowId }));
          await setDoc(sellerRef, {
            templateId,
            buyerId: userId,
            lastSynced: now,
            rows: sellerRows
          });
        }
      }

      await updateDoc(doc(db, "sheets-metadata", templateId), {
        title,
        category,
        sellerIds: selectedSellers,
        lastUpdated: now
      });

      alert("✅ Sheet and sellers updated!");
    } catch (err) {
      console.error("❌ Update failed", err);
      alert("Error saving sheet.");
    }
  };

  if (loading) return <div className="p-4 text-center">Loading...</div>;

  return (
    <div className="flex max-w-7xl mx-auto mt-10 p-4 space-x-4">
      <div className="w-3/4">
        <label className="block font-medium mb-2">Edit Sheet</label>
        <CustomSpreadSheet
          data={sheetData}
          columnIds={[
            "make", "model", "config",
            "price1", "qty1", "price2", "qty2",
            "price3", "qty3", "substitution", "notes"
          ]}
          role="buyer"
          onChange={(e, row, colId) => {
            const value = e.currentTarget.value;
            const newData = [...sheetData];
            newData[row] = { ...newData[row], [colId!]: value };
            setSheetData(newData);
          }}
        />
      </div>
      <div className="w-1/4 space-y-4">
        <div>
          <label className="block font-medium">Title</label>
          <input className="w-full p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium">Category</label>
          <input className="w-full p-2 border rounded" value={category} onChange={e => setCategory(e.target.value)} />
        </div>
        <div>
          <label className="block font-medium">Select Sellers</label>
          <ul className="space-y-1 max-h-48 overflow-auto mt-1">
            {allSellers.map(({ id, email }) => (
              <li key={id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedSellers.includes(id)}
                  onChange={() => toggleSellerSelection(id)}
                  className="mr-2"
                />
                {email}
              </li>
            ))}
          </ul>
        </div>
        <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Save & Sync
        </button>
        <button onClick={() => router.push('/buyer-dashboard')} className="bg-gray-500 text-white px-4 py-2 rounded w-full">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default function Page(){
  return (
    <Suspense>
      <BuyerEditSheetPage></BuyerEditSheetPage>
    </Suspense>
  )
}