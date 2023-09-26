import SQLLikeConnection from 'drivers/base/SQLLikeConnection';
import PgConnection from 'drivers/pg/PgConnection';

export default function getPgTestingConnection(): SQLLikeConnection {
  return new PgConnection({
    database: process.env.PG_DATABASE,
    port: Number(process.env.PG_PORT),
    host: process.env.PG_HOST,
    user: process.env.PG_USERNAME,
    password: process.env.PG_PASSWORD,
  });
}
