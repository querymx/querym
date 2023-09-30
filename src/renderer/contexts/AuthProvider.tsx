import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import useSWR, { SWRConfig } from 'swr';
import axios from 'axios';
import { useDevice } from './DeviceProvider';
import NotImplementCallback from 'libs/NotImplementCallback';
import { parseDeeplinkForToken } from 'libs/ParseDeeplink';

export interface LoginUser {
  id: number;
  name: string;
  picture: string;
  salt: string;
  test_encryption: string | null;
}

const UserContext = createContext<{
  user?: LoginUser;
  loading: boolean;
}>({ loading: true });

const AuthContext = createContext<{
  logout: () => void;
  masterPassword?: string | null;
  setMasterPassword: (password: string) => void;
}>({ logout: NotImplementCallback, setMasterPassword: NotImplementCallback });

export function useCurrentUser() {
  return useContext(UserContext);
}

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProviderBody({
  children,
  token,
}: PropsWithChildren<{ token?: string | null }>) {
  const { data, isLoading } = useSWR<LoginUser>(
    token ? 'https://api.querymaster.io/v1/user' : null,
    { shouldRetryOnError: false, revalidateOnFocus: false },
  );

  return (
    <UserContext.Provider value={{ user: data, loading: isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export default function AuthProvider({ children }: PropsWithChildren) {
  const { deviceId } = useDevice();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [masterPassword, setMasterPassword] = useState(
    localStorage.getItem('master_password'),
  );

  const setPersistentMasterPassword = useCallback(
    (password: string | null) => {
      setMasterPassword(password);
      if (password) {
        localStorage.setItem('master_password', password);
      } else {
        localStorage.removeItem('master_password');
      }
    },
    [setMasterPassword],
  );

  useEffect(() => {
    window.electron.listenDeeplink((_, url) => {
      const newToken = parseDeeplinkForToken(url);
      if (newToken) {
        setToken(newToken);
        localStorage.setItem('token', newToken);
      }
    });
  }, [setToken]);

  const fetcher = useCallback(
    (url: string) => {
      const r = axios
        .get(url, {
          headers: {
            'x-device-id': deviceId,
            authorization: token ? 'Bearer ' + token : undefined,
          },
        })
        .then((res) => res.data);
      return r;
    },
    [deviceId, token],
  );

  const onLogout = useCallback(() => {
    setToken(null);
    setPersistentMasterPassword(null);
    localStorage.removeItem('token');
  }, [setToken, setPersistentMasterPassword]);

  return (
    <AuthContext.Provider
      value={{
        logout: onLogout,
        masterPassword,
        setMasterPassword: setPersistentMasterPassword,
      }}
    >
      <SWRConfig value={{ fetcher }}>
        <AuthProviderBody token={token}>{children}</AuthProviderBody>
      </SWRConfig>
    </AuthContext.Provider>
  );
}
