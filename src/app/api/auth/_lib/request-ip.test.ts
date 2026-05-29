import { NextRequest } from 'next/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getRequestIp } from './request-ip';

function makeRequest(headers: Record<string, string>) {
  return new NextRequest('http://localhost/api/test', { headers });
}

describe('getRequestIp', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('기본값으로 x-forwarded-for 헤더를 사용한다', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });

    expect(getRequestIp(req)).toBe('1.2.3.4');
  });

  it('x-forwarded-for에 여러 IP가 있으면 첫 번째를 반환한다', () => {
    const req = makeRequest({
      'x-forwarded-for': '1.2.3.4, 10.0.0.1, 172.16.0.1',
    });

    expect(getRequestIp(req)).toBe('1.2.3.4');
  });

  it('IP_SOURCE_HEADER 환경 변수로 헤더를 변경할 수 있다', () => {
    vi.stubEnv('IP_SOURCE_HEADER', 'x-real-ip');
    const req = makeRequest({ 'x-real-ip': '5.6.7.8' });

    expect(getRequestIp(req)).toBe('5.6.7.8');
  });

  it('IP_SOURCE_HEADER로 지정한 헤더가 없으면 unknown을 반환한다', () => {
    vi.stubEnv('IP_SOURCE_HEADER', 'x-real-ip');
    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });

    expect(getRequestIp(req)).toBe('unknown');
  });

  it('헤더가 없으면 unknown을 반환한다', () => {
    const req = makeRequest({});

    expect(getRequestIp(req)).toBe('unknown');
  });
});
