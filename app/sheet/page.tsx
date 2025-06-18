'use client';

import Spreadsheet from "react-spreadsheet";

import { useRouter } from 'next/navigation'
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/firebase-client";

export async function getUserRole(user: any) {
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    return userDoc.data().role;
  }
  return null;
}

async function getSheetByOwnerId(uid: string) {
  const sheetsRef = collection(db, "sheets");
  const q = query(sheetsRef, where("ownerId", "==", uid));
  const querySnapshot = await getDocs(q);

  // If you expect only one sheet per owner, you can return the first match:
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }
  return null;
}

export default function SpreadSheet() {
  const router = useRouter();
  const auth = getAuth();
  useEffect(() => {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("User is signed in:", user);
        const role = await getUserRole(user);
        console.log(`User role: ${role}`);
        if(role == "buyer"){

          const sheetData = await getSheetByOwnerId(user.uid);
          if (sheetData) {
            console.log("Sheet data for user:", sheetData);
            // You can redirect or perform other actions based on the sheet data
            // router.push(`/sheet/${sheetData.id}`);
          } else {
            console.log("No sheet found for this user.");
            // Optionally redirect to a page where they can create a new sheet
            // router.push('/create-sheet');
          }
  
        }
      } else {
        // User is signed out
        // ...
      }
    });
  }, []);

  const columnLabels = [
    "Make",
    "Model",
    "Specific Configuration",
    "Price Quote",
    "At Least 9/10 Without Retail Box",
    "Qty"
  ];

  const rowLabels = [];
  const data = [
    [{ value: "Bixolon" }, { value: "Srp-F310II" }, { value: "SRP-F310IICOSK" }],
    [{ value: "Brady" }, { value: "BMP51" }, { value: "139814" }],
  ];

  return (
    <div className="flex mt-13 justify-center min-h-screen">
      <Spreadsheet
        data={data}
        columnLabels={columnLabels}
        onCellCommit= {(prevCell, nextCell, coords) => {
          console.log("Cell commit event:", prevCell, nextCell, coords);
        }}
          // console.log(`Cell committed at row ${row}, column ${col}:`, cell);}}
      />
      </div>
  );
};

