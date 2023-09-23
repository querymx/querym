import SQLLikeConnection from 'drivers/base/SQLLikeConnection';
import MySQLConnection from 'drivers/mysql/MySQLConnection';
import PgConnection from 'drivers/pg/PgConnection';
import { QueryDialetType } from 'libs/QueryBuilder';

export const TEST_DRIVER = process.env.DRIVER as QueryDialetType;

export default function getTestingConnection(): SQLLikeConnection {
  if (TEST_DRIVER === 'postgre') {
    return new PgConnection(
      {
        database: 'querymaster_test',
        port: 5432,
        host: 'localhost',
        user: 'postgres',
        password: '123456',
      },
      () => {
        return;
      }
    );
  }

  return new MySQLConnection(
    {
      database: 'querymaster_test',
      port: 3306,
      host: 'localhost',
      user: 'root',
      password: '123456',
    },
    () => {
      return;
    }
  );
}
