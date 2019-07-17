const toUptime = (reset_time: any) => {
    let now_ms: any = new Date();
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


export class PeerStats {
    pubkey: string;
    pushes_failed: number;
    requests_failed: number;

    constructor(pubkey: string, pushes_failed: number, req_failed: number) {
        this.pubkey = pubkey;
        this.pushes_failed = pushes_failed;
        this.requests_failed = req_failed;
    }
}

// For a given node how many test we failed based
// on reports from other nodes
export class NodePerformance {
    req_failed: number

    constructor(req_failed: number) {
        this.req_failed = req_failed
    }
}

export const printLifetimeStats = (results: NodeStats[]) => {

    const margin = "  ";
    let header = "";
    header += "PubKey".padStart(16) + margin;
    header += "IP".padStart(16) + margin;
    header += "Port".padStart(5) + margin;
    header += "Uptime".padStart(12) + margin;
    header += "Store".padStart(10) + margin;
    header += "Retrieve".padStart(10) + margin;
    console.log(header);
    console.log("-".repeat(header.length));

    let swarm_ids: Map<string, NodeStats[]> = new Map();

    results.forEach((res: NodeStats) => {

        if (!swarm_ids.has(res.swarm_id)) {
            swarm_ids.set(res.swarm_id, []);
        }
        let val = swarm_ids.get(res.swarm_id);
        val.push(res);
        swarm_ids.set(res.swarm_id, val);
    });

    for (let [swarm_id, stats] of swarm_ids) {

        let swarm_id_str = ` SwarmID: ${swarm_id} `;
        let w = (header.length - swarm_id_str.length) / 2;
        console.log("=".repeat(w) + swarm_id_str + "=".repeat(w));

        stats.forEach((res: NodeStats) => {

            let line = "";
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

}

export const printDiff = (prev: Map<string, NodeStats>, cur: Map<string, NodeStats>) => {

    const margin = "  ";
    let header = '';
    header += "PubKey".padStart(16) + margin;
    header += "IP".padStart(16) + margin;
    header += "Port".padStart(5) + margin;
    header += "Uptime".padStart(12) + margin;
    header += "Store".padStart(10) + margin;
    header += "Retrieve".padStart(10) + margin;
    console.log(header);
    console.log("-".repeat(header.length))

    prev.forEach(x => {
        let line = '';
        line += x.pubkey.substr(0, 16).padStart(16) + margin;
        line += x.ip.padStart(16) + margin;
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

export class NodeStats {
    pubkey: string;
    ip: string;
    port: string;
    client_store_requests: number;
    client_retrieve_requests: number;
    reset_time: number;
    swarm_id: string;
    peer_stats: Map<string, PeerStats>;

    constructor(pubkey: string, ip: string, port: string, store: number, retrieve: number, reset_time: number, swarm_id: string) {
        this.pubkey = pubkey;
        this.ip = ip;
        this.port = port;
        this.client_store_requests = store;
        this.client_retrieve_requests = retrieve;
        this.reset_time = reset_time;
        this.swarm_id = swarm_id;
        this.peer_stats = new Map();
    }

    add_peer_stats(stats: PeerStats) {
        this.peer_stats.set(stats.pubkey, stats);
    }
}
