import { pow } from './proof-of-work';
import { Network } from './network';
import { Snode } from './snode';

// Message data constants
const DATA_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DATA_CHARS_LEN = DATA_CHARS.length;
const DATA_LEN = 20;
// Current network difficulty
const DIFFICULTY = 1;

export class Message {
  network: Network;
  pubKey: string;
  data: string;
  timestamp: number;
  ttl: number;
  nonce: string;
  hash: string;
  sentTo: Set<Snode>;

  constructor(pubKey: string) {
    this.network = new Network();
    this.pubKey = pubKey;
    this.data = Message._generateData();
    this.timestamp = Message._generateTimestamp();
    this.ttl = 86400000; // 24 hours
    [this.nonce, this.hash] = pow.calcPoW(this.timestamp, this.ttl, pubKey, this.data, DIFFICULTY);
    this.sentTo = new Set();
  }

  private static _generateTimestamp() {
    return new Date().getTime();
  }

  private static _generateData() {
    let data = '';
    for (let i = 0; i < DATA_LEN; i++) {
      data += DATA_CHARS.charAt(Math.floor(Math.random() * DATA_CHARS_LEN));
    }
    return data;
  }

  markSent(snode: Snode) {
    this.sentTo.add(snode);
  }
}
