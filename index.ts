import { Account } from './account';
import { Message } from './message';
import { Network } from './network';

const start = async () => {
  const network = new Network();
  const a = new Account(network);
  await a.updateSwarm();
  const m = new Message(network, a.pubKey);
  console.log(m.nonce)
}

start();
