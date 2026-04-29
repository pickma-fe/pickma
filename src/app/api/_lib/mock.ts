export function isApiMockEnabled(): boolean {
  return process.env.API_MOCK_ENABLED === 'true';
}
