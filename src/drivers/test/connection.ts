import SQLLikeConnection from 'drivers/base/SQLLikeConnection';
import MySQLConnection from 'drivers/mysql/MySQLConnection';
import PgConnection from 'drivers/pg/PgConnection';
import { QueryDialetType } from 'libs/QueryBuilder';
import { SqlRunnerManager } from 'libs/SqlRunnerManager';

export const TEST_DRIVER = process.env.DRIVER as QueryDialetType;

export function getTestExecute(conn: SQLLikeConnection) {
  return new SqlRunnerManager((sql, params) => {
    return conn.query(sql, params);
  });
}

export default function getTestingConnection(): SQLLikeConnection {
  if (TEST_DRIVER === 'postgre') {
    return new PgConnection({
      database: process.env.PG_DATABASE,
      port: Number(process.env.PG_PORT),
      host: process.env.PG_HOST,
      user: process.env.PG_USERNAME,
      password: process.env.PG_PASSWORD,
    });
  }

  return new MySQLConnection({
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT),
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
  });
}
