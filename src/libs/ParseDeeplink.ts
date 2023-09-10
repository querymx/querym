export function parseDeeplinkForToken(deeplink: string): string | null {
  const url = new URL(deeplink);

  if (url.pathname.startsWith('//login')) {
    return url.searchParams.get('token');
  }

  return null;
}
