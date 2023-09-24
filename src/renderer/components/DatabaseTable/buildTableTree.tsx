import {
  faTableList,
  faEye,
  faCalendar,
  faGear,
  faDatabase,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { DatabaseSchema, TableSchema } from 'types/SqlSchema';

function buildTableTree(
  tables: Record<string, TableSchema>,
  database: string,
  search: string
) {
  const result = Object.values(tables)
    .map((table) => ({
      id: `${database}/table/${table.name}`,
      text: table.name,
      icon:
        table.type === 'TABLE' ? (
          <FontAwesomeIcon icon={faTableList} color="#3498db" />
        ) : (
          <FontAwesomeIcon icon={faEye} color="#e67e22" />
        ),
      data: {
        name: table.name,
        type: table.type === 'TABLE' ? 'table' : 'view',
        database: database,
      },
    }))
    .filter((table) => {
      if (search) {
        return table.text.indexOf(search) >= 0;
      }

      return true;
    });

  result.sort((a, b) => a.text.localeCompare(b.text));
  return result;
}

function buildEventTree(events: string[], database: string, search: string) {
  const result = events
    .map((event) => ({
      id: `${database}/event/${event}`,
      text: event,
      icon: <FontAwesomeIcon icon={faCalendar} color="#27ae60" />,
      data: {
        name: event,
        type: 'event',
        database: database,
      },
    }))
    .filter((table) => {
      if (search) {
        return table.text.indexOf(search) >= 0;
      }

      return true;
    });

  result.sort((a, b) => a.text.localeCompare(b.text));
  return result;
}

function buildTriggerTree(
  triggers: string[],
  database: string,
  search: string
) {
  const result = triggers
    .map((trigger) => ({
      id: `${database}/trigger/${trigger}`,
      text: trigger,
      icon: <FontAwesomeIcon icon={faGear} color="#bdc3c7" />,
      data: {
        name: trigger,
        database: database,
        type: 'trigger',
      },
    }))
    .filter((table) => {
      if (search) {
        return table.text.indexOf(search) >= 0;
      }

      return true;
    });

  result.sort((a, b) => a.text.localeCompare(b.text));
  return result;
}

export function buildSchemaTree(database: DatabaseSchema, search: string) {
  const children = [
    {
      id: `${database.name}/tables`,
      text: `Tables (${Object.values(database.tables).length})`,
      children: buildTableTree(database.tables, database.name, search),
    },
    {
      id: `${database.name}/events`,
      text: `Events (${database.events.length})`,
      children: buildEventTree(database.events, database.name, search),
    },
    {
      id: `${database.name}/triggers`,
      text: `Triggers (${database.triggers.length})`,
      children: buildTriggerTree(database.triggers, database.name, search),
    },
  ];

  return {
    id: database.name,
    text: database.name,
    icon: <FontAwesomeIcon icon={faDatabase} color="#27ae60" />,
    children,
  };
}
