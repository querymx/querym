export default function parseSafeJson<T = unknown>(
  str: string | null | undefined,
  defaultValue?: T,
): T | undefined {
  if (!str) return defaultValue;
  try {
    const t = JSON.parse(str);
    return t as T;
  } catch {
    return defaultValue;
  }
}
