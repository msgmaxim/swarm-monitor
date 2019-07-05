const { pow } = require('./proof-of-work');

const PUB_KEY_CHARS = '0123456789abcdef';
const PUB_KEY_CHARS_LEN = PUB_KEY_CHARS.length;
const DATA_CHARS = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DATA_CHARS_LEN = DATA_CHARS.length;
const DATA_LEN = 20;
const TTL = 86400000; // 24 hours
const DIFFICULTY = 1;

const generatePubKey = () => {
  let pubKey = '05';
  for (let i = 0; i < 64; i++) {
    pubKey += PUB_KEY_CHARS.charAt(Math.floor(Math.random() * PUB_KEY_CHARS_LEN));
  }
  return pubKey;
}

const generateData = () => {
  let data = '';
  for (let i = 0; i < DATA_LEN; i++) {
    data += DATA_CHARS.charAt(Math.floor(Math.random() * DATA_CHARS_LEN));
  }
  return data;
}

const getTimestamp = () => {
  return new Date().getTime();
}

const start = async () => {
  const nonce = await pow.calcPoW(getTimestamp(), TTL, generatePubKey(), generateData(), DIFFICULTY);
  console.log(nonce);
}

start();
