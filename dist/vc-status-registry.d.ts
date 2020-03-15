import { providers, Wallet } from 'ethers';
import { VcStatusRegistryOptions, ContractEventData, NewBlockData, PastEventType } from './interfaces';
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
    get ethereumProvider(): string;
    get contractAddress(): string;
    get provider(): providers.JsonRpcProvider;
    get wallet(): Wallet | undefined;
    get ABI(): object;
    get onNewBlock(): Subject<NewBlockData>;
    get onSetVcStatus(): Subject<ContractEventData>;
    get onRemoveVcStatus(): Subject<ContractEventData>;
    get onError(): Subject<any>;
    setVcStatus: (credentialId: string, value?: boolean) => Promise<string>;
    getVcStatus: (issuer: string, credentialId: string) => Promise<string>;
    private _contractMethod;
    private initiateStatusEventSubscriber;
    private initiateErrorEventSubscriber;
    getBlockNumber: () => Promise<number>;
    private initiateNewBlockEventSubscriber;
    getPastStatusEvents(eventType: PastEventType, did: string, fromBlock?: number, toBlock?: number | string): Promise<Array<ContractEventData>>;
}
export { Wallet, TransactionCount, VcStatusRegistryOptions, ContractEventData, NewBlockData, PastEventType };
export default VcStatusRegistry;
