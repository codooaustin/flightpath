"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId } from "@/lib/auth";
import { resolveStoragePath } from "@/lib/supabase/storage";
import { revalidatePath } from "next/cache";
import type { ExpenseCategory } from "@/types/models";

const RECEIPTS_BUCKET = "receipts";

export async function createExpense(formData: FormData) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  let receiptUrl: string | null = null;
  const receipt = formData.get("receipt") as File | null;

  if (receipt && receipt.size > 0) {
    const path = `${studentId}/receipts/${Date.now()}-${receipt.name}`;
    const { error: uploadError } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .upload(path, receipt);

    if (uploadError) return { error: uploadError.message };

    receiptUrl = path;
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

  const { data: expense } = await supabase
    .from("expenses")
    .select("receipt_url")
    .eq("id", id)
    .eq("user_id", studentId)
    .single();

  if (expense?.receipt_url) {
    const storagePath = resolveStoragePath(expense.receipt_url, RECEIPTS_BUCKET);
    if (storagePath) {
      await supabase.storage.from(RECEIPTS_BUCKET).remove([storagePath]);
    }
  }

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

export async function updateExpense(id: string, formData: FormData) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  const update: {
    category: ExpenseCategory;
    description: string | null;
    amount: number;
    date: string;
    receipt_url?: string;
  } = {
    category: formData.get("category") as ExpenseCategory,
    description: (formData.get("description") as string) || null,
    amount: parseFloat(formData.get("amount") as string),
    date: formData.get("date") as string,
  };

  const receipt = formData.get("receipt") as File | null;
  if (receipt && receipt.size > 0) {
    const path = `${studentId}/receipts/${Date.now()}-${receipt.name}`;
    const { error: uploadError } = await supabase.storage
      .from(RECEIPTS_BUCKET)
      .upload(path, receipt);

    if (uploadError) return { error: uploadError.message };

    update.receipt_url = path;
  }

  const { error } = await supabase
    .from("expenses")
    .update(update)
    .eq("id", id)
    .eq("user_id", studentId);

  if (error) return { error: error.message };

  revalidatePath("/costs");
  revalidatePath("/dashboard");
  return { success: true };
}
