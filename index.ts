import { Account } from './account';
import { Network } from './network';
import { NodeStats } from './stats';
import { sleep } from './utils';

const COMMANDS = {
  update: 'update_stats',
  accStats: 'acc_stats',
  snodeStats: 'snode_stats',
  addAccs: 'add_accounts',
  send: 'send',
};
const START_MODES = {
  command: 'command',
  snodeStats: 'snode_stats',
};
const NUM_ACCOUNTS = 10;

const accounts: Account[] = [];
const network = new Network;

const defaultMode = async () => {
  Array(NUM_ACCOUNTS)
    .fill(NUM_ACCOUNTS)
    .map(_ => {
      accounts.push(new Account());
    });
  await Promise.all(accounts.map(async a => {
    const allNodes = await network.getAllNodes();
    const swarm = await a.getSwarm();
    await a.sendMessages(swarm)
    await sleep(5000);
    await a.updateStats(swarm);
    a.printStats(swarm);
  }));
}

const getSnodeStats = async () => {

  const nodes = await network.getAllNodes();

  let results = await Promise.all(nodes.map(async a => await network.getStats(a)));

  const online_count = results.reduce((acc, x) => acc += (x.reset_time !== 0 ? 1 : 0), 0);

  console.log(`Nodes online: ${online_count}/${nodes.length}`);

  NodeStats.printLifetimeStats(results);

  await sleep(60000); // 1 min

  /// save to a map
  let prev_results = new Map<string, NodeStats>();

  results.forEach(x => {
    prev_results.set(x.pubkey, x);
  });


  let results_2 = await Promise.all(nodes.map(async a => await network.getStats(a)));

  let cur_results = new Map<string, NodeStats>();

  results_2.forEach(x => {
    cur_results.set(x.pubkey, x);
  });

  console.log("Difference:");

  NodeStats.printDiff(prev_results, cur_results);
}

const commandMode = () => {
  console.log(`Starting in command mode, possible commands:\n\n[${Object.values(COMMANDS).join(', ')}]`);
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', async (data: string) => {
    process.stdin.pause();
    const input = data.trim().split(' ');
    const command = input[0];
    switch (command) {
      case COMMANDS.update:
        console.log('Updating stats...');
        await Promise.all(accounts.map(async a => {
          const swarm = await a.getSwarm();
          await a.updateStats(swarm);
        }));
        console.log('Stats updated');
        break;

      case COMMANDS.accStats:
        console.log('Printing account stats...');
        await Promise.all(accounts.map(async a => {
          const swarm = await a.getSwarm();
          await a.updateStats(swarm)
          await a.printStats(swarm)
        }));
        console.log('Printing complete...');
        break;

      case COMMANDS.snodeStats:
        console.log('Printing snode stats...');
        await getSnodeStats();
        console.log('Printing complete...');
        break;

      case COMMANDS.send:
        const n = input[1] && parseInt(input[1]) !== NaN ? parseInt(input[1]) : 1;
        console.log(`Accounts sending ${n} message${n === 1 ? '' : 's'}...`);
        try {
          await Promise.all(accounts.map(async a => {
            const swarm = await a.getSwarm();
            await a.sendMessages(swarm, n);
          }));
        } catch (e) {
          console.log(`Error sending messages: ${e}`)
          break;
        }
        console.log('Messages sent...');
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
    process.stdin.resume();
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

  case START_MODES.snodeStats:
    getSnodeStats();
    break;

  default:
    console.log(`${mode} is not a valid start mode, please use 'node index.js [${Object.values(START_MODES).slice(1).join(', ')}]'`);
    process.exit(1);
    break;
}
