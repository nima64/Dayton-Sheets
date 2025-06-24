'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/firebase-client";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import CustomSpreadSheet from '@/components/custom-spreadsheet/custom-spreadsheet';

export default function CreateSheet() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isBuyer, setIsBuyer] = useState(false);
  const [title, setTitle] = useState("June RFQ");
  const [category, setCategory] = useState("Printers");

  // will hold all seller IDs and their emails
  const [allSellers, setAllSellers] = useState<{ id: string; email: string }[]>([]);
  // we initialize selectedSellers to an empty array, then overwrite below
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);

  const [sheetDataFlat, setSheetDataFlat] = useState(() =>
    Array.from({ length: 250 }, (_, i) => ({
      rowId: `r${i + 1}`,
      make: '',
      model: '',
      config: '',
      price1: '',
      qty1: '',
      price2: '',
      qty2: '',
      price3: '',
      qty3: '',
      substitution: '',
      notes: ''
    }))
  );

  const columnIds = [
    "make", "model", "config",
    "price1","qty1","price2","qty2",
    "price3","qty3","substitution","notes",
  ];

  // On mount, watch auth and only fetch sellers for buyers
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      setUser(u);
      // check user role
      const userDoc = await getDoc(doc(db, "users", u.uid));
      const role = userDoc.exists() && userDoc.data().role;
      if (role === "buyer") {
        setIsBuyer(true);
        await fetchSellers();
      }
    });
    return () => unsub();
  }, []);

  // Fetch all sellers, then pre‐select them
  const fetchSellers = async () => {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);

    // filter + sort
    const sellers = snapshot.docs
      .filter(d => d.data().role === "seller")
      .map(d => ({ id: d.id, email: d.data().email }))
      .sort((a, b) => a.email.localeCompare(b.email));

    setAllSellers(sellers);
    // pre‐select all seller IDs:
    setSelectedSellers(sellers.map(s => s.id));
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

    // build rows
    const templateRows = sheetDataFlat.map((row, i) => ({
      rowId: `r${i+1}`,
      make: row.make,
      model: row.model,
      config: row.config,
      price1: "",
      qty1: "",
      price2: "",
      qty2: "",
      price3: "",
      qty3: "",
      substitution: "",
      notes: ""
    }));

    // save buyer template
    await setDoc(
      doc(db, "buyers", user.uid, "template-sheets", templateId),
      { title, createdAt: now, rows: templateRows }
    );

    // send copies to each selected seller
    for (const sellerId of selectedSellers) {
      const sellerRows = templateRows.map(r => ({ rowId: r.rowId }));
      await setDoc(
        doc(db, "sellers", sellerId, "copies", templateId),
        { templateId, buyerId: user.uid, lastSynced: now, rows: sellerRows }
      );
    }

    // write metadata
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
    router.push("/buyer-dashboard");
  };

  if (!isBuyer) {
    return <div className="p-4 text-center">Access restricted to buyers.</div>;
  }

  return (
    <div className="flex max-w-7xl mx-auto mt-10 p-4 space-x-4">
      <div className="w-3/4">
        <label className="block font-medium mb-2">Sheet Rows</label>
        <CustomSpreadSheet
          data={sheetDataFlat}
          columnIds={columnIds}
          onChange={(e, row, colId) => {
            const val = e.currentTarget.value;
            setSheetDataFlat(prev => {
              const next = [...prev];
              next[row] = { ...next[row], [colId!]: val };
              return next;
            });
          }}
        />
      </div>

      <div className="w-1/4 space-y-4">
        <div>
          <label className="block font-medium">Title</label>
          <input
            className="w-full p-2 border rounded"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="block font-medium">Category</label>
          <input
            className="w-full p-2 border rounded"
            value={category}
            onChange={e => setCategory(e.target.value)}
          />
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

        <button
          onClick={handleCreateSheet}
          className="bg-blue-600 text-white px-4 py-2 rounded w-full"
        >
          Create & Send
        </button>
        <button
          onClick={() => router.push('/buyer-dashboard')}
          className="bg-gray-500 text-white px-4 py-2 rounded w-full"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
