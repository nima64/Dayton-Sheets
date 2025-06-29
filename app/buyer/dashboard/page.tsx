"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from "@/firebase/firebase-client";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
} from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

type SheetMeta = {
  templateId: string;
  title: string;
  category: string;
};

export default function BuyerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [sheets, setSheets] = useState<SheetMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await loadSheets(currentUser.uid);
      } else {
        setSheets([]);
      }
      setLoading(false);
    });
  }, []);

  const loadSheets = async (buyerId: string) => {
    const templatesRef = collection(db, "buyers", buyerId, "template-sheets");
    const snapshot = await getDocs(templatesRef);
    const sheetList: SheetMeta[] = [];

    for (const docSnap of snapshot.docs) {
      const metaRef = doc(db, "sheets-metadata", docSnap.id);
      const metaSnap = await getDoc(metaRef);

      sheetList.push({
        templateId: docSnap.id,
        title: metaSnap.exists() ? metaSnap.data().title : "Untitled",
        category: metaSnap.exists() ? metaSnap.data().category : "N/A",
      });
    }

    setSheets(sheetList);
  };

  const handleSignOut = async () => {
    const auth = getAuth();
    await signOut(auth);
    router.push("/");
  };

  const handleDelete = async (templateId: string) => {
    if (!user) return;
    if (
      !confirm(
        `Are you sure you want to permanently delete sheet "${templateId}"?`
      )
    )
      return;

    try {
      const buyerId = user.uid;

      // 1) Delete buyer template
      await deleteDoc(
        doc(db, "buyers", buyerId, "template-sheets", templateId)
      );

      // 2) Delete metadata
      await deleteDoc(doc(db, "sheets-metadata", templateId));

      // 3) Delete all seller copies
      //    We need to find which sellers have copies for this template
      //    (we stored seller IDs in metadata, but since we deleted it above,
      //     we can retrieve all folders under /sellers/*/copies/${templateId}).
      //    For simplicity, we can scan every seller user and attempt a delete:
      const usersSnap = await getDocs(collection(db, "users"));
      const deletePromises: Promise<void>[] = [];

      usersSnap.docs.forEach((userDoc) => {
        if (userDoc.data().role === "seller") {
          const copyRef = doc(
            db,
            "sellers",
            userDoc.id,
            "copies",
            templateId
          );
          // if it exists, delete it:
          deletePromises.push(deleteDoc(copyRef).catch(() => {}));
        }
      });

      await Promise.all(deletePromises);

      // 4) Refresh UI
      setSheets((prev) =>
        prev.filter((s) => s.templateId !== templateId)
      );
      alert("Sheet deleted.");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete sheet.");
    }
  };

  if (loading) return <div className="p-6">Loading your created sheets...</div>;
  if (!user) return <div className="p-6">You must be signed in.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-normal">created sheets</h1>
        <div className="flex gap-2">
          <Link
            href="/buyer/create-sheet"
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
            <li
              key={sheet.templateId}
              className="border p-4 rounded shadow flex justify-between items-start"
            >
              <div>
                <h2 className="text-lg font-semibold">{sheet.title}</h2>
                <p className="text-sm text-gray-500">
                  Category: {sheet.category}
                </p>
                <div className="flex gap-4 mt-2">
                  <Link
                    href={`/buyer/edit-sheet?templateId=${sheet.templateId}`}
                    className="text-blue-600 underline text-sm"
                  >
                    Edit Sheet
                  </Link>
                  <Link
                    href={`/buyer/display?templateId=${sheet.templateId}`}
                    className="text-green-600 underline text-sm"
                  >
                    View Offers
                  </Link>
                </div>
              </div>

              {/* DELETE BUTTON */}
              <button
                onClick={() => handleDelete(sheet.templateId)}
                className="text-red-600 text-sm font-medium hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
