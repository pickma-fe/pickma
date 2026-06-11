import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useUserLocation } from './useUserLocation';

const STORAGE_KEY = 'pickma_user_location';

const mockLocation = {
  lat: 37.5665,
  lng: 126.978,
  address: '서울시 중구',
};

describe('useUserLocation', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('localStorage에 저장된 위치가 없으면 null을 반환한다', () => {
    const { result } = renderHook(() => useUserLocation());

    expect(result.current.location).toBeNull();
  });

  it('localStorage에 위치가 있으면 파싱해서 반환한다', () => {
    const stored = { ...mockLocation, savedAt: 1000 };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));

    const { result } = renderHook(() => useUserLocation());

    expect(result.current.location).toEqual(stored);
  });

  it('saveLocation은 savedAt을 추가해서 localStorage에 저장한다', () => {
    vi.setSystemTime(new Date('2026-06-10T00:00:00.000Z'));
    const { result } = renderHook(() => useUserLocation());

    act(() => {
      result.current.saveLocation(mockLocation);
    });

    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : null;
    expect(parsed).toMatchObject({
      ...mockLocation,
      savedAt: new Date('2026-06-10T00:00:00.000Z').getTime(),
    });
  });

  it('saveLocation 후 location이 업데이트된다', () => {
    vi.setSystemTime(new Date('2026-06-10T00:00:00.000Z'));
    const { result } = renderHook(() => useUserLocation());

    act(() => {
      result.current.saveLocation(mockLocation);
    });

    expect(result.current.location).toMatchObject(mockLocation);
  });

  it('clearLocation은 localStorage에서 항목을 제거한다', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...mockLocation, savedAt: 1000 })
    );
    const { result } = renderHook(() => useUserLocation());

    act(() => {
      result.current.clearLocation();
    });

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it('clearLocation 후 location이 null로 업데이트된다', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...mockLocation, savedAt: 1000 })
    );
    const { result } = renderHook(() => useUserLocation());

    act(() => {
      result.current.clearLocation();
    });

    expect(result.current.location).toBeNull();
  });

  it('localStorage 값이 잘못된 JSON이면 null을 반환한다', () => {
    localStorage.setItem(STORAGE_KEY, 'not-json');

    const { result } = renderHook(() => useUserLocation());

    expect(result.current.location).toBeNull();
  });
});
