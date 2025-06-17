"use client"
import { LoginForm } from "@/components/login-form";
import { useRouter } from 'next/navigation';
import { handleSignIn } from "../firebase/auth-service";



export default function Login() {
  let router  = useRouter();
  return (
    <div className="mt-30">
      <LoginForm onSubmit={handleSignIn} className="max-w-2xl mx-auto"/> 
    </div>
  );
}
