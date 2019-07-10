import { Network } from './network';
import { Message } from './message';

export class Snode {
  network: Network;
  ip: string;
  port: string;
  messagesHolding: number;
  lastHash: string;

  constructor(ip: string, port: string) {
    this.network = new Network();
    this.ip = ip;
    this.port = port;
    this.messagesHolding = 0;
    this.lastHash = '';
  }

  async sendMessage(message: Message) {
    const url = `https://${this.ip}:${this.port}/storage_rpc/v1`;
    const success = await this.network.sendToSnode(url, message);
    if (success) {
      message.markSent(this);
    }
    return success;
  }

  async retrieveAllMessages(pubKey: string) {
    let allMessages: Array<string> = [];
    let complete = false;
    while (!complete) {
      const newMessages = await this._retrieveMessages(pubKey);
      complete = newMessages < 10;
      allMessages = allMessages.concat(newMessages);
    }
    return allMessages
  }

  private async _retrieveMessages(pubKey: string) {
    const url = `https://${this.ip}:${this.port}/storage_rpc/v1`;
    const messages = await this.network.retrieveFromSnode(url, pubKey, this.lastHash);
    this.lastHash = messages[messages.length - 1];
    return messages;
  }
}
