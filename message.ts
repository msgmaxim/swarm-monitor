import { pow } from './proof-of-work';
import { Network } from './network';

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

  constructor(network: Network, pubKey: string) {
    this.network = network;
    this.pubKey = pubKey;
    this.data = Message._generateData();
    this.timestamp = Message._getTimestamp();
    this.ttl = 86400000; // 24 hours
    this.nonce = pow.calcPoW(this.timestamp, this.ttl, pubKey, this.data, DIFFICULTY);
  }

  static _getTimestamp() {
    return new Date().getTime();
  }

  static _generateData() {
    let data = '';
    for (let i = 0; i < DATA_LEN; i++) {
      data += DATA_CHARS.charAt(Math.floor(Math.random() * DATA_CHARS_LEN));
    }
    return data;
  }
}
