const { network } = require('./network');
const { Message } = require('./message');

// Pubkey constants
const PUB_KEY_CHARS = '0123456789abcdef';
const PUB_KEY_CHARS_LEN = PUB_KEY_CHARS.length;
const PUB_KEY_LEN = 64;

class Account {
  constructor() {
    this.pubKey = Account._generatePubKey();
    this.messages = {};
  }

  static _generatePubKey() {
    let pubKey = '05';
    for (let i = 0; i < PUB_KEY_LEN; i++) {
      pubKey += PUB_KEY_CHARS.charAt(Math.floor(Math.random() * PUB_KEY_CHARS_LEN));
    }
    return pubKey;
  }
}

module.exports = {
  Account,
}
