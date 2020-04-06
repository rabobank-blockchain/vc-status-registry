/**
 * Override Ethereum gas options
 */
export interface VcStatusRegistryOptions {
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
export declare enum PastEventType {
    set = 0,
    remove = 1
}
