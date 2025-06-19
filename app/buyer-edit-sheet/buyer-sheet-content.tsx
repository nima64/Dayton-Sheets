'use client';

import Spreadsheet from "react-spreadsheet";
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth } from "../firebase/auth-service";
import { db } from "../firebase/firebase-client";

export default function BuyerEditSheetPage() {
  const [sheetData, setSheetData] = useState<any[][]>([]);
  const [loading, setLoading] = useState(true);
  const [columnLabels, setColumnLabels] = useState([
    "Make",
    "Model",
    "Specific Configuration"
  ]);

  const params = useSearchParams();
  const templateId = params.get("templateId");

  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser || !templateId) return;

      setUserId(firebaseUser.uid);

      const buyerRef = doc(db, "buyers", firebaseUser.uid, "template-sheets", templateId);
      const buyerSnap = await getDoc(buyerRef);

      if (!buyerSnap.exists()) {
        console.warn("No sheet found for this buyer");
        setLoading(false);
        return;
      }

      const { rows = [] } = buyerSnap.data();
      const formattedData = rows.map((row: any) => [
        { value: row.make || "" },
        { value: row.model || "" },
        { value: row.config || "" }
      ]);

      setSheetData(formattedData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [templateId]);

  const handleSave = async () => {
    if (!userId || !templateId) return;

    const rowsToSave = sheetData.map((row, index) => ({
      rowId: `r${index + 1}`,
      make: row[0]?.value || "",
      model: row[1]?.value || "",
      config: row[2]?.value || "",
    }));

    const sheetRef = doc(db, "buyers", userId, "template-sheets", templateId);
    try {
      await updateDoc(sheetRef, { rows: rowsToSave });
      alert("✅ Sheet saved successfully!");
    } catch (error) {
      console.error("❌ Error saving sheet:", error);
      alert("Error saving sheet.");
    }
  };

  if (loading) return <div className="p-4 text-center">Loading sheet...</div>;

  return (
      <div className="max-w-4xl mx-auto mt-10 p-4">
        <h1 className="text-2xl font-bold mb-4">Edit Your Sheet</h1>
        <Spreadsheet
          data={sheetData}
          columnLabels={columnLabels}
          onChange={(newData) => setSheetData(newData)}
        />
        <button
          onClick={handleSave}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Sheet
        </button>
      </div>
  );
}
