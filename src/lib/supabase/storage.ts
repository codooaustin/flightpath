import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type AppSupabaseClient = SupabaseClient<Database>;

/** Storage path from a public/signed URL, or the path if already stored that way. */
export function resolveStoragePath(
  fileUrlOrPath: string,
  bucket: string
): string | null {
  if (!fileUrlOrPath.includes("://")) {
    return fileUrlOrPath;
  }

  try {
    const pathname = new URL(fileUrlOrPath).pathname;
    const parts = pathname.split(`/${bucket}/`);
    if (parts.length < 2) return null;
    return decodeURIComponent(parts[1]!);
  } catch {
    return null;
  }
}

export async function createSignedStorageUrl(
  supabase: AppSupabaseClient,
  bucket: string,
  fileUrlOrPath: string,
  expiresInSeconds = 60 * 60 * 24
): Promise<string | null> {
  const path = resolveStoragePath(fileUrlOrPath, bucket);
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(path, expiresInSeconds);

  if (error || !data?.signedUrl) return null;
  return data.signedUrl;
}

export async function withSignedFileUrls<T extends { file_url: string; bucket: string }>(
  supabase: AppSupabaseClient,
  files: T[]
): Promise<T[]> {
  return Promise.all(
    files.map(async (file) => {
      const signedUrl = await createSignedStorageUrl(
        supabase,
        file.bucket,
        file.file_url
      );
      return signedUrl ? { ...file, file_url: signedUrl } : file;
    })
  );
}
