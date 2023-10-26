import {
  create_test_schema,
  get_test_autocomplete as get,
  convert_autocomplete_to_string as str,
} from './autocomplete_test_utils';

const schema1 = create_test_schema({
  foo: {
    users: { id: 'int', name: 'varchar', address: 'varchar' },
    products: {
      name: 'varchar',
      description: 'varchar',
      product_type: "enum('HOME', 'BOOK', 'FASHION')",
    },
  },
});

describe('SQL completion', () => {
  it('completes table names', () => {
    expect(
      str(get('select u|', { schema: schema1, currentDatabase: 'foo' })),
    ).toBe('products, users, foo');
  });

  it('completes column based on the FROM table', () => {
    expect(
      str(
        get('select n| from users', {
          schema: schema1,
          currentDatabase: 'foo',
        }),
      ),
    ).toBe('address, id, name, products, users, foo');

    expect(
      str(
        get('select users.|, name from users', {
          schema: schema1,
          currentDatabase: 'foo',
        }),
      ),
    ).toBe('address, id, name');
  });

  it('completes column after specified table with .', () => {
    expect(
      str(get('select users.|', { schema: schema1, currentDatabase: 'foo' })),
    ).toBe('address, id, name');
  });

  it('completes enum value', () => {
    expect(
      str(
        get("select * from products where product_type = 'H|'", {
          schema: schema1,
          currentDatabase: 'foo',
        }),
      ),
    ).toBe('BOOK, FASHION, HOME');
  });
});
