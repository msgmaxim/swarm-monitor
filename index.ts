import { Account } from './account';

const start = async () => {
  const a = new Account();
  await a.sendBurst();
  setTimeout(() => {
    a.updateStats();
  }, 5000);
}

start();
