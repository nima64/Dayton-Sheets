import Image from "next/image";
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle";
import Login from "./login/page";
import { SignupForm } from "@/components/signup-form";

export default function Home() {
  return (
    <div className="mt-20">
      {/* <ModeToggle /> */}
      <SignupForm heading="Signup"/>
    </div>
  );
}
