import Web3 = require('web3');
/**
 * Override Ethereum gas options
 */
declare interface VcStatusRegistryOptions {
    gasMultiplier?: number;
    gasLimit?: number;
    gasPriceMax?: number;
}
declare interface Account {
    address?: string;
    privateKey?: string;
    publicKey?: string;
}
export declare class VcStatusRegistry {
    private readonly _web3;
    private readonly _ethereumProvider;
    private readonly _contractAddress;
    private readonly _ABI;
    private readonly _contract;
    private readonly _account;
    private readonly _gasMultiplier;
    private readonly _gasLimit;
    private readonly _gasPriceMax;
    private _transactionCount;
    /**
     * @constructor Will set up the connection to an ethereum provider with provided credentials.
     * @param ethereumProvider connection string
     * @param contractAddress address of the contract '0x...'
     * @param privateKey optional, private key for issuing credentials
     * @param options optional, see VcStatusRegistryOptions
     */
    constructor(ethereumProvider: string, contractAddress: string, privateKey?: string, options?: VcStatusRegistryOptions);
    readonly ethereumProvider: string;
    readonly contractAddress: string;
    readonly web3: Web3;
    readonly account: Account;
    setVcStatus: (credentialId: string) => Promise<string>;
    removeVcStatus: (credentialId: string) => Promise<string>;
    getVcStatus: (issuer: string, credentialId: string) => Promise<string>;
    private pickDefault;
    private sendSignedTransaction;
    _sendSignedTransaction: (serializedTx: string) => Promise<string>;
}
export default VcStatusRegistry;
