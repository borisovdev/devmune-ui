import { Contract } from "web3-eth-contract";
import Web3Connection from "./Web3Connection";

export default class Web3ContractDevmuneRating {
  private _contractInstance!: Contract;

  private static _instance: Web3ContractDevmuneRating;

  private constructor(
    private contractAbi: any,
    private contractAddress: string,
    private web3Connection: Web3Connection
  ) {
    if (!this._contractInstance) {
      const web3 = this.web3Connection.getWeb3();
      this._contractInstance = new web3.eth.Contract(
        this.contractAbi,
        this.contractAddress
      );
    }
  }

  public static getInstance(
    contractAbi: any,
    contractAddress: string,
    web3Connection: Web3Connection
  ): Web3ContractDevmuneRating {
    if (!this._instance)
      this._instance = new Web3ContractDevmuneRating(
        contractAbi,
        contractAddress,
        web3Connection
      );
    return this._instance;
  }

  public getContract(): Contract {
    return this._contractInstance;
  }

  /**
   *
   * @param repo
   * @param repoOwner
   * @param fromDate
   * @throws {Error}
   */
  public async sendRequestRatingFromContract(
    repo: string,
    repoOwner: string,
    fromDate: string
  ): Promise<any> {
    const contractMethodTransactionAbi = this._contractInstance.methods
      .requestRating(repo, repoOwner, fromDate)
      .encodeABI();
    debugger;

    const transactionParameters = {
      to: this._contractInstance.options.address,
      // @ts-ignore
      from: window.ethereum.selectedAddress,
      data: contractMethodTransactionAbi,
    };
    // @ts-ignore
    const txHash = await window.ethereum.request({
      method: "eth_sendTransaction",
      params: [transactionParameters],
    });

    return txHash;
  }
}
