import axios, { AxiosInstance } from 'axios';

export interface RemoteAPIConnectionResponse {
  id: string;
  user_id: number;
  name: string;
  connection_type: string;
  content: string;
  created_at: number;
  updated_at: number;
  last_used_at: number;
}

export default class RemoteAPI {
  protected token?: string | null;
  protected deviceId?: string;
  protected client: AxiosInstance;

  constructor(token: string | null | undefined, deviceId: string | undefined) {
    this.token = token;
    this.deviceId = deviceId;
    this.client = axios.create({
      baseURL: 'https://api.querymaster.io',
      timeout: 1000,
      headers: {
        'x-device-id': this.deviceId,
        authorization: this.token ? 'Bearer ' + this.token : undefined,
      },
    });
  }

  async updateMasterPassword(
    newMasterPassword: string,
    oldMasterPassword?: string,
  ) {
    return (
      await this.client.post<{
        status: boolean;
        error?: {
          message?: string;
        };
      }>('/v1/user/master_key', {
        masterkey: newMasterPassword,
        old_masterkey: oldMasterPassword,
      })
    ).data;
  }

  async getAll() {
    return (
      await this.client.get<{
        nodes: RemoteAPIConnectionResponse[];
      }>('/v1/connections')
    ).data;
  }

  async removeConnection(id: string) {
    return (await this.client.delete(`/v1/connection/${id}`)).data;
  }

  async saveConnection(
    id: string | undefined,
    value: {
      connection_type: string;
      content: string;
      name: string;
    },
  ) {
    if (id) {
      return (
        await this.client.post<RemoteAPIConnectionResponse>(
          `/v1/connection/${id}`,
          value,
        )
      ).data;
    } else {
      return (
        await this.client.post<RemoteAPIConnectionResponse>(
          `/v1/connection`,
          value,
        )
      ).data;
    }
  }

  async updateConnectionLastUsed(id: string) {
    return (
      await this.client.post<RemoteAPIConnectionResponse>(
        `/v1/connection/${id}/last_used`,
      )
    ).data;
  }
}
