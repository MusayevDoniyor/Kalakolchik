import { supabase } from "../db/supabase";

// ----------------------------------------------------------------
// Memory Service
// Handles media upload to Supabase Storage and saving memory
// records to the `memories` table.
// ----------------------------------------------------------------

export type MediaType = "image" | "video" | "text" | "voice" | "document" | "video_note";

export interface Memory {
  id: string;
  user_id: string;
  media_type: MediaType;
  media_url: string | null;
  content_text: string | null;
  created_at: string;
}

/**
 * Uploads a binary buffer to Supabase Storage under the `memories` bucket.
 * Returns the public/signed URL of the uploaded file.
 */
export async function uploadToStorage(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const storagePath = `uploads/${Date.now()}_${filename}`;

  const { error: uploadError } = await supabase.storage
    .from("memories")
    .upload(storagePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload file to storage: ${uploadError.message}`);
  }

  // Get the public URL for the uploaded media file
  const { data } = supabase.storage
    .from("memories")
    .getPublicUrl(storagePath);

  return data.publicUrl;
}

/**
 * Creates a new memory record in the `memories` table.
 * Returns the full created memory object.
 */
export async function createMemory(params: {
  userId: string;
  mediaType: MediaType;
  mediaUrl?: string;
  contentText?: string;
}): Promise<Memory> {
  const payload: Record<string, unknown> = {
    user_id: params.userId,
    media_type: params.mediaType,
    media_url: params.mediaUrl ?? null,
    content_text: params.contentText ?? null,
  };

  let { data, error } = await supabase
    .from("memories")
    .insert(payload)
    .select()
    .single();

  // If database check constraint restricts to ('image', 'video', 'text') and rejects 'voice'
  if (error && (error.code === "23514" || /media_type/i.test(error.message))) {
    console.warn("[createMemory] DB constraint rejected media_type 'voice', saving as 'video' with audio URL");
    payload.media_type = "video";
    const retry = await supabase
      .from("memories")
      .insert(payload)
      .select()
      .single();
    data = retry.data;
    error = retry.error;
  }

  if (error || !data) {
    throw new Error(`Failed to save memory: ${error?.message}`);
  }

  return data as Memory;
}
