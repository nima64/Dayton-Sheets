'use client';

import Spreadsheet from "react-spreadsheet";

import { useRouter, useSearchParams } from 'next/navigation'
import { auth, useAuthStatus } from "../firebase/auth-service";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase-client";

export async function getUserRole(user:any) {
  const userDoc = await getDoc(doc(db, "users", user.uid));
  if (userDoc.exists()) {
    return userDoc.data().role;
  }
  return null;
}

export default function SpreadSheet (){
  const searchParams = useSearchParams();
  const router = useRouter();
  const user = useAuthStatus();


  const auth = getAuth();
  onAuthStateChanged(auth, async (user) => {

  if (user) {
    console.log("User is signed in:", user);

  const role  = await getUserRole(user);
  console.log(`User role: ${role}`);
  } else {
    // User is signed out
    // ...
  }
});


 useEffect(() => {
    console.log(`user: `,user);
    // if(!user)
    //     router.push('/');
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
    [{ value: "Bixolon" }, { value: "Srp-F310II" }, {value:"SRP-F310IICOSK"}],
    [{ value: "Brady" }, { value: "BMP51" }, {value:"139814"}],
  ];

  return (
    <div className="flex mt-13 justify-center min-h-screen">
    <Spreadsheet
      data={data}
      columnLabels={columnLabels}
    /></div>
  );
};

