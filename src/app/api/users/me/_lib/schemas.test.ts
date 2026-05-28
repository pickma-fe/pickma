import { describe, expect, it } from 'vitest';

import { updateMeSchema } from './schemas';

describe('updateMeSchema', () => {
  it('빈 object는 refine 실패한다', () => {
    const result = updateMeSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('name이 빈 문자열이면 실패한다', () => {
    const result = updateMeSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });

  it('name이 공백만 있으면 trim 후 min(1) 실패한다', () => {
    const result = updateMeSchema.safeParse({ name: '   ' });
    expect(result.success).toBe(false);
  });

  it('name 앞뒤 공백은 trim되어 통과한다', () => {
    const result = updateMeSchema.safeParse({ name: ' 홍길동 ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('홍길동');
    }
  });

  it('101자 name은 max(100) 실패한다', () => {
    const result = updateMeSchema.safeParse({ name: 'a'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('100자 name은 통과한다', () => {
    const result = updateMeSchema.safeParse({ name: 'a'.repeat(100) });
    expect(result.success).toBe(true);
  });

  it('유효한 name이면 통과한다', () => {
    const result = updateMeSchema.safeParse({ name: '홍길동' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('홍길동');
    }
  });

  it('phone 앞뒤 공백은 trim되어 통과한다', () => {
    const result = updateMeSchema.safeParse({ phone: ' 010-1234-5678 ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.phone).toBe('010-1234-5678');
    }
  });

  it('phone이 공백만 있으면 trim 후 min(1) 실패한다', () => {
    const result = updateMeSchema.safeParse({ phone: '   ' });
    expect(result.success).toBe(false);
  });
});
