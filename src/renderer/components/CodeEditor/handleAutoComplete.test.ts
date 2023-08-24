import { EditorState } from '@codemirror/state';
import {
  CompletionContext,
  CompletionResult,
  CompletionSource,
} from '@codemirror/autocomplete';
import handleCustomSqlAutoComplete from './handleCustomSqlAutoComplete';
import { MySQL, genericCompletion } from './../../../language/sql/lang_sql';
import { DatabaseSchemas } from 'types/SqlSchema';

function get(
  doc: string,
  {
    schema,
    currentDatabase,
  }: { schema: DatabaseSchemas; currentDatabase?: string }
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
          handleCustomSqlAutoComplete(context, tree, schema, currentDatabase)
        ),
      }),
    ],
  });

  const result = state.languageDataAt<CompletionSource>('autocomplete', cur)[0](
    new CompletionContext(state, cur, false)
  );
  return result as CompletionResult | null;
}

function str(result: CompletionResult | null) {
  return !result
    ? ''
    : result.options
        .slice()
        .sort(
          (a, b) =>
            (b.boost || 0) - (a.boost || 0) || (a.label < b.label ? -1 : 1)
        )
        .map((o) => o.apply || o.label)
        .join(', ');
}

const schema1: DatabaseSchemas = {
  foo: {
    name: 'foo',
    events: [],
    triggers: [],
    tables: {
      users: {
        name: 'users',
        constraints: [],
        primaryKey: [],
        type: 'TABLE',
        columns: {
          id: {
            name: 'id',
            comment: '',
            charLength: 0,
            dataType: 'int',
            nullable: false,
          },
          name: {
            name: 'name',
            comment: '',
            charLength: 0,
            dataType: 'varchar',
            nullable: false,
          },
          address: {
            name: 'address',
            comment: '',
            charLength: 0,
            dataType: 'varchar',
            nullable: false,
          },
        },
      },
      products: {
        name: 'products',
        constraints: [],
        primaryKey: [],
        type: 'TABLE',
        columns: {
          id: {
            name: 'name',
            comment: '',
            charLength: 0,
            dataType: 'varchar',
            nullable: false,
          },
          name: {
            name: 'description',
            comment: '',
            charLength: 0,
            dataType: 'varchar',
            nullable: false,
          },
          product_type: {
            name: 'product_type',
            comment: '',
            charLength: 0,
            dataType: 'enum',
            enumValues: ['HOME', 'BOOK', 'FASHION'],
            nullable: false,
          },
        },
      },
    },
  },
};

describe('SQL completion', () => {
  it('completes table names', () => {
    expect(
      str(get('select u|', { schema: schema1, currentDatabase: 'foo' }))
    ).toBe('products, users, foo');
  });

  it('completes column based on the FROM table', () => {
    expect(
      str(
        get('select n| from users', { schema: schema1, currentDatabase: 'foo' })
      )
    ).toBe('address, id, name, products, users, foo');
  });

  it('completes column after specified table with .', () => {
    expect(
      str(get('select users.|', { schema: schema1, currentDatabase: 'foo' }))
    ).toBe('address, id, name');
  });

  it('completes enum value', () => {
    expect(
      str(
        get("select * from products where product_type = 'H|'", {
          schema: schema1,
          currentDatabase: 'foo',
        })
      )
    ).toBe('BOOK, FASHION, HOME');
  });
});
