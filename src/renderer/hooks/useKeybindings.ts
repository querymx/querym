import { useLiveQuery } from 'dexie-react-hooks';
import { db } from 'renderer/db';

// Add new actions here
export const ACTIONS = ['RUN', 'AUTO_COMPLETE'] as const;
export type Action = (typeof ACTIONS)[number];

export interface Keybinding {
  win?: string;
  mac?: string;
  linux?: string;
  all: string;
}
// Record of all actions and their keybindings
export type Keybindings = Record<Action, Keybinding>;

// Add default keybindings here
export const keybindingsDefault: Keybindings = {
  RUN: { win: '', mac: '', linux: '', all: 'Meta+Enter' },
  AUTO_COMPLETE: { win: '', mac: '', linux: '', all: 'Meta+i' },
};

// How keybindings are stored in the database
export type KeybindingsTable = {
  id: number;
  keybindings: Keybindings;
};

export const useKeybindings = () => {
  // this might be undefined
  const keybindings: KeybindingsTable | undefined = useLiveQuery(() =>
    db.table('keybindings').get(1)
  );

  const isExistingKeybinding = (keybind: Keybinding | string) => {
    if (!keybindings) throw new Error('Keybindings not found');

    if (typeof keybind === 'string') {
      return Object.values(keybindings.keybindings as Keybindings).some(
        (existingKeybind) => existingKeybind.all === keybind
      );
    }

    const { win, mac, linux, all } = keybind;
    const keybinds = [win, mac, linux, all];
    return keybinds.some((keybind) => {
      return Object.values(keybindings.keybindings as Keybindings).some(
        (existingKeybind) => existingKeybind.all === keybind
      );
    });
  };

  const isValidAction = (action: string): action is Action => {
    return ACTIONS.includes(action as Action);
  };

  const setKeybinding = (action: Action, newKeybind: Keybinding | string) => {
    if (!keybindings) throw new Error('Keybindings not found');

    if (!isValidAction(action)) return; // Invalid action
    if (isExistingKeybinding(newKeybind)) return; // Keybinding already exists

    let updatedKeybindings: Keybindings;

    if (typeof newKeybind === 'string') {
      updatedKeybindings = {
        ...keybindings.keybindings,
        [action]: {
          win: newKeybind,
          mac: newKeybind,
          linux: newKeybind,
          all: newKeybind,
        },
      };
    } else {
      updatedKeybindings = {
        ...keybindings.keybindings,
        [action]: {
          win: newKeybind.win || '',
          mac: newKeybind.mac || '',
          linux: newKeybind.linux || '',
          all: newKeybind.all || '',
        },
      };
    }

    db.table('keybindings').update(keybindings.id, {
      keybindings: updatedKeybindings,
    });
  };

  return {
    keybindings: keybindings?.keybindings || keybindingsDefault,
    setKeybinding,
    isValidAction,
  };
};
