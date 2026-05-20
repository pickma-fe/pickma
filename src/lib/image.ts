const FALLBACK_PROFILE_IMAGE = '/images/mock/profile.jpg';

function isSupabaseStorageImage(profileImage: string): boolean {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;
  try {
    const imageUrl = new URL(profileImage);
    const storageUrl = new URL(supabaseUrl);
    return (
      imageUrl.protocol === 'https:' &&
      imageUrl.hostname === storageUrl.hostname
    );
  } catch {
    return false;
  }
}

export function getSafeProfileImage(profileImage?: string): string {
  if (!profileImage) return FALLBACK_PROFILE_IMAGE;
  if (profileImage.startsWith('/')) return profileImage;
  if (isSupabaseStorageImage(profileImage)) return profileImage;
  return FALLBACK_PROFILE_IMAGE;
}
