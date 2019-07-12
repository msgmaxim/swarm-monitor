import { Account } from './account';
import { Snode } from './snode';
import { Network } from './network';
import fetch from 'node-fetch';
import { NodeStats } from './stats'

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

  results.forEach(res => {

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

  await network._updateAllNodes();

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
