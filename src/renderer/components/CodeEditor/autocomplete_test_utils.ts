import { EditorState } from '@codemirror/state';
import {
  CompletionContext,
  CompletionResult,
  CompletionSource,
} from '@codemirror/autocomplete';
import handleCustomSqlAutoComplete from './handleCustomSqlAutoComplete';
import { MySQL, genericCompletion } from './../../../language/dist';
import {
  DatabaseSchemaList,
  TableColumnSchema,
  TableSchema,
} from 'types/SqlSchema';
import SchemaCompletionTree from './SchemaCompletionTree';

export function get_test_autocomplete(
  doc: string,
  {
    schema,
    currentDatabase,
  }: { schema: DatabaseSchemaList; currentDatabase?: string },
) {
  const cur = doc.indexOf('|'),
    dialect = MySQL;

  doc = doc.slice(0, cur) + doc.slice(cur + 1);
  const state = EditorState.create({
    doc,
    selection: { anchor: cur },
    extensions: [
      dialect,
      dialect.language.data.of({
        autocomplete: genericCompletion((context, tree) =>
          handleCustomSqlAutoComplete(
            context,
            tree,
            SchemaCompletionTree.build(schema, currentDatabase, dialect.spec),
            schema,
            currentDatabase,
          ),
        ),
      }),
    ],
  });

  const result = state.languageDataAt<CompletionSource>('autocomplete', cur)[0](
    new CompletionContext(state, cur, false),
  );
  return result as CompletionResult | null;
}

export function convert_autocomplete_to_string(
  result: CompletionResult | null,
) {
  return !result
    ? ''
    : result.options
        .slice()
        .sort(
          (a, b) =>
            (b.boost || 0) - (a.boost || 0) || (a.label < b.label ? -1 : 1),
        )
        .map((o) => o.apply || o.label)
        .join(', ');
}

function map_column_type(
  tableName: string,
  name: string,
  type: string,
): TableColumnSchema {
  const tokens = type.split('(');
  let enumValues: string[] | undefined;

  if (tokens[1]) {
    // remove )
    enumValues = tokens[1]
      .replace(')', '')
      .replaceAll("'", '')
      .split(',')
      .map((a) => a.trim());
  }

  return {
    name,
    tableName,
    schemaName: '',
    charLength: 0,
    comment: '',
    enumValues,
    dataType: tokens[0],
    nullable: true,
  };
}

function map_cols(
  tableName: string,
  cols: Record<string, string>,
): Record<string, TableColumnSchema> {
  return Object.entries(cols).reduce(
    (acc, [colName, colType]) => {
      acc[colName] = map_column_type(tableName, colName, colType);
      return acc;
    },
    {} as Record<string, TableColumnSchema>,
  );
}

function map_table(
  tables: Record<string, Record<string, string>>,
): Record<string, TableSchema> {
  return Object.entries(tables).reduce(
    (acc, [tableName, cols]) => {
      acc[tableName] = {
        columns: map_cols(tableName, cols),
        constraints: [],
        name: tableName,
        type: 'TABLE',
        primaryKey: [],
      };

      return acc;
    },
    {} as Record<string, TableSchema>,
  );
}

export function create_test_schema(
  schemas: Record<string, Record<string, Record<string, string>>>,
) {
  return Object.entries(schemas).reduce((acc, [schema, tables]) => {
    acc[schema] = {
      name: schema,
      events: [],
      triggers: [],
      tables: map_table(tables),
    };
    return acc;
  }, {} as DatabaseSchemaList);
}
