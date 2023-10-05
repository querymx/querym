import {
  ConnectionStoreConfig,
  ConnectionStoreItem,
} from 'drivers/base/SQLLikeConnection';

export default class ConnectionString {
  static decode(connectionString: string): ConnectionStoreConfig {
    const protocol = connectionString.substring(
      0,
      connectionString.indexOf(':'),
    );

    const httpString = connectionString.replace(protocol, 'http');
    const url = new URL(httpString);

    return {
      database: url.pathname.replace('/', ''),
      port: Number(url.port),
      host: url.hostname,
      password: decodeURIComponent(url.password),
      user: url.username,
    };
  }

  static encode(setting: ConnectionStoreItem): string {
    let protocol: string = setting.type;
    const params = new URLSearchParams();

    if (setting.type === 'postgre') {
      protocol = 'postgresql';
    }

    if (setting.config.ssl) {
      params.set('ssl', 'true');
    }

    let paramsString = params.toString();
    paramsString = paramsString ? '?' + paramsString : paramsString;

    return (
      `${protocol}://${setting.config.user}:${setting.config.password}@${setting.config.host}:${setting.config.port}/${setting.config.database}` +
      paramsString
    );
  }
}
