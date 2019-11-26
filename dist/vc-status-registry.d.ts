import { ethers, providers, Contract, Wallet } from 'ethers';
/**
 * Override Ethereum gas options
 */
declare interface VcStatusRegistryOptions {
    gasLimit?: number;
    gasPrice?: number;
    txNonceMaxRaceCount?: number;
    txNonceMaxIdleTime?: number;
}
export declare class VcStatusRegistry {
    private readonly _ethereumProvider;
    private readonly _contractAddress;
    private _provider;
    private readonly _wallet;
    private readonly _contract;
    private readonly _gasLimit;
    private readonly _gasPrice;
    private _transactionCount;
    /**
     * @constructor Will set up the connection to an ethereum provider with provided credentials.
     * @param ethereumProvider connection string
     * @param contractAddress address of the contract '0x...'
     * @param privateKey optional, private key for issuing credentials
     * @param options optional, see VcStatusRegistryOptions
     */
    constructor(_ethereumProvider: string, _contractAddress: string, privateKey?: string, options?: VcStatusRegistryOptions);
    readonly contract: Contract;
    readonly ethereumProvider: string;
    readonly contractAddress: string;
    readonly provider: providers.JsonRpcProvider;
    readonly wallet: Wallet | undefined;
    setVcStatus: (credentialId: string) => Promise<string>;
    removeVcStatus: (credentialId: string) => Promise<string>;
    getVcStatus: (issuer: string, credentialId: string) => Promise<string>;
    private _sendSignedTransaction;
    _contractMethod: (method: string, parameters: any[], overrides: object) => Promise<ethers.providers.TransactionResponse>;
    subscribeEvents(f: any): void;
}
export { Wallet };
export default VcStatusRegistry;
