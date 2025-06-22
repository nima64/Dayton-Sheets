'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SignupFormProps {
  heading?: string;
  onSignUp: (email: string, password: string, name?: string, router?: any, role?: "buyer" | "seller") => Promise<boolean>;
}

export default function SellerSignupForm({
  heading = "Create Seller Account",
  onSignUp: handleSignUp
}: SignupFormProps) {
  const [email, setEmail] = useState("");
  const router = useRouter();
  // fixed default password for all sellers
  const DEFAULT_PASSWORD = "123456";

  const onSubmit = async () => {
    if (!email) {
      alert("Please enter an email");
      return;
    }
    // attempt sign-up
    const success = await handleSignUp(
      email.trim().toLowerCase(),
      DEFAULT_PASSWORD,
      undefined,
      undefined,
      "seller"
    );
    if (success) {
      alert("Seller created! Default password is “123456”.");
      router.push("/login"); 
    } else {
      alert("Signup failed. Check console for details.");
    }
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="w-full max-w-sm bg-white p-6 rounded-md shadow-md">
        {heading && <h1 className="text-2xl font-semibold mb-4">{heading}</h1>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Seller Email</label>
            <Input
              type="email"
              placeholder="seller@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="text"
              value={DEFAULT_PASSWORD}
              disabled
              className="w-full bg-gray-100 text-gray-700"
            />
            <p className="text-xs text-gray-500 mt-1">
              All sellers share this default password.
            </p>
          </div>
          <Button onClick={onSubmit} className="w-full">
            Create Seller
          </Button>
        </div>

        <p className="mt-6 text-sm text-gray-500">
          After creating, sellers can log in via the{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login
          </a>{" "}
          page.
        </p>
      </div>
    </div>
  );
}
