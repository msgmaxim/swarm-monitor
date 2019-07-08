import { Message } from './message';
import { Network } from './network';
import { Snode } from './snode';

// Pubkey constants
const PUB_KEY_CHARS = '0123456789abcdef';
const PUB_KEY_CHARS_LEN = PUB_KEY_CHARS.length;
const PUB_KEY_LEN = 64;

export class Account {
  network: Network;
  pubKey: string;
  messages: {};
  swarm: Snode[];

  constructor() {
    this.network = new Network();
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

  async updateSwarm(attempts: number = 0) {
    if (attempts >= 10) {
      throw new Error(`Couldn't update swarm for ${this.pubKey}`);
    }
    this.swarm = await this.network.getAccountSwarm(this.pubKey);
    if (this.swarm.length === 0) {
      await this.updateSwarm(attempts + 1);
    }
  }

  async sendMessage() {
    const message = new Message(this.pubKey);
    const ps: Promise<void>[] = [];
    await this.updateSwarm();
    this.swarm.forEach(snode => {
      ps.push(snode.sendMessage(message));
    });
    await Promise.all(ps);
  }
}
