import { SqlRunnerManager } from 'libs/SqlRunnerManager';
import SQLLikeConnection from './SQLLikeConnection';

export default function getTestExecute(conn: SQLLikeConnection) {
  return new SqlRunnerManager((sql, params) => {
    return conn.query(sql, params);
  });
}
