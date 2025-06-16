import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AccountCreation() {
  return (
    <div className="m-20">
    <div className="flex flex-col items-center justify-center ">
      <h1 className="text-3xl text-center mb-5">What type of user are you?</h1>
      <div className="m-4">
        <Button className="cursor-pointer" size="lg" variant="outline">Seller</Button>
      </div>
      <div className="m-4">
        <Button  className="cursor-pointer" size="lg" variant="outline">Buyer</Button>
      </div>
      <div className="flex">
      <Input placeholder="sheet#" className="mr-5"/>
      <Button>
        Edit Sheet
      </Button>

      </div>
    </div>
    </div>
  );
}
