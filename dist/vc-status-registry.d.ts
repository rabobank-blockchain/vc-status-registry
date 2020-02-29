import { providers, Wallet } from 'ethers';
import { Subject } from 'rxjs';
/**
 * Override Ethereum gas options
 */
declare interface VcStatusRegistryOptions {
    gasLimit?: number;
    gasPrice?: number;
    txNonceMaxRaceCount?: number;
    txNonceMaxIdleTime?: number;
}
export interface ContractEventData {
    blockNumber: number;
    blockHash: string;
    transactionIndex: number;
    removed: boolean;
    address: string;
    data: string;
    topics: string[];
    transactionHash: string;
    logIndex: number;
}
export interface NewBlockData {
    blockNumber: number;
}
export declare class VcStatusRegistry {
    private readonly _ethereumProvider;
    private readonly _contractAddress;
    private readonly _options;
    private _provider;
    private readonly _wallet;
    private readonly _contract;
    private _transactionCount;
    private _onNewBlock;
    private _onSetVcStatus;
    private _onRemoveVcStatus;
    private _onError;
    /**
     * @constructor Will set up the connection to an ethereum provider with provided credentials.
     * @param ethereumProvider connection string
     * @param contractAddress address of the contract '0x...'
     * @param privateKey optional, private key for issuing credentials
     * @param options optional, see VcStatusRegistryOptions
     */
    constructor(_ethereumProvider: string, _contractAddress: string, privateKey?: string, _options?: VcStatusRegistryOptions);
    readonly ethereumProvider: string;
    readonly contractAddress: string;
    readonly provider: providers.JsonRpcProvider;
    readonly wallet: Wallet | undefined;
    readonly ABI: object;
    readonly onNewBlock: Subject<NewBlockData>;
    readonly onSetVcStatus: Subject<ContractEventData>;
    readonly onRemoveVcStatus: Subject<ContractEventData>;
    readonly onError: Subject<any>;
    setVcStatus: (credentialId: string) => Promise<string>;
    removeVcStatus: (credentialId: string) => Promise<string>;
    getVcStatus: (issuer: string, credentialId: string) => Promise<string>;
    private _sendSignedTransaction;
    private _contractMethod;
    private initiateEventSubscriptions;
    private initiateStatusSetEventSubscriber;
    private initiateStatusRemovedEventSubscriber;
    private initiateErrorEventSubscriber;
    getBlockNumber: () => Promise<number>;
    private initiateNewBlockEventSubscriber;
    getPastStatusSetEvents(did: string, fromBlock?: number, toBlock?: number | string): Promise<Array<ContractEventData>>;
    getPastStatusRemoveEvents(did: string, fromBlock?: number, toBlock?: number | string): Promise<Array<ContractEventData>>;
}
declare class TransactionCount {
    private readonly _wallet;
    private readonly _options;
    /**
     * currentTransaction holds the last transactionCount
     * Race conditions might occur. try to manage:
     * - transactionNr missed. reset if raceCount > maxRaceCount
     * - idle for some time. reset if lastTxTime > maxIdleTime
     * In the future you might want to handle this completely different by keeping
     * track of all open requests
     */
    private _currentTransaction;
    private _raceCount;
    private _lastTxTime;
    constructor(_wallet: Wallet, _options?: VcStatusRegistryOptions);
    transactionCount: () => Promise<number>;
}
export { Wallet, TransactionCount };
export default VcStatusRegistry;
