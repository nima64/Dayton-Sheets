'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { SelectDemo } from "./role-select";
import { useRouter } from "next/navigation";

interface Signup1Props {
  heading?: string;
  logo?: {
    url: string;
    src: string;
    alt: string;
    title?: string;
  };
  signupText?: string;
  googleText?: string;
  loginText?: string;
  loginUrl?: string;
  onSignUp?: any;
}

export default function SignupForm({
  heading,
  logo = {
    url: "https://www.shadcnblocks.com",
    src: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblockscom-wordmark.svg",
    alt: "logo",
    title: "shadcnblocks.com",
  },
  googleText = "Sign up with Google",
  signupText = "Create an account",
  loginText = "Already have an account?",
  loginUrl = "/login",
  onSignUp: handleSignUp
}: Signup1Props) {
  const [email, setEmail] = useState("");
  const [userRole, setUserRole] = useState("buyer");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async () => {
    const success = await handleSignUp(email, password, undefined, undefined, userRole);
    if (success) {
      router.push("/login");
    }
  };

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex w-full max-w-sm flex-col items-center gap-y-8 rounded-md border border-muted bg-white px-6 py-12 shadow-md">
        <div className="flex flex-col items-center gap-y-2">
          {heading && <h1 className="text-3xl font-semibold">{heading}</h1>}
        </div>
        <div className="flex w-full flex-col gap-8">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Input
                type="email"
                placeholder="Email"
                required
                onChange={e => setEmail(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Input
                type="password"
                placeholder="Password"
                required
                className="bg-white"
                onChange={e => setPassword(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-2">
              <SelectDemo value="buyer" onChange={(str: string) => setUserRole(str)} />
            </div>
            <div className="flex flex-col gap-4">
              <Button onClick={handleSubmit} type="submit" className="mt-2 w-full">
                {signupText}
              </Button>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-1 text-sm text-muted-foreground">
          <p>{loginText}</p>
          <a
            href={loginUrl}
            className="font-medium text-primary hover:underline"
          >
            Login
          </a>
        </div>
      </div>
    </div>
  );
};
