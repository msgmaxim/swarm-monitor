const fetch = require('node-fetch');

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

const network = {
  async getSwarmState() {
    try {
      const response = await fetch(SEED_NODE_URL, SWARM_STATE_OPTIONS);
      if (!response.ok) {
        return null;
      }
      const result = await response.json();
      const snodes = result.result.service_node_states
      .filter(snode => snode.public_ip !== '0.0.0.0')
      .map(snode => ({
        ip: snode.public_ip,
        port: snode.storage_port,
      }));
      return snodes;
    } catch (e) {
      console.log(`Error retrieving swarm state: ${e}`);
      return null;
    }
  },
  async getSwarmState() {
    try {
      const response = await fetch(SEED_NODE_URL, SWARM_STATE_OPTIONS);
      if (!response.ok) {
        return null;
      }
      const result = await response.json();
      const snodes = result.result.service_node_states
      .filter(snode => snode.public_ip !== '0.0.0.0')
      .map(snode => ({
        ip: snode.public_ip,
        port: snode.storage_port,
      }));
      return snodes;
    } catch (e) {
      console.log(`Error retrieving swarm state: ${e}`);
      return null;
    }
  },
};

module.exports = { network };
