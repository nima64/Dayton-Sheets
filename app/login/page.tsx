"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc, query, where, collection, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebase-client";

export default function LoginPage() {
  const auth = getAuth();
  const router = useRouter();

  // form state
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"buyer" | "seller" | null>(null);

  // 1) Email entry
  if (step === "email") {
    return (
      <div className="max-w-sm mx-auto p-6">
        <h1 className="text-2xl font-semibold mb-4">Sign In</h1>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
          className="w-full border px-3 py-2 mb-4 rounded"
        />
        <button
          className="w-full bg-blue-600 text-white py-2 rounded"
          onClick={async () => {
            if (!email) return alert("Please enter your email");

            // Look up role by email in /users
            // If your users collection key is UID, do a where query:
            const q = query(collection(db, "users"), where("email", "==", email));
            const snaps = await getDocs(q);
            if (snaps.empty) {
              return alert("Email not registered");
            }

            const userDoc = snaps.docs[0];
            const userRole = userDoc.data().role as "buyer" | "seller";
            setRole(userRole);

            if (userRole === "seller") {
              // auto-sign in seller with default password
              try {
                await signInWithEmailAndPassword(auth, email, "123456");
                router.push("/seller-dashboard");
              } catch (err) {
                console.error(err);
                alert("Seller login failed. Please contact support.");
              }
            } else {
              // buyer: go to password step
              setStep("password");
            }
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  // 2) Buyer password
  return (
    <div className="max-w-sm mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Buyer Login</h1>
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border px-3 py-2 mb-4 rounded"
      />
      <button
        className="w-full bg-green-600 text-white py-2 rounded"
        onClick={async () => {
          if (!password) return alert("Please enter your password");
          try {
            await signInWithEmailAndPassword(auth, email, password);
            router.push("/buyer/dashboard");
          } catch (err) {
            console.error(err);
            alert("Buyer login failed. Check your credentials.");
          }
        }}
      >
        Sign In
      </button>
    </div>
  );
}
