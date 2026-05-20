import type { NextConfig } from 'next';

const OAUTH_PROFILE_IMAGE_HOSTS = [
  'lh3.googleusercontent.com',
  'k.kakaocdn.net',
];

function getImageRemotePatterns(): NonNullable<
  NextConfig['images']
>['remotePatterns'] {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const remotePatterns: NonNullable<NextConfig['images']>['remotePatterns'] =
    OAUTH_PROFILE_IMAGE_HOSTS.map((hostname) => ({
      protocol: 'https',
      hostname,
    }));

  try {
    if (supabaseUrl) {
      remotePatterns.push({
        protocol: 'https',
        hostname: new URL(supabaseUrl).hostname,
      });
    }
  } catch {
    return remotePatterns;
  }

  return remotePatterns;
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: getImageRemotePatterns(),
  },
  reactCompiler: true,
};

export default nextConfig;
