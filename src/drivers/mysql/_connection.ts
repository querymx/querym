import SQLLikeConnection from 'drivers/base/SQLLikeConnection';
import MySQLConnection from './MySQLConnection';

export default function getMySQLTestingConnection(): SQLLikeConnection {
  return new MySQLConnection({
    database: process.env.MYSQL_DATABASE,
    port: Number(process.env.MYSQL_PORT),
    host: process.env.MYSQL_HOST,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
  });
}
