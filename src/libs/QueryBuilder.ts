import SqlString from 'sqlstring';

interface QueryRaw {
  __typename: 'query_raw';
  raw: string;
  binding: unknown[];
}

interface QueryWhere {
  mode: 'OR' | 'AND';
  condition?: {
    field: string;
    value: unknown;
    op: string;
  };
  raw?: QueryRaw;
}

interface QueryStates {
  table?: string;
  type: 'select' | 'update' | 'insert';
  insert?: Record<string, unknown>[];
  update?: Record<string, unknown>;
  where: QueryWhere[];
}

abstract class QueryDialect {
  abstract escapeIdentifier(name: string): string;
  abstract format(sql: string, binding: unknown[]): string;
}

class MySqlDialect implements QueryDialect {
  escapeIdentifier(value: string): string {
    return value !== '*' ? SqlString.escapeId(value) : '*';
  }

  format(sql: string, binding: unknown[]): string {
    return SqlString.format(sql, binding);
  }
}

export class QueryBuilder {
  protected dialect: QueryDialect = new MySqlDialect();
  protected states: QueryStates = {
    type: 'select',
    where: [],
  };

  constructor(dialect: 'mysql') {
    if (dialect === 'mysql') {
      this.dialect = new MySqlDialect();
    }
  }

  table(name: string) {
    this.states.table = name;
    return this;
  }

  insert(value: Record<string, unknown>) {
    this.states.insert?.push({ ...value });
    return this;
  }

  update(value: Record<string, unknown>) {
    this.states.type = 'update';
    this.states.update = { ...this.states.update, ...value };
    return this;
  }

  where(conditions: Record<string, unknown>) {
    for (const [field, value] of Object.entries(conditions)) {
      this.states.where.push({
        mode: 'AND',
        condition: {
          field,
          value,
          op: '=',
        },
      });
    }

    return this;
  }

  protected buildWhere(where: QueryWhere[]): {
    sql: string;
    binding: unknown[];
  } {
    if (where.length === 0) return { sql: '', binding: [] };

    let previousMode = '';
    let sql = '';
    const binding: unknown[] = [];

    for (const whereItem of where) {
      if (whereItem.condition) {
        if (previousMode) sql += previousMode + ' ';
        sql +=
          this.dialect.escapeIdentifier(whereItem.condition.field) +
          whereItem.condition.op +
          '?';
        binding.push(whereItem.condition.value);
      }
      previousMode = whereItem.mode;
    }

    return { sql, binding };
  }

  toSQL(): { sql: string; binding: unknown[] } {
    if (this.states.type === 'update') {
      if (!this.states.table) throw 'no table specified';
      if (!this.states.update) throw 'update with no field';
      if (Object.entries(this.states.update).length === 0)
        throw 'update with no field';

      let binding: unknown[] = [];
      const commandPart = `UPDATE ${this.dialect?.escapeIdentifier(
        this.states.table
      )}`;
      const setPart: string[] = [];

      for (const [updateField, updateValue] of Object.entries(
        this.states.update
      )) {
        setPart.push(`${this.dialect?.escapeIdentifier(updateField)}=?`);
        binding.push(updateValue);
      }

      const { sql: whereSql, binding: whereBinding } = this.buildWhere(
        this.states.where
      );
      binding = binding.concat(...whereBinding);

      const sql =
        [
          commandPart,
          'SET ' + setPart.join(','),
          whereSql ? 'WHERE ' + whereSql : whereSql,
        ]
          .filter(Boolean)
          .join(' ') + ';';

      return { sql, binding };
    }

    throw 'not implemented';
  }

  toRawSQL() {
    const { sql, binding } = this.toSQL();
    return this.dialect.format(sql, binding);
  }
}
