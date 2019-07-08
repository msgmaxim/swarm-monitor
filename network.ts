import fetch from 'node-fetch';

import { Snode } from './snode';

// Seed node endpoint
const SEED_NODE_URL = 'http://13.238.53.205:38157/json_rpc';
const SWARM_STATE_RPC = {
  jsonrpc: '2.0',
  id: '0',
  method: 'get_n_service_nodes',
  params: {
    fields: {
      public_ip: true,
      storage_port: true,
    },
  },
};
const SWARM_STATE_OPTIONS = {
  method: 'POST',
  options: {
    timeout: 5000,
  },
  body: JSON.stringify(SWARM_STATE_RPC),
  headers: {
    'Content-Type': 'application/json',
  },
};

export class Network {
  static instance: Network;
  allNodes: Snode[];

  constructor() {
    if (!!Network.instance) {
      return Network.instance;
    }
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0';
    this.allNodes = [];
    Network.instance = this;
    return this;
  }

  private async _updateAllNodes() {
    try {
      const response = await fetch(SEED_NODE_URL, SWARM_STATE_OPTIONS);
      if (!response.ok) {
        throw new Error(`${response.status} response updating all nodes`);
      }
      const network = new Network();
      const result = await response.json();
      this.allNodes = result.result.service_node_states
        .filter((snode: { public_ip: string; }) => snode.public_ip !== '0.0.0.0')
        .map((snode: { public_ip: any; storage_port: any; }) => new Snode(snode.public_ip, snode.storage_port));
      if (this.allNodes.length === 0) {
        throw new Error(`Error updating all nodes, couldn't get any valid ips`);
      }
    } catch (e) {
      throw new Error(`Error updating all nodes: ${e}`);
    }
  }

  async getAccountSwarm(pubKey: string) {
    const body = {
      method: 'get_snodes_for_pubkey',
      params: {
        pubKey,
      },
    };
    const options = {
      method: 'POST',
      options: {
        timeout: 5000,
      },
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    };
    let nodeIdx;
    try {
      if (this.allNodes.length === 0) {
        await this._updateAllNodes();
      }
      nodeIdx = Math.floor(Math.random() * this.allNodes.length);
      const url = `https://${this.allNodes[nodeIdx].ip}:${this.allNodes[nodeIdx].port}/storage_rpc/v1`;
      const response = await fetch(url, options);
      if (!response.ok) {
        console.log(`${response.status} response retrieving account swarm`);
        this.allNodes.splice(nodeIdx, 1);
        return [];
      }
      const { snodes } = await response.json();
      return snodes
        .filter((snode: { ip: string; }) => snode.ip !== '0.0.0.0')
        .map((snode: { ip: any; port: any; }) => new Snode(snode.ip, snode.port));
    } catch (e) {
      console.log(`Error retrieving account swarm: ${e}`);
      this.allNodes.splice(nodeIdx, 1);
      return [];
    }
  }
}
