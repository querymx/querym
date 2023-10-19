import NotImplementCallback from 'libs/NotImplementCallback';
import {
  createContext,
  useContext,
  PropsWithChildren,
  useState,
  useCallback,
} from 'react';
import KeyMatcher from 'renderer/utils/KeyMatcher';
import parseSafeJson from 'renderer/utils/parseSafeJson';

const defaultKeybinding = {
  'run-query': new KeyMatcher({ key: 'Enter', ctrl: true }),
  'run-current-query': new KeyMatcher({
    key: 'Enter',
    shift: true,
    ctrl: true,
  }),
  'save-query': new KeyMatcher({ key: 's', ctrl: true }),
};

export const KeybindingDescription: Record<string, { title: string }> = {
  'run-query': {
    title: 'Run Query',
  },
  'run-current-query': {
    title: 'Run Current Query',
  },
  'save-query': {
    title: 'Save Query',
  },
};

const KeyBindingContext = createContext<{
  binding: typeof defaultKeybinding;
  setBinding: (name: string, key: KeyMatcher) => void;
}>({ binding: defaultKeybinding, setBinding: NotImplementCallback });

export function useKeybinding() {
  return useContext(KeyBindingContext);
}

export function KeyBindingProvider({ children }: PropsWithChildren) {
  const [binding, setBinding] = useState(() => {
    return {
      ...defaultKeybinding,
      ...Object.entries(
        parseSafeJson<Record<string, object>>(
          localStorage.getItem('keybinding'),
          {},
        ) ?? {},
      ).reduce(
        (a, [name, key]) => {
          a[name] = new KeyMatcher(key);
          return a;
        },
        {} as Record<string, KeyMatcher>,
      ),
    };
  });

  const setBindingCallback = useCallback(
    (name: string, key: KeyMatcher) => {
      setBinding((prev) => {
        const newKeyBinding = { ...prev, [name]: key };
        localStorage.setItem(
          'keybinding',
          JSON.stringify(
            Object.entries(newKeyBinding).reduce(
              (a, [name, key]) => {
                a[name] = key.toJson();
                return a;
              },
              {} as Record<string, unknown>,
            ),
          ),
        );
        return newKeyBinding;
      });
    },
    [setBinding],
  );

  return (
    <KeyBindingContext.Provider
      value={{ binding: binding, setBinding: setBindingCallback }}
    >
      {children}
    </KeyBindingContext.Provider>
  );
}
