import request from '../request';
import { qwasm } from '~/utils/quorum-wasm/load-quorum';

export interface INodeInfo {
  node_id: string
  node_publickey: string
  node_status: string
  node_version: string
  peers: Record<string, string[]>
}

export const fetchMyNodeInfo = () => {
  if (!process.env.IS_ELECTRON) {
    return qwasm.GetNodeInfo() as Promise<INodeInfo>;
  }
  return request('/api/v1/node', {
    method: 'GET',
    quorum: true,
    jwt: true,
  }) as Promise<INodeInfo>;
};
