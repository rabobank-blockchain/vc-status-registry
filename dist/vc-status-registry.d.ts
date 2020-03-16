import { providers, Wallet } from 'ethers';
import { VcStatusRegistryOptions, ContractEventData, NewBlockData, PastEventType } from './interfaces';
import { Subject } from 'rxjs';
export declare class VcStatusRegistry {
    private readonly _ethereumProvider;
    private readonly _contractAddress;
    private readonly _options;
    private readonly _provider;
    private readonly _wallet;
    private readonly _contract;
    private _transactionCount;
    private _onNewBlock;
    private _onSetVcStatus;
    private _onRemoveVcStatus;
    private _onError;
    /**
     * @constructor Will set up the connection to an ethereum provider with provided credentials.
     * @param _ethereumProvider connection string
     * @param _contractAddress address of the contract '0x...'
     * @param privateKey optional, private key for issuing credentials
     * @param _options optional, see VcStatusRegistryOptions
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
    setVcStatus: (credentialId: string, value?: boolean) => Promise<string>;
    getVcStatus: (issuer: string, credentialId: string) => Promise<string>;
    private _contractMethod;
    private initiateStatusEventSubscriber;
    private initiateErrorEventSubscriber;
    getBlockNumber: () => Promise<number>;
    private initiateNewBlockEventSubscriber;
    getPastStatusEvents(eventType: PastEventType, did: string, fromBlock?: number, toBlock?: number | string): Promise<Array<ContractEventData>>;
}
