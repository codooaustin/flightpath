"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { ExpenseCategory } from "@/types/models";

export async function createExpense(formData: FormData) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  let receiptUrl: string | null = null;
  const receipt = formData.get("receipt") as File | null;

  if (receipt && receipt.size > 0) {
    const path = `${studentId}/receipts/${Date.now()}-${receipt.name}`;
    const { error: uploadError } = await supabase.storage
      .from("receipts")
      .upload(path, receipt);

    if (uploadError) return { error: uploadError.message };

    const { data } = supabase.storage.from("receipts").getPublicUrl(path);
    receiptUrl = data.publicUrl;
  }

  const { error } = await supabase.from("expenses").insert({
    user_id: studentId,
    category: formData.get("category") as ExpenseCategory,
    description: (formData.get("description") as string) || null,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
    receipt_url: receiptUrl,
  });

  if (error) return { error: error.message };

  revalidatePath("/costs");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteExpense(id: string) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  const { error } = await supabase
    .from("expenses")
    .delete()
    .eq("id", id)
    .eq("user_id", studentId);

  if (error) return { error: error.message };

  revalidatePath("/costs");
  revalidatePath("/dashboard");
  return { success: true };
}
