import { supabase } from '../config/supabase';

type Bucket = 'avatars' | 'diplomas' | 'videos';

export async function uploadImage(
  bucket: Bucket,
  filePath: string,
  imageUri: string,
): Promise<string> {
  const response = await fetch(imageUri);
  const arrayBuffer = await response.arrayBuffer();

  const { error } = await supabase.storage
    .from(bucket)
    .upload(filePath, arrayBuffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}

export function getPublicUrl(bucket: Bucket, filePath: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
  return data.publicUrl;
}
