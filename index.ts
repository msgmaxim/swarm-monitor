import { Account } from './account';
import { Network } from './network';

const start = async () => {
  const network = new Network();
  const a = new Account(network);
  await a.sendMessage();
}

start();
