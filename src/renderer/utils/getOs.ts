export type OperatingSystem = 'win' | 'mac' | 'linux';

export function getOs(): OperatingSystem | 'all' {
  if (navigator.userAgent.indexOf('Win') != -1) return 'win';
  if (navigator.userAgent.indexOf('Mac') != -1) return 'mac';
  if (navigator.userAgent.indexOf('Linux') != -1) return 'linux';

  return 'all';
}
