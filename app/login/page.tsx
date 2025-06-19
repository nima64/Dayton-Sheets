"use client";
import { LoginForm } from "@/components/login-form";
import { useRouter } from 'next/navigation';
import { handleSignIn, useAuthStatus } from "../firebase/auth-service";
import { useEffect } from "react";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase-client";
import { User, UserCredential } from "firebase/auth";

export default function Login() {
  const router = useRouter();
  const user: User | null = useAuthStatus();
  // user.then((user: User | null) => {
  //   if (user) {
  //     user.ui
  //     console.log("User is logged in:", user);

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (!user) return;  // Now TypeScript knows user is User type after this checka
      console.log("User is logged in:", user);

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const role = userSnap.data().role;
          if (role === "buyer") {
            router.push("/buyer-dashboard");
          } else if (role === "seller") {
            router.push("/seller-dashboard");
          } else {
            console.warn("Unknown role:", role);
            router.push("/"); // fallback
          }
        } else {
          console.warn("User document not found");
          router.push("/");
        }
      } catch (error) {
        console.error("Error fetching user role:", error);
        router.push("/");
      }
    };

    checkRoleAndRedirect();
  }, [user, router]);

  if (user) return null;

  return (
    <div className="mt-30">
      <LoginForm onSubmit={handleSignIn} className="max-w-2xl mx-auto" />
    </div>
  );
}
