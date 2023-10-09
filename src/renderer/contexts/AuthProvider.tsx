import {
  PropsWithChildren,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import useSWR, { SWRConfig } from 'swr';
import axios from 'axios';
import { useDevice } from './DeviceProvider';
import NotImplementCallback from 'libs/NotImplementCallback';
import { parseDeeplinkForToken } from 'libs/ParseDeeplink';
import RemoteAPI from 'renderer/utils/RemoteAPI';

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
  isValidMasterPassword: boolean;
  refetch: () => void;
}>({
  loading: true,
  isValidMasterPassword: false,
  refetch: NotImplementCallback,
});

const AuthContext = createContext<{
  logout: () => void;
  masterPassword?: string | null;
  setMasterPassword: (password: string) => void;
  api: RemoteAPI;
}>({
  logout: NotImplementCallback,
  setMasterPassword: NotImplementCallback,
  api: new RemoteAPI(undefined, undefined),
});

export function useCurrentUser() {
  return useContext(UserContext);
}

export function useAuth() {
  return useContext(AuthContext);
}

function AuthProviderBody({
  children,
  token,
  masterPassword,
}: PropsWithChildren<{
  token?: string | null;
  masterPassword?: string | null;
}>) {
  const { data, isLoading, mutate } = useSWR<LoginUser>(
    token ? 'https://api.querymaster.io/v1/user' : null,
    { shouldRetryOnError: false, revalidateOnFocus: false },
  );

  const [isValidMasterPassword, setValidMasterPassword] = useState(false);

  useEffect(() => {
    if (!masterPassword) {
      setValidMasterPassword(false);
      return;
    }

    if (!data?.test_encryption) {
      setValidMasterPassword(false);
      return;
    }

    if (!data?.salt) {
      setValidMasterPassword(false);
      return;
    }

    window.electron
      .decrypt(data.test_encryption, masterPassword, data.salt)
      .then((decrypted) => {
        setValidMasterPassword(decrypted === data.salt);
      });
  }, [data, masterPassword, setValidMasterPassword]);

  return (
    <UserContext.Provider
      value={{
        user: data,
        loading: isLoading,
        isValidMasterPassword,
        refetch: mutate,
      }}
    >
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

  const api = useMemo(() => {
    return new RemoteAPI(token, deviceId);
  }, [deviceId, token]);

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
        api,
      }}
    >
      <SWRConfig value={{ fetcher }}>
        <AuthProviderBody token={token} masterPassword={masterPassword}>
          {children}
        </AuthProviderBody>
      </SWRConfig>
    </AuthContext.Provider>
  );
}
