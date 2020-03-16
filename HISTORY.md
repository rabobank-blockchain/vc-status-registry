# 0.2.0 / 15-03-2020

**Breaking:**

- Switch from web3 to ethers.js lib
- `web3` removed from the interface
- web3 object `account` replaced by ethers.js object `wallet`
- Some optional parameters `gasMultiplier`, `gasPriceMax` for gas management have been replaced by `gasPrice`
- Some optional parameters `txNonceMaxRaceCount` and `txNonceMaxIdleTime` for nonce management have been added. The VcStatusRegistryOptions object is now defined as follows:

```json
VcStatusRegistryOptions {
    gasLimit?: number
    gasPrice?: number
    txNonceMaxRaceCount?: number
    txNonceMaxIdleTime?: number
}
```

- Better coding practices (preventing duplicate code blocks) let to the decision to integrate the `removeVcStatus` function into `setVcStatus`. The function `setVcStatus` can now be called with an extra (optional) parameter `true` or `false`, setting the status of the credential accordingly:

```
setVcStatus(credentialId: string, value: boolean = true): Promise<string>
```
 
**Enhancements:**

- Added functionality for monitoring registry status:

```json
enum PastEventType = { set, remove }

getBlockNumber(): => Promise<number>
getPastStatusEvents(eventType: PastEventType, did: string, fromBlock?: number, toBlock?: number | string): Promise<Array<ContractEventData>>

// Observables
onNewBlock(): Subject<NewBlockData>
onSetVcStatus(): Subject<ContractEventData>
onRemoveVcStatus(): Subject<ContractEventData>
onError(): Subject<any>
```

- Updated all dependencies
- Introduced [HISTORY.md](HISTORY.md)

# 0.1.0 / 20-09-2019

*Initial release*
