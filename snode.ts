import { Network } from './network';
import { Message } from './message';

export class Snode {
  network: Network;
  ip: string;
  port: string;
  messagesHolding: number;

  constructor(ip: string, port: string) {
    this.network = new Network();
    this.ip = ip;
    this.port = port;
    this.messagesHolding = 0;
  }

  async sendMessage(message: Message) {
    const url = `https://${this.ip}:${this.port}/storage_rpc/v1`;
    const success = await this.network.sendToSnode(url, message);
    if (success) {
      message.markSent(this);
    }
    return success;
  }

  async retrieveMessages(pubKey: string) {
    const url = `https://${this.ip}:${this.port}/storage_rpc/v1`;
    return this.network.retrieveFromSnode(url, pubKey);
  }
}
