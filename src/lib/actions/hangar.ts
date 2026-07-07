"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveStudentId } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { FileCategory } from "@/types/models";

const BUCKET_MAP: Record<FileCategory, string> = {
  certificates: "documents",
  photos: "photos",
  aircraft: "documents",
  equipment: "documents",
  documents: "documents",
};

export async function uploadFile(formData: FormData) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  const file = formData.get("file") as File;
  const category = formData.get("category") as FileCategory;
  const description = (formData.get("description") as string) || null;

  if (!file || file.size === 0) {
    return { error: "No file selected" };
  }

  const bucket = BUCKET_MAP[category];
  const path = `${studentId}/${category}/${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);

  const { error } = await supabase.from("files").insert({
    user_id: studentId,
    category,
    file_url: urlData.publicUrl,
    file_name: file.name,
    description,
    bucket,
  });

  if (error) return { error: error.message };

  revalidatePath("/hangar");
  return { success: true };
}

export async function deleteFile(id: string, filePath: string, bucket: string) {
  const supabase = await createClient();
  const studentId = await getActiveStudentId();

  const pathParts = new URL(filePath).pathname.split(`/${bucket}/`);
  const storagePath = pathParts[1];

  if (storagePath) {
    await supabase.storage.from(bucket).remove([storagePath]);
  }

  const { error } = await supabase
    .from("files")
    .delete()
    .eq("id", id)
    .eq("user_id", studentId);

  if (error) return { error: error.message };

  revalidatePath("/hangar");
  return { success: true };
}
