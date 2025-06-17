'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/firebase-client";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import Spreadsheet from "react-spreadsheet";

export default function CreateSheet() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isBuyer, setIsBuyer] = useState(false);
  const [title, setTitle] = useState("June RFQ");
  const [category, setCategory] = useState("Printers");
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [allSellers, setAllSellers] = useState<{ id: string, email: string }[]>([]);
  const [sheetData, setSheetData] = useState<any[][]>([
    [{ value: "" }, { value: "" }, { value: "" }],
    [{ value: "" }, { value: "" }, { value: "" }],
  ]);

  const columnLabels = ["Make", "Model", "Specific Configuration"];

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const role = await getUserRole(user);
        if (role === "buyer") {
          setIsBuyer(true);
          await fetchSellers();
        }
      }
    });
  }, []);

  const getUserRole = async (user: any) => {
    const userDoc = await getDoc(doc(db, "users", user.uid));
    if (userDoc.exists()) {
      return userDoc.data().role;
    }
    return null;
  };

  const fetchSellers = async () => {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const sellers = snapshot.docs
      .filter(doc => doc.data().role === "seller")
      .map(doc => ({ id: doc.id, email: doc.data().email }));
    setAllSellers(sellers);
  };

  const toggleSellerSelection = (sellerId: string) => {
    setSelectedSellers(prev =>
      prev.includes(sellerId)
        ? prev.filter(id => id !== sellerId)
        : [...prev, sellerId]
    );
  };

  const handleCreateSheet = async () => {
    if (!user || !isBuyer) return;

    const templateId = `template-${uuidv4()}`;
    const now = new Date().toISOString();

    const templateRows = sheetData.map((row, index) => ({
      rowId: `r${index + 1}`,
      make: row[0]?.value || "",
      model: row[1]?.value || "",
      config: row[2]?.value || "",
    }));

    try {
      await setDoc(doc(db, "buyers", user.uid, "template-sheets", templateId), {
        title,
        createdAt: now,
        rows: templateRows
      });

      for (const sellerId of selectedSellers) {
        const sellerRows = templateRows.map(row => ({ rowId: row.rowId }));
        await setDoc(doc(db, "sellers", sellerId, "copies", templateId), {
          templateId,
          buyerId: user.uid,
          lastSynced: now,
          rows: sellerRows
        });
      }

      await setDoc(doc(db, "sheets-metadata", templateId), {
        templateId,
        buyerId: user.uid,
        title,
        createdAt: now,
        status: "open",
        sellerIds: selectedSellers,
        category
      });

      console.log("✅ Sheet created and distributed.");
      router.push("/sheet");
    } catch (error) {
      console.error("❌ Failed to create sheet:", error);
    }
  };

  if (!isBuyer) return <div className="p-4 text-center">Access restricted to buyers.</div>;

  return (
    <div className="max-w-4xl mx-auto mt-10 p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Sheet</h1>
      <div className="mb-2">
        <label className="block font-medium">Title</label>
        <input className="w-full p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} />
      </div>
      <div className="mb-2">
        <label className="block font-medium">Category</label>
        <input className="w-full p-2 border rounded" value={category} onChange={e => setCategory(e.target.value)} />
      </div>
      <div className="mb-4">
        <label className="block font-medium">Select Sellers</label>
        <ul className="space-y-1 mt-2">
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
      <div className="mb-6">
        <label className="block font-medium mb-2">Sheet Rows</label>
        <Spreadsheet
          data={sheetData}
          columnLabels={columnLabels}
          onChange={(newData) => setSheetData(newData)}
        />
      </div>
      <button onClick={handleCreateSheet} className="bg-blue-600 text-white px-4 py-2 rounded">Create & Send</button>
    </div>
  );
}
