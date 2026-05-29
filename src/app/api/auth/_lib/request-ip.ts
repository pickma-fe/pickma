import type { NextRequest } from 'next/server';

// x-forwarded-for는 reverse proxy가 클라이언트 제공값을 덮어쓰도록
// 설정된 경우에만 신뢰 가능 (nginx: proxy_set_header X-Forwarded-For $remote_addr)
export function getRequestIp(req: NextRequest): string {
  return (
    req.headers.get('x-real-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    'unknown'
  );
}
