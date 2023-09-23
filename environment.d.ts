declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PG_HOST: string;
      PG_DATABASE: string;
      PG_PORT: string;
      PG_USERNAME: string;
      PG_PASSWORD: string;

      MYSQL_HOST: string;
      MYSQL_DATABASE: string;
      MYSQL_PORT: string;
      MYSQL_USERNAME: string;
      MYSQL_PASSWORD: string;

      NODE_ENV: 'development' | 'production';
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
