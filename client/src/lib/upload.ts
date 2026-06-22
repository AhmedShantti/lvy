import { api } from "./api";

/**
 * Upload a single image file to the backend, which stores it in Supabase
 * Storage and returns its public URL. Sends the raw file as the request body
 * with its own MIME type (the server reads it via express.raw).
 */
export async function uploadImage(file: File): Promise<string> {
  const { data } = await api.post("/admin/upload", file, {
    headers: { "Content-Type": file.type || "application/octet-stream" },
  });
  return data.url as string;
}
