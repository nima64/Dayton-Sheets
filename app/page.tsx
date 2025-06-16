'use client'; // For client-side in Next.js 13+

import { useEffect, useState } from "react";
import { db } from "./firebase/firebase-client";
import { ref, get, child } from "firebase/database";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const dbRef = ref(db);
  get(child(dbRef, `data`)).then((snapshot) => {
    if (snapshot.exists()) {
      console.log(snapshot.val());
      setData(snapshot.val());
    } else {
      console.log("No data available");
    }
  }).catch((error) => {
    console.error(error);
  });

  return (
    <main className="content">
      <h1>Realtime DB Example</h1>
      <pre>{data}</pre>
    </main>
  );
}