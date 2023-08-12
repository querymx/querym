import { useEffect, useState } from 'react';
import { OperatingSystem, getOs } from 'renderer/utils/getOs';

export function useOs() {
  const [os, setOs] = useState<OperatingSystem | 'all'>('all');
  useEffect(() => {
    setOs(getOs());
  }, []);
  return os;
}
