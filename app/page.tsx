'use client';

import { useEffect, useState } from "react";
import { db } from "./firebase/firebase-client";
import {
  collection,
  getDocs,
  doc,
  CollectionReference,
} from "firebase/firestore";

export default function Home() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAllBuyersheets = async () => {
      try {
        const allBuyersheets: any[] = [];

        // Step 1: Get all sheet documents
        const sheetsSnapshot = await getDocs(collection(db, "sheets"));

        // Step 2: For each sheet, fetch its buyersheets subcollection
        for (const sheetDoc of sheetsSnapshot.docs) {
          const sheetId = sheetDoc.id;
          const buyersheetsRef = collection(
            db,
            `sheets/${sheetId}/buyersheets`
          );

          const buyersheetsSnapshot = await getDocs(buyersheetsRef);

          buyersheetsSnapshot.forEach((buyerDoc) => {
            allBuyersheets.push({
              sheetId,
              id: buyerDoc.id,
              ...buyerDoc.data(),
            });
          });
        }

        console.log("All buyersheets:", allBuyersheets);
        setData(allBuyersheets);
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      }
    };

    fetchAllBuyersheets();
  }, []);

  return (
    <main className="content">
      <h1>All Buyersheets (from all sheets)</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </main>
  );
}
