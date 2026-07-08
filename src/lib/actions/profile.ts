"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

const AVATAR_BUCKET = "avatars";
const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function getAvatarExtension(file: File): string | null {
  switch (file.type) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return null;
  }
}

function avatarPath(userId: string, extension: string) {
  return `${userId}/avatar.${extension}`;
}

export async function uploadAvatar(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    return { error: "No image selected" };
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Use a JPEG, PNG, WebP, or GIF image" };
  }

  if (file.size > MAX_AVATAR_BYTES) {
    return { error: "Image must be 2 MB or smaller" };
  }

  const extension = getAvatarExtension(file);
  if (!extension) {
    return { error: "Unsupported image type" };
  }

  const path = avatarPath(user.id, extension);

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (uploadError) return { error: uploadError.message };

  const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  const avatarUrl = `${urlData.publicUrl}?v=${Date.now()}`;

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (profileError) return { error: profileError.message };

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { success: true, avatarUrl };
}

export async function removeAvatar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user.id)
    .single();

  if (profile?.avatar_url) {
    const pathname = new URL(profile.avatar_url).pathname;
    const storagePath = pathname.split(`/object/public/${AVATAR_BUCKET}/`)[1];
    if (storagePath) {
      await supabase.storage.from(AVATAR_BUCKET).remove([storagePath]);
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ avatar_url: null })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  revalidatePath("/", "layout");
  return { success: true };
}
