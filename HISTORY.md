# 0.2.2 / 30-07-2020

**Enhancements:**
- Dependency patch updates:
  - ethers.js: 5.0.4 to 5.0.5

# 0.2.1 / 24-07-2020

**Enhancements:**
- Updated `ethers` and `typescript`, fixed [SNYK-JS-ELLIPTIC-571484](https://snyk.io/vuln/SNYK-JS-ELLIPTIC-571484)
- Node versions 12, 13 and 14 supported
- Security patches for dependent packages

# 0.2.0 / 15-03-2020

**Breaking:**

- Switch from web3 to ethers.js lib
- `web3` getter was removed, added `provider` getter instead
- `account` getter replaced by `wallet` (from ethers.js)
- `VcStatusRegistry` is no longer a default export
- Replaced optional constructor parameters `gasMultiplier`, `gasPriceMax` by `gasPrice`
- Added optional parameters `txNonceMaxRaceCount` and `txNonceMaxIdleTime` for nonce management. The VcStatusRegistryOptions object is now defined as follows:

```json
VcStatusRegistryOptions {
    gasLimit?: number
    gasPrice?: number
    txNonceMaxRaceCount?: number
    txNonceMaxIdleTime?: number
}
```

- `removeVcStatus` function merged into `setVcStatus`.
The function `setVcStatus` can now be called with an extra (optional) parameter `true` or `false`, setting the status of the credential accordingly:

```
setVcStatus(credentialId: string, value: boolean = true): Promise<string>
// false = make the credential invalid
```

**Enhancements:**

- Added functionality for monitoring registry status:

```json
enum PastEventType = { set, remove }

getBlockNumber(): => Promise<number>
getPastStatusEvents(eventType: PastEventType, did: string, fromBlock?: number, toBlock?: number | string): Promise<Array<ContractEventData>>

// Observables
onNewBlock(): Observable<NewBlockData>
onSetVcStatus(): Observable<ContractEventData>
onRemoveVcStatus(): Observable<ContractEventData>
onError(): Observable<any>
```

- Added `ABI` getter
- Updated all dependencies
- Introduced [HISTORY.md](HISTORY.md)

# 0.1.0 / 20-09-2019

*Initial release*
