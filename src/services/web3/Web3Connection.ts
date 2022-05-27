import Web3 from "web3";
import { WebsocketProvider } from "web3-core";

export default class Web3Connection {
  private _web3Instance!: Web3;

  private static _instance: Web3Connection;

  private constructor(private web3Provider: WebsocketProvider) {
    if (!this._web3Instance) {
      this._web3Instance = new Web3(this.web3Provider);
    }
  }

  public static getInstance(web3Provider: WebsocketProvider) {
    if (!this._instance) this._instance = new Web3Connection(web3Provider);
    return this._instance;
  }

  /**
   * @throws {Error}
   */
  public setWeb3ToWindowObject(): void {
    if (!this._web3Instance)
      throw new Error(`You should initialize web3 first.`);
    if (`web3` in window) return;
    // @ts-ignore
    window.web3 = this._web3Instance;
  }

  public getWeb3(): Web3 {
    return this._web3Instance;
  }
}
