import type { NextRequest } from 'next/server';

// IP_SOURCE_HEADER: reverse proxy가 실제 클라이언트 IP로 덮어쓰는 헤더 이름
// Vercel: x-forwarded-for (기본값) | nginx: x-real-ip | Cloudflare: cf-connecting-ip
const IP_HEADER = process.env.IP_SOURCE_HEADER ?? 'x-forwarded-for';

export function getRequestIp(req: NextRequest): string {
  const value = req.headers.get(IP_HEADER);
  if (!value) return 'unknown';
  return value.split(',')[0].trim() || 'unknown';
}
