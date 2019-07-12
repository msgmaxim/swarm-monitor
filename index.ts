import { Account } from './account';
import { Snode } from './snode';
import { Network } from './network';
import fetch from 'node-fetch';
import { NodeStats } from './stats'

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
    process.stdin.pause();
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
        try {
          await Promise.all(accounts.map(async a => await a.sendBurst()));
        } catch (e) {
          console.log(`Error sending bursts: ${e}`)
          break;
        }
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

  default:
    console.log(`${mode} is not a valid start mode, please use 'node index.js [${Object.values(START_MODES).slice(1).join(', ')}]'`);
    process.exit(1);
    break;
}

// start();


const getStats = async (sn : Snode) : Promise<NodeStats> => {

  const url = `https://${sn.ip}:${sn.port}/get_stats/v1`

  try {
    const response = await fetch(url, {timeout: 2000});
    if (!response.ok) {
      return new NodeStats(sn.pubkey, sn.ip, sn.port, 0,0,0);
    }
    let res = await response.json();

    return new NodeStats(sn.pubkey, sn.ip, sn.port, res.client_store_requests, res.client_retrieve_requests, res.reset_time);
  } catch (e) {
    return new NodeStats(sn.pubkey, sn.ip, sn.port, 0,0,0);
  }

}

const toUptime = (reset_time : any) => {
  let now_ms : any = new Date();
  const now_sec = Math.floor(now_ms / 1000);
  const uptime = (now_sec - reset_time);
  const total_minutes = Math.floor(uptime / 60);
  const total_hours = Math.floor(total_minutes / 60);
  const days = Math.floor(total_hours / 24);
  const hours = total_hours % 24;
  const minutes = total_minutes % 60;

  const hours_str = hours.toString().padStart(2);
  const mins_str = minutes.toString().padStart(2);

  if (days === 0) {
    return `${hours_str}h ${mins_str}m`
  } else {
    return `${days}d ${hours_str}h ${mins_str}m`
  }

}

const printLifetimeStats = (results : any) => {

  const margin = "  ";
  let header = "";
  header += "PubKey".padStart(16) + margin;
  header += "IP".padStart(16) + margin;
  header += "Port".padStart(5) + margin;
  header += "Uptime".padStart(12) + margin;
  header += "Store".padStart(10) + margin;
  header += "Retrieve".padStart(10) + margin;
  console.log(header);
  console.log("--------------------------------------------------------------------------------------")

  results.forEach((res: any) => {

    let line = ""
    line += res.pubkey.substr(0, 16).padStart(16) + margin;
    line += res.ip.padStart(16) + margin;
    line += res.port.toString().padStart(5) + margin;

    if (res.reset_time !== 0) {
      const uptime = toUptime(res.reset_time);
      const store_req = res.client_store_requests.toLocaleString();
      const retrieve_req = res.client_retrieve_requests.toLocaleString();

      line += uptime.padStart(12) + margin;
      line += store_req.padStart(10) + margin;
      line += retrieve_req.padStart(10) + margin;
    }

    console.log(line)
  })

}

const printDiff = (prev : Map<string, NodeStats>, cur : Map<string, NodeStats>) => {

  const margin = "  ";
  let header = "IP".padStart(16) + margin;
  header += "Port".padStart(5) + margin;
  header += "Uptime".padStart(12) + margin;
  header += "Store".padStart(10) + margin;
  header += "Retrieve".padStart(10) + margin;
  console.log(header);
  console.log("-------------------------------------------------------------")

  prev.forEach(x => {
    let line = x.ip.padStart(16) + margin;
    line += x.port.toString().padStart(5) + margin;

    if (x.reset_time !== 0) {

      const uptime = "";
      const store_diff = cur.get(x.pubkey).client_store_requests - x.client_store_requests;
      const store_diff_str = store_diff.toLocaleString();

      const retrieve_diff = cur.get(x.pubkey).client_retrieve_requests - x.client_retrieve_requests;
      const retrieve_diff_str = retrieve_diff.toLocaleString();

      line += uptime.padStart(12) + margin;
      line += store_diff_str.padStart(10) + margin;
      line += retrieve_diff_str.padStart(10) + margin;

    }

    console.log(line);
  });

}

const start2 = async () => {

  const network = new Network;

  await network.updateAllNodes();

  const nodes = network.allNodes;

  let results = await Promise.all(nodes.map(async a => await getStats(a)));

  const online_count = results.reduce((acc, x) => acc += (x.reset_time !== 0 ? 1 : 0), 0);

  console.log(`Nodes online: ${online_count}/${nodes.length}`);

  printLifetimeStats(results);

  /// save to a map
  let prev_results = new Map<string, NodeStats>();

  results.forEach(x => {
      prev_results.set(x.pubkey, x);
  });

  await sleep(60000); // 1 min

  let results_2 = await Promise.all(nodes.map(async a => await getStats(a)));

  let cur_results = new Map<string, NodeStats>();

  results_2.forEach(x => {
    cur_results.set(x.pubkey, x);
  });

  console.log("Difference:");

  printDiff(prev_results, cur_results);

}

start2();
