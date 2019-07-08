import fetch from 'node-fetch';

import { Snode } from './snode';
import { Message } from './message';

// Seed node endpoint
const SEED_NODE_URL = 'http://13.238.53.205:38157/json_rpc';

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

  private static _getOptions(method: string, params: Object) {
    const body = {
      jsonrpc: '2.0',
      id: '0',
      method,
      params,
    };
    return {
      jsonrpc: '2.0',
      id: '0',
      method: 'POST',
      timeout: 5000,
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  private async _updateAllNodes() {
    try {
      const method = 'get_n_service_nodes';
      const params = {
        fields: {
          public_ip: true,
          storage_port: true,
        },
      }
      const response = await fetch(SEED_NODE_URL, Network._getOptions(method, params));
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
    const method = 'get_snodes_for_pubkey';
    const params = {
      pubKey,
    };
    const options = Network._getOptions(method, params);
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

  async sendToSnode(snodeUrl: string, message: Message) {
    const method = 'store';
    const params = {
      pubKey: message.pubKey,
      ttl: message.ttl.toString(),
      nonce: message.nonce,
      timestamp: message.timestamp.toString(),
      data: message.data,
    };
    const options = Network._getOptions(method, params);
    try {
      const response = await fetch(snodeUrl, options);
      if (!response.ok) {
        console.log(`${response.status} response sending message to ${snodeUrl}`);
        return false;
      }
      return true;
    } catch (e) {
      console.log(`Error sending message to ${snodeUrl}: ${e}`);
      return false;
    }
  }

  async retrieveFromSnode(snodeUrl: string, pubKey: string) {
    const method = 'retrieve';
    const params = {
      pubKey,
      lastHash: '',
    };
    const options = Network._getOptions(method, params);
    try {
      const response = await fetch(snodeUrl, options);
      if (!response.ok) {
        throw new Error(`${response.status} response`);
      }
      const result = await response.json();
      return result.messages;
    } catch (e) {
      throw new Error(`Error retrieving messages from ${snodeUrl}: ${e}`);
    }
  }
}
