export function parseEnumType(type: string): string[] {
  try {
    return JSON.parse('[' + type.slice(5, -1).replaceAll(`'`, '"') + ']');
  } catch {
    return [];
  }
}
