import { createContext, PropsWithChildren, useContext, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';

const DeviceContext = createContext<{ deviceId: string }>({ deviceId: '' });

export function useDevice() {
  return useContext(DeviceContext);
}

export function DeviceProvider({ children }: PropsWithChildren) {
  const deviceId = useMemo(() => {
    const localStorageId = localStorage.getItem('device_id');
    if (localStorageId) {
      return localStorageId;
    }

    const generatedId = uuidv4();
    localStorage.setItem('device_id', generatedId);
    return generatedId;
  }, []);

  return (
    <DeviceContext.Provider value={{ deviceId }}>
      {children}
    </DeviceContext.Provider>
  );
}
