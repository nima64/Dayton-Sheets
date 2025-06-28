'use client';

import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { db } from '@/firebase/firebase-client';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SellerDashboard() {
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
    router.push('/'); // Redirect to home or login page
  };

  const loadSheets = async (sellerId: string) => {
    const copiesRef = collection(db, 'sellers', sellerId, 'copies');
    const snapshot = await getDocs(copiesRef);
    const sheetList = [];

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      const metaRef = doc(db, 'sheets-metadata', data.templateId);
      const metaSnap = await getDoc(metaRef);
      sheetList.push({
        templateId: data.templateId,
        title: metaSnap.exists() ? metaSnap.data().title : 'Untitled',
        category: metaSnap.exists() ? metaSnap.data().category : 'N/A',
      });
    }

    setSheets(sheetList);
  };

  if (loading) return <div className="p-6">Loading your sheets...</div>;
  if (!user) return <div className="p-6">You must be signed in.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Your Assigned Sheets</h1>
        <button
          onClick={handleSignOut}
          className="text-sm text-red-600 underline"
        >
          Sign Out
        </button>
      </div>
      {sheets.length === 0 ? (
        <p>No sheets assigned yet.</p>
      ) : (
        <ul className="space-y-4">
          {sheets.map((sheet) => (
            <li key={sheet.templateId} className="border p-4 rounded shadow">
              <h2 className="text-lg font-semibold">{sheet.title}</h2>
              <p className="text-sm text-gray-500">Category: {sheet.category}</p>
              <Link
                href={`/seller/sheet?templateId=${sheet.templateId}`}
                className="text-blue-600 underline text-sm"
              >
                Open Sheet
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
