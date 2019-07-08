import { Message } from './message';
import { Network } from './network';

// Pubkey constants
const PUB_KEY_CHARS = '0123456789abcdef';
const PUB_KEY_CHARS_LEN = PUB_KEY_CHARS.length;
const PUB_KEY_LEN = 64;

export class Account {
  network: Network;
  pubKey: string;
  messages: {};
  swarm: any[];

  constructor(network: Network) {
    this.network = network;
    this.pubKey = Account._generatePubKey();
    this.messages = {};
    this.swarm = [];
  }

  static _generatePubKey() {
    let pubKey = '05';
    for (let i = 0; i < PUB_KEY_LEN; i++) {
      pubKey += PUB_KEY_CHARS.charAt(Math.floor(Math.random() * PUB_KEY_CHARS_LEN));
    }
    return pubKey;
  }

  async updateSwarm() {
    this.swarm = await this.network.getAccountSwarm(this.pubKey)
    console.log(this.swarm);
  }
}
