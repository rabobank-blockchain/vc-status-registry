/*
 * Copyright 2019 Coöperatieve Rabobank U.A.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Wallet } from 'ethers'
import { VcStatusRegistryOptions } from './interfaces'

class TransactionCount {
  /**
   * currentTransaction holds the last transactionCount
   * Race conditions might occur. try to manage:
   * - transactionNr missed. reset if raceCount > maxRaceCount
   * - idle for some time. reset if lastTxTime > maxIdleTime
   * In the future you might want to handle this completely different by keeping
   * track of all open requests
   */
  private _currentTransaction = 0
  private _raceCount = 0
  private _lastTxTime = 0

  constructor (private readonly _wallet: Wallet, private readonly _options: VcStatusRegistryOptions = {}) {}

  public transactionCount = async (): Promise<number> => {
    const maxRaceCount = this._options.txNonceMaxRaceCount !== undefined ? this._options.txNonceMaxRaceCount : 100
    let maxIdleTime = this._options.txNonceMaxIdleTime !== undefined ? this._options.txNonceMaxIdleTime : 30000 // Make sure to skip at least 1 block

    const now = new Date().valueOf() // Time in miliseconds since 1970
    const nonce = await this._wallet.getTransactionCount()
    if (
      (nonce > this._currentTransaction) ||
      (this._raceCount >= maxRaceCount) ||
      ((now - this._lastTxTime) >= maxIdleTime)
    ) {
      // Normal situation
      this._raceCount = 0
      this._lastTxTime = now
      this._currentTransaction = nonce
      return this._currentTransaction
    } else {
      // We might be racing. Add one more transaction
      this._raceCount++
      this._lastTxTime = now
      return ++this._currentTransaction
    }
  }
}

export default TransactionCount
