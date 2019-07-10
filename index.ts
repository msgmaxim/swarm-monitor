import { Account } from './account';

const NUM_ACCOUNTS = 10;
const accounts: Account[] = [];

const sleep = (ms: number) => {
  return new Promise(resolve => {
    setTimeout(resolve,ms)
  });
}

const start = async () => {
  Array(NUM_ACCOUNTS)
    .fill(NUM_ACCOUNTS)
    .map(_ => {
      accounts.push(new Account());
    })
  await Promise.all(accounts.map(async a => await a.sendBurst()));
  await sleep(5000);
  await Promise.all(accounts.map(async a => await a.updateStats()));
  accounts.map(a => a.printStats());
}

start();
