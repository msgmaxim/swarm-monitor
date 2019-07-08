import fetch from 'node-fetch';

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
  allNodes: any[];

  constructor() {
    if (!!Network.instance) {
      return Network.instance;
    }
    process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = '0';
    this.allNodes = [];
    Network.instance = this;
    return this;
  }

  static async getInstance() {
    const instance = new Network();
    if (instance.allNodes.length === 0) {
      instance.allNodes = await Network.getAllNodes();
    }
    return instance;
  }

  static async getAllNodes() {
    try {
      const response = await fetch(SEED_NODE_URL, SWARM_STATE_OPTIONS);
      if (!response.ok) {
        return [];
      }
      const result = await response.json();
      const snodes = result.result.service_node_states
      .filter((snode: { public_ip: string; }) => snode.public_ip !== '0.0.0.0')
      .map((snode: { public_ip: any; storage_port: any; }) => ({
        ip: snode.public_ip,
        port: snode.storage_port,
      }));
      return snodes;
    } catch (e) {
      console.log(`Error updating all nodes: ${e}`);
      return [];
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
    const nodeIdx = Math.floor(Math.random() * this.allNodes.length);
    try {
      const url = `https://${this.allNodes[nodeIdx].ip}:${this.allNodes[nodeIdx].port}/storage_rpc/v1`;
      const response = await fetch(url, options);
      if (!response.ok) {
        console.log(`${response.status} response retrieving account swarm`);
        this.allNodes.splice(nodeIdx, 1);
        return null;
      }
      const { snodes } = await response.json();
      return snodes;
    } catch (e) {
      console.log(`Error retrieving account swarm: ${e}`);
      this.allNodes.splice(nodeIdx, 1);
      return null;
    }
  }
}
