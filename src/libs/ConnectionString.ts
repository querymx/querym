import {
  ConnectionStoreItem,
  ConnectionStoreItemWithoutId,
} from 'drivers/base/SQLLikeConnection';
import { QueryDialetType } from './QueryBuilder';

function protocolToConnectionType(type: string): QueryDialetType {
  if (type === 'postgresql') return 'postgre';
  return 'mysql';
}

export default class ConnectionString {
  static decode(connectionString: string): ConnectionStoreItemWithoutId {
    const protocol = connectionString.substring(
      0,
      connectionString.indexOf(':'),
    );

    const httpString = connectionString.replace(protocol, 'http');
    const url = new URL(httpString);

    const config = {
      database: url.pathname.replace('/', ''),
      port: Number(url.port),
      host: url.hostname,
      password: decodeURIComponent(url.password),
      user: url.username,
    };

    const now = Math.round(Date.now() / 1000);

    return {
      config,
      createdAt: now,
      lastUsedAt: now,
      name: 'Unnamed',
      type: protocolToConnectionType(protocol),
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

  static encodeShort(setting: ConnectionStoreItem): string {
    return [
      setting.config.host + ':' + setting.config.port,
      setting.config?.database ? `(${setting.config?.database})` : undefined,
    ]
      .filter(Boolean)
      .join(' ');
  }
}
