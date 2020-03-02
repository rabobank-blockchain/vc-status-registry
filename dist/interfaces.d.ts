/**
 * Override Ethereum gas options
 */
declare interface VcStatusRegistryOptions {
    gasLimit?: number;
    gasPrice?: number;
    txNonceMaxRaceCount?: number;
    txNonceMaxIdleTime?: number;
}
declare interface ContractEventData {
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
declare interface NewBlockData {
    blockNumber: number;
}
export { VcStatusRegistryOptions, ContractEventData, NewBlockData };
