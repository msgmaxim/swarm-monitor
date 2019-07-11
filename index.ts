import { Account } from './account';

const COMMANDS = {
  update: 'update_stats',
  print: 'print_stats',
  sendBurst: 'send_burst',
  addAccs: 'add_accounts',
};
const START_MODES = {
  command: 'command',
};
const NUM_ACCOUNTS = 10;
const accounts: Account[] = [];

const sleep = (ms: number) => {
  return new Promise(resolve => {
    setTimeout(resolve,ms)
  });
}

const defaultMode = async () => {
  Array(NUM_ACCOUNTS)
    .fill(NUM_ACCOUNTS)
    .map(_ => {
      accounts.push(new Account());
    });
  await Promise.all(accounts.map(async a => await a.sendBurst()));
  await sleep(5000);
  await Promise.all(accounts.map(async a => await a.updateStats()));
  accounts.map(a => a.printStats());
}

const commandMode = () => {
  console.log(`Starting in command mode, possible commands:\n\n[${Object.values(COMMANDS).join(', ')}]`);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', async (data: string) => {
    const input = data.trim().split(' ');
    const command = input[0];
    switch (command) {
      case COMMANDS.update:
        console.log('Updating stats...');
        await Promise.all(accounts.map(async a => await a.updateStats()));
        console.log('Stats updated');
        break;

      case COMMANDS.print:
        console.log('Printing account stats...');
        await Promise.all(accounts.map(async a => await a.updateStats()));
        accounts.map(a => a.printStats());
        console.log('Printing complete...');
        break;

      case COMMANDS.sendBurst:
        console.log('Sending bursts...');
        await Promise.all(accounts.map(async a => await a.sendBurst()));
        console.log('Bursts sent...');
        break;

      case COMMANDS.addAccs:
        const num = input[1] && parseInt(input[1]) !== NaN ? parseInt(input[1]) : 1;
        console.log(`Creating ${num} account${num === 1 ? '' : 's'}`);
        Array(num)
          .fill(num)
          .map(_ => {
            accounts.push(new Account());
          });
        console.log(`Account${num === 1 ? '' : 's'} created...`);
        break;

      default:
        console.log(`${command} is not a valid command, please use one of [${Object.values(COMMANDS).join(', ')}]`);
        break;
    }
  });
}

const args = process.argv.slice(2);
const mode = args[0] ? args[0] : 'default';

switch (mode) {
  case 'default':
    console.log(`Starting default tests, creating ${NUM_ACCOUNTS} accounts and collecting stats...`);
    defaultMode();
    break;

  case START_MODES.command:
    commandMode();
    break;

  default:
    console.log(`${mode} is not a valid start mode, please use 'node index.js [${Object.values(START_MODES).slice(1).join(', ')}]'`);
    process.exit(1);
    break;
}
