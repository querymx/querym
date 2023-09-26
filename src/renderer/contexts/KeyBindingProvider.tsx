import { createContext, useContext, PropsWithChildren } from 'react';
import KeyMatcher from 'renderer/utils/KeyMatcher';

const defaultKeybinding = {
  'run-query': new KeyMatcher({ key: 'F9' }),
  'run-current-query': new KeyMatcher({ key: 'F9', ctrl: true }),
  'save-query': new KeyMatcher({ key: 's', ctrl: true }),
  rename: new KeyMatcher({ key: 'F2' }),
};

const KeyBindingContext = createContext({ binding: defaultKeybinding });

export function useKeybinding() {
  return useContext(KeyBindingContext);
}

export function KeyBindingProvider({ children }: PropsWithChildren) {
  return (
    <KeyBindingContext.Provider value={{ binding: defaultKeybinding }}>
      {children}
    </KeyBindingContext.Provider>
  );
}
