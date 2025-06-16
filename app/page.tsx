import Image from "next/image";
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  return (
    <div><Button>hello</Button>
    <ModeToggle />
    </div>
  );
}
