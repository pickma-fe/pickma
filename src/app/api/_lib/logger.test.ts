import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createLogger, generateReqId } from './logger';

describe('generateReqId', () => {
  it('UUID 형식 문자열을 반환한다', () => {
    const id = generateReqId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
    );
  });

  it('호출마다 다른 값을 반환한다', () => {
    expect(generateReqId()).not.toBe(generateReqId());
  });
});

describe('createLogger', () => {
  const reqId = 'test-req-id-1234';

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  describe('test 환경 기본 silence (NODE_ENV=test)', () => {
    beforeEach(() => {
      vi.stubEnv('NODE_ENV', 'test');
    });

    it('console.info를 호출하지 않는다', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger(reqId);
      logger.info('TEST_EVENT');
      expect(spy).not.toHaveBeenCalled();
    });

    it('console.error를 호출하지 않는다', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const logger = createLogger(reqId);
      logger.error('TEST_EVENT');
      expect(spy).not.toHaveBeenCalled();
    });
  });

  describe('{ silent: false } 옵션으로 출력 활성화', () => {
    let consoleSpy: {
      info: ReturnType<typeof vi.spyOn>;
      warn: ReturnType<typeof vi.spyOn>;
      error: ReturnType<typeof vi.spyOn>;
    };

    beforeEach(() => {
      consoleSpy = {
        info: vi.spyOn(console, 'info').mockImplementation(() => {}),
        warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
        error: vi.spyOn(console, 'error').mockImplementation(() => {}),
      };
    });

    it('info: 올바른 JSON 구조 출력', () => {
      const logger = createLogger(reqId, { silent: false });
      logger.info('PAYMENT_CONFIRMED', { orderNumber: 'PM001' });

      expect(consoleSpy.info).toHaveBeenCalledOnce();
      const raw = consoleSpy.info.mock.calls[0][0] as string;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      expect(parsed.level).toBe('info');
      expect(parsed.reqId).toBe(reqId);
      expect(parsed.event).toBe('PAYMENT_CONFIRMED');
      expect(parsed.orderNumber).toBe('PM001');
      expect(typeof parsed.ts).toBe('string');
    });

    it('warn: console.warn 호출', () => {
      const logger = createLogger(reqId, { silent: false });
      logger.warn('SLOW_RESPONSE');
      expect(consoleSpy.warn).toHaveBeenCalledOnce();
      const raw = consoleSpy.warn.mock.calls[0][0] as string;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      expect(parsed.level).toBe('warn');
    });

    it('error: console.error 호출', () => {
      const logger = createLogger(reqId, { silent: false });
      logger.error('PAYMENT_FAILED', { paymentKey: 'pk_001' });
      expect(consoleSpy.error).toHaveBeenCalledOnce();
      const raw = consoleSpy.error.mock.calls[0][0] as string;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      expect(parsed.level).toBe('error');
      expect(parsed.paymentKey).toBe('pk_001');
    });

    it('meta undefined 필드는 출력에서 제외된다', () => {
      const logger = createLogger(reqId, { silent: false });
      logger.info('TEST_EVENT', {
        presentField: 'value',
        undefinedField: undefined,
      });
      const raw = consoleSpy.info.mock.calls[0][0] as string;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      expect(parsed.presentField).toBe('value');
      expect('undefinedField' in parsed).toBe(false);
    });

    it('meta 없이 호출해도 정상 동작', () => {
      const logger = createLogger(reqId, { silent: false });
      logger.info('BARE_EVENT');
      const raw = consoleSpy.info.mock.calls[0][0] as string;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      expect(parsed.event).toBe('BARE_EVENT');
      expect(parsed.reqId).toBe(reqId);
    });

    it('순환 참조 meta는 serializationError를 포함한 fallback JSON을 출력한다', () => {
      const circular: Record<string, unknown> = {};
      circular['self'] = circular;

      const logger = createLogger(reqId, { silent: false });
      logger.error('CIRCULAR_EVENT', circular);

      expect(consoleSpy.error).toHaveBeenCalledOnce();
      const raw = consoleSpy.error.mock.calls[0][0] as string;
      const parsed = JSON.parse(raw) as Record<string, unknown>;
      expect(parsed.event).toBe('CIRCULAR_EVENT');
      expect(parsed.reqId).toBe(reqId);
      expect(typeof parsed.serializationError).toBe('string');
      expect('self' in parsed).toBe(false);
    });
  });

  describe('{ silent: true } 옵션으로 명시적 silence', () => {
    it('console.info를 호출하지 않는다', () => {
      const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
      const logger = createLogger(reqId, { silent: true });
      logger.info('TEST_EVENT');
      expect(spy).not.toHaveBeenCalled();
    });
  });
});
