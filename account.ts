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
  messages: Set<Message>;
  swarm: Snode[];
  messageSize: number;
  burstInterval: number;
  burstSize: number;

  constructor(messageSize = 50, burstInterval = 60, burstSize = 10) {
    this.network = new Network();
    this.pubKey = Account._generatePubKey();
    this.messages = new Set();
    this.swarm = [];
    this.messageSize = messageSize;
    this.burstInterval = burstInterval;
    this.burstSize = burstSize;
  }

  private static _generatePubKey() {
    let pubKey = '05';
    for (let i = 0; i < PUB_KEY_LEN; i++) {
      pubKey += PUB_KEY_CHARS.charAt(Math.floor(Math.random() * PUB_KEY_CHARS_LEN));
    }
    return pubKey;
  }

  private async _updateSwarm(attempts: number = 0) {
    if (attempts >= 10) {
      throw new Error(`Couldn't update swarm for ${this.pubKey}`);
    }
    this.swarm = await this.network.getAccountSwarm(this.pubKey);
    if (this.swarm.length === 0) {
      await this._updateSwarm(attempts + 1);
    }
  }

  async sendBurst() {
    return Promise.all(
      Array(this.burstSize)
        .fill(this.burstSize)
        .map(_ => {
          this.sendMessage();
        })
    );
  }

  async sendMessage() {
    const message = new Message(this.pubKey);
    await this._updateSwarm();
    const results = await Promise.all(this.swarm.map(async snode => snode.sendMessage(message)));
    if (results.some(result => result === true)) {
      this.messages.add(message);
    };
  }

  async retrieveMessages(snode: Snode) {
    return snode.retrieveMessages(this.pubKey);
  }

  async updateStats() {
    await this._updateSwarm();
    await Promise.all(this.swarm.map(async snode => {
      try {
        const messages = await this.retrieveMessages(snode);
        console.log(messages);
      } catch (e) {
        console.log(e);
      }
    }));
  }
}
