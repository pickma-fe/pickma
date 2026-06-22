export type LogLevel = 'info' | 'warn' | 'error';

export interface Logger {
  info(event: string, meta?: Record<string, unknown>): void;
  warn(event: string, meta?: Record<string, unknown>): void;
  error(event: string, meta?: Record<string, unknown>): void;
}

export interface LoggerOptions {
  /**
   * true로 설정하면 출력을 억제한다.
   * 기본값: NODE_ENV === 'test' 일 때 true.
   * 테스트에서 출력 검증이 필요하면 { silent: false }를 사용한다.
   *
   * PII 금지: raw email, IP 주소, 카드번호, 계좌번호를 meta에 포함하지 않는다.
   */
  silent?: boolean;
}

/** crypto.randomUUID() 래퍼. 각 route handler에서 reqId 생성에 사용한다. */
export function generateReqId(): string {
  return crypto.randomUUID();
}

const RESERVED_KEYS = new Set(['level', 'ts', 'reqId', 'event']);

function buildEntry(
  level: LogLevel,
  reqId: string,
  event: string,
  meta?: Record<string, unknown>
): string {
  const base: Record<string, unknown> = {
    level,
    ts: new Date().toISOString(),
    reqId,
    event,
  };

  if (meta) {
    for (const [key, value] of Object.entries(meta)) {
      if (value !== undefined && !RESERVED_KEYS.has(key)) {
        base[key] = value;
      }
    }
  }

  try {
    return JSON.stringify(base);
  } catch (err) {
    return JSON.stringify({
      level,
      ts: base.ts,
      reqId,
      event,
      serializationError: err instanceof Error ? err.message : 'unknown',
    });
  }
}

export function createLogger(reqId: string, options?: LoggerOptions): Logger {
  const silent =
    options?.silent !== undefined
      ? options.silent
      : process.env.NODE_ENV === 'test';

  if (silent) {
    return {
      info: () => {},
      warn: () => {},
      error: () => {},
    };
  }

  /* eslint-disable no-console */
  return {
    info(event, meta) {
      console.info(buildEntry('info', reqId, event, meta));
    },
    warn(event, meta) {
      console.warn(buildEntry('warn', reqId, event, meta));
    },
    error(event, meta) {
      console.error(buildEntry('error', reqId, event, meta));
    },
  };
  /* eslint-enable no-console */
}
