import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type MySelectProps = {
  value: string;
  onChange: (value: string) => void;
};


export function SelectDemo({ value, onChange }: MySelectProps) {
  return (
    <Select  onValueChange={str => onChange(str)} >
      <SelectTrigger >
        <SelectValue placeholder="Are you a buyer or seller?" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Role</SelectLabel>
          <SelectItem value="buyer">Buyer</SelectItem>
          <SelectItem value="seller">Seller</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
