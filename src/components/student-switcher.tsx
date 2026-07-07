"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StudentSwitcherProps {
  students: { id: string; name: string }[];
}

export function StudentSwitcher({ students }: StudentSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("student") ?? students[0]?.id;

  return (
    <Select
      value={current}
      onValueChange={(value) => {
        router.push(`?student=${value}`);
      }}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select student" />
      </SelectTrigger>
      <SelectContent>
        {students.map((s) => (
          <SelectItem key={s.id} value={s.id}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
