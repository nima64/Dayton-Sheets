'use client';

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase/firebase-client";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import CustomSpreadSheet from '@/components/custom-spreadsheet';

export default function CreateSheet() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isBuyer, setIsBuyer] = useState(false);
  const [title, setTitle] = useState("June RFQ");
  const [category, setCategory] = useState("Printers");
  const [selectedSellers, setSelectedSellers] = useState<string[]>([]);
  const [allSellers, setAllSellers] = useState<{ id: string, email: string }[]>([]);
  const [sheetDataFlat, setSheetDataFlat] = useState(() => {
    return Array.from({ length: 250 }, (_, i) => ({
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
    }));
  });

  const columnLabels = ["Make", "Model", "Specific Configuration"];
  const columnIds = [
    "make",
    "model",
    "config",
    "price1",
    "qty1",
    "price2",
    "qty2",
    "price3",
    "qty3",
    "substitution",
    "notes",
  ];

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
    return userDoc.exists() ? userDoc.data().role : null;
  };

  const fetchSellers = async () => {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    const sellers = snapshot.docs
      .filter(doc => doc.data().role === "seller")
      .map(doc => ({ id: doc.id, email: doc.data().email }))
      .sort((a, b) => a.email.localeCompare(b.email));
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

    const templateRows = sheetDataFlat.map((row, index) => ({
      rowId: `r${index + 1}`,
      make: row.make || "",
      model: row.model || "",
      config: row.config || "",
      price1: "",
      qty1: "",
      price2: "",
      qty2: "",
      price3: "",
      qty3: "",
      substitution: "",
      notes: ""
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
      router.push("/buyer-dashboard");
    } catch (error) {
      console.error("❌ Failed to create sheet:", error);
    }
  };

  if (!isBuyer) return <div className="p-4 text-center">Access restricted to buyers.</div>;

  return (
    <div className="flex max-w-7xl mx-auto mt-10 p-4 space-x-4">
      <div className="w-3/4">
        <label className="block font-medium mb-2">Sheet Rows</label>
        <CustomSpreadSheet
          data={sheetDataFlat}
          columnIds={columnIds}
          onChange={(e, row, colId) => {
            const value = e.currentTarget.value;
            const newData = [...sheetDataFlat];
            newData[row] = { ...newData[row], [colId!] : value };
            setSheetDataFlat(newData);
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
        <button onClick={handleCreateSheet} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
          Create & Send
        </button>
        <button onClick={() => router.push('/buyer-dashboard')} className="bg-gray-500 text-white px-4 py-2 rounded w-full">
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
