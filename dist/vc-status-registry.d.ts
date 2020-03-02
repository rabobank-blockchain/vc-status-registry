import { providers, Wallet } from 'ethers';
import { VcStatusRegistryOptions, ContractEventData, NewBlockData } from './interfaces';
import TransactionCount from './transaction-count';
import { Subject } from 'rxjs';
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
    private initiateStatusSetEventSubscriber;
    private initiateStatusRemovedEventSubscriber;
    private initiateErrorEventSubscriber;
    getBlockNumber: () => Promise<number>;
    private initiateNewBlockEventSubscriber;
    getPastStatusSetEvents(did: string, fromBlock?: number, toBlock?: number | string): Promise<Array<ContractEventData>>;
    getPastStatusRemoveEvents(did: string, fromBlock?: number, toBlock?: number | string): Promise<Array<ContractEventData>>;
    private getFilter;
}
export { Wallet, TransactionCount };
export default VcStatusRegistry;
