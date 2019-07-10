import { Message } from './message';
import { Network } from './network';
import { Snode } from './snode';

// Pubkey constants
const PUB_KEY_CHARS = '0123456789abcdef';
const PUB_KEY_CHARS_LEN = PUB_KEY_CHARS.length;
const PUB_KEY_LEN = 64;
const MIN_MSG_SIZE = 20;
const MAX_MSG_SIZE = 3000;
const MIN_BURST_SIZE = 5;
const MAX_BURST_SIZE = 50;
const MIN_BURST_INTERVAL = 10000;
const MAX_BURST_INTERVAL = 60000;

const randomIntFromInterval = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export class Account {
  network: Network;
  pubKey: string;
  messages: Set<Message>;
  swarm: Snode[];
  messageSize: number;
  burstInterval: number;
  burstSize: number;

  constructor({ messageSize, burstInterval, burstSize }: { messageSize?: any; burstInterval?: any; burstSize?: any; } = {}) {
    this.network = new Network();
    this.pubKey = Account._generatePubKey();
    this.messages = new Set();
    this.swarm = [];
    this.messageSize = messageSize || randomIntFromInterval(MIN_MSG_SIZE, MAX_MSG_SIZE);
    this.burstSize = burstSize || randomIntFromInterval(MIN_BURST_SIZE, MAX_BURST_SIZE);
    this.burstInterval = burstInterval || randomIntFromInterval(MIN_BURST_INTERVAL, MAX_BURST_INTERVAL);
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
    await this._updateSwarm();
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
    const results = await Promise.all(this.swarm.map(async snode => snode.sendMessage(message)));
    if (results.some(result => result === true)) {
      this.messages.add(message);
    } else {
      console.log(`Failed to send message to whole swarm at ${message.timestamp}`);
    };
  }

  async updateStats() {
    await Promise.all(this.swarm.map(async snode => {
      try {
        const messages = await snode.retrieveAllMessages(this.pubKey);
        snode.messagesHolding = messages.length;
      } catch (e) {
        console.log(e);
      }
    }));
  }

  printStats() {
    let inconsistent = false;
    const shouldHave = this.messages.size;
    this.swarm.forEach(snode => {
      if (snode.messagesHolding !== shouldHave) {
        if (!inconsistent) {
          inconsistent = true;
          console.log(`Inconsistent messages for account ${this.pubKey}`);
        }
        console.log(`Snode ${snode.ip}:${snode.port} should have ${shouldHave} but has ${snode.messagesHolding}`);
      }
    })
  }
}
