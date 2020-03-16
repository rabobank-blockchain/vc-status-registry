import { Wallet } from 'ethers';
import { VcStatusRegistryOptions } from './interfaces';
export declare class TransactionCount {
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
