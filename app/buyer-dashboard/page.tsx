'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from '../firebase/firebase-client';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function BuyerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [sheets, setSheets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadSheets(currentUser.uid);
        setLoading(false);
      }
    });
  }, []);

  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push('/');
  };

  const loadSheets = async (buyerId: string) => {
    const templatesRef = collection(db, 'buyers', buyerId, 'template-sheets');
    const snapshot = await getDocs(templatesRef);
    const sheetList = [];

    for (const docSnap of snapshot.docs) {
      const metaRef = doc(db, 'sheets-metadata', docSnap.id);
      const metaSnap = await getDoc(metaRef);
      sheetList.push({
        templateId: docSnap.id,
        title: metaSnap.exists() ? metaSnap.data().title : 'Untitled',
        category: metaSnap.exists() ? metaSnap.data().category : 'N/A',
      });
    }

    setSheets(sheetList);
  };

  if (loading) return <div className="p-6">Loading your created sheets...</div>;
  if (!user) return <div className="p-6">You must be signed in.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Your Created Sheets</h1>
        <div className="flex gap-2">
          <Link
            href="/create-sheet"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
          >
            + Create New Sheet
          </Link>
          <button
            onClick={handleSignOut}
            className="text-sm text-red-600 underline"
          >
            Sign Out
          </button>
        </div>
      </div>
      {sheets.length === 0 ? (
        <p>No sheets created yet.</p>
      ) : (
        <ul className="space-y-4">
          {sheets.map((sheet) => (
            <li key={sheet.templateId} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{sheet.title}</h2>
              <p className="text-sm text-gray-500">Category: {sheet.category}</p>
              <Link
                href={`/buyer-edit-sheet?templateId=${sheet.templateId}`}
                className="text-blue-600 underline text-sm"
              >
                Edit Sheet
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
