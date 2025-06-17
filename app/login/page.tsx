"use client"
import { LoginForm } from "@/components/login-form";
import { useRouter } from 'next/navigation';
import { handleSignIn, useAuthStatus } from "../firebase/auth-service";
import { useEffect } from "react";



export default function Login() {
  const router = useRouter();
  const user  = useAuthStatus()
  useEffect(() => {
    if (user) {
      // If the user is already logged in, redirect to the home page
      router.push('/');
    }
  },[user, router]);

  if (user) return null; // Optionally prevent rendering

  return (
    <div className="mt-30">
      <LoginForm onSubmit={handleSignIn} className="max-w-2xl mx-auto"/> 
    </div>
  );
}
