import { Network } from './network';

export class Snode {
  network: Network;
  ip: string;
  port: string;

  constructor(network: Network, ip: string, port: string) {
    this.network = network;
    this.ip = ip;
    this.port = port;
  }
}
