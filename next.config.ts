import type { NextConfig } from 'next';

function getSupabaseImageRemotePatterns(): NonNullable<
  NextConfig['images']
>['remotePatterns'] {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return [];
  }

  try {
    return [
      {
        protocol: 'https',
        hostname: new URL(supabaseUrl).hostname,
      },
    ];
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getSupabaseImageRemotePatterns(),
  },
  reactCompiler: true,
};

export default nextConfig;
