import request from '../request';
import { qwasm } from '~/utils/quorum-wasm/load-quorum';

export interface BackupData {
  config: string
  keystore: string
  seeds: string
}

export const backup = () => {
  if (!process.env.IS_ELECTRON) {
    return qwasm.KeystoreBackupRaw('password');
  }
  return request('/api/v1/backup', {
    method: 'GET',
    quorum: true,
    jwt: true,
  }) as Promise<BackupData>;
};

export const restoreKeyBrowser = (key: string) => {
  if (!process.env.IS_ELECTRON) {
    return qwasm.KeystoreRestoreRaw('password', key);
  }
  return null;
};
