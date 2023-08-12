import Dexie from 'dexie';
import { keybindingsDefault } from './hooks/useKeybindings';

export const db = new Dexie('query-master');

db.version(1).stores({
  database_config: 'id',
  database_tabs: 'id',
  keybindings: 'id',
});

db.on('populate', () => {
  // auto populate default keybindings
  populateDefaultKeybindings();
});

async function populateDefaultKeybindings() {
  const existingKeybindings = await db.table('keybindings').get(1);
  if (!existingKeybindings) {
    await db.table('keybindings').add({
      id: 1,
      keybindings: keybindingsDefault,
    });
  }
}
