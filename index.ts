import { Account } from './account';

const start = async () => {
  const a = new Account();
  await a.sendMessage();
}

start();
