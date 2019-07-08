import { Network } from './network';
import { Message } from './message';

export class Snode {
  network: Network;
  ip: string;
  port: string;

  constructor(ip: string, port: string) {
    this.network = new Network();
    this.ip = ip;
    this.port = port;
  }

  async sendMessage(message: Message) {
    const success = await this.network.sendToSnode(message, this);
    if (success) {
      message.markSent(this);
    }
    return success;
  }
}
