const { Account } = require('./account');
const { Message } = require('./message');
const { Network } = require('./network');

const start = async () => {
  const network = await Network.getInstance();
  const a = new Account(network);
  await a.updateSwarm();
  const m = new Message();
  console.log(m.nonce)
}

start();
