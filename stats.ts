export class NodeStats {
    pubkey: string;
    ip: string;
    port: string;
    client_store_requests : number;
    client_retrieve_requests : number;
    reset_time : number;

    constructor(pubkey: string, ip: string, port: string, store: number, retrieve: number, reset_time : number) {
        this.pubkey = pubkey;
        this.ip = ip;
        this.port = port;
        this.client_store_requests = store;
        this.client_retrieve_requests = retrieve;
        this.reset_time = reset_time;
    }
}
