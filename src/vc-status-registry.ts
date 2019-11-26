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

import { ethers, providers, Contract, Wallet } from 'ethers'

/**
 * Override Ethereum gas options
 */
declare interface VcStatusRegistryOptions {
  gasLimit?: number
  gasPrice?: number
  txNonceMaxRaceCount?: number
  txNonceMaxIdleTime?: number
}

declare interface Account {
  address?: string
  privateKey?: string
  publicKey?: string
}

const ABI = [
  {
    'constant': false,
    'inputs': [
      {
        'name': 'credentialId',
        'type': 'address'
      }
    ],
    'name': 'setVcStatus',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': false,
    'inputs': [
      {
        'name': 'credentialId',
        'type': 'address'
      }
    ],
    'name': 'removeVcStatus',
    'outputs': [],
    'payable': false,
    'stateMutability': 'nonpayable',
    'type': 'function'
  },
  {
    'constant': true,
    'inputs': [
      {
        'name': 'issuer',
        'type': 'address'
      },
      {
        'name': 'credentialId',
        'type': 'address'
      }
    ],
    'name': 'getVcStatus',
    'outputs': [
      {
        'name': '',
        'type': 'bool'
      }
    ],
    'payable': false,
    'stateMutability': 'view',
    'type': 'function'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': true,
        'name': 'issuer',
        'type': 'address'
      },
      {
        'indexed': true,
        'name': 'credentialId',
        'type': 'address'
      }
    ],
    'name': 'VcStatusSet',
    'type': 'event'
  },
  {
    'anonymous': false,
    'inputs': [
      {
        'indexed': true,
        'name': 'issuer',
        'type': 'address'
      },
      {
        'indexed': true,
        'name': 'credentialId',
        'type': 'address'
      }
    ],
    'name': 'VcStatusRemoved',
    'type': 'event'
  }
]

export class VcStatusRegistry {
  private _provider: providers.JsonRpcProvider
  private readonly _wallet: Wallet | undefined
  private readonly _contract: Contract
  private readonly _gasLimit: number | undefined
  private readonly _gasPrice: number | undefined
  private _transactionCount: TransactionCount | undefined

  /**
   * @constructor Will set up the connection to an ethereum provider with provided credentials.
   * @param ethereumProvider connection string
   * @param contractAddress address of the contract '0x...'
   * @param privateKey optional, private key for issuing credentials
   * @param options optional, see VcStatusRegistryOptions
   */
  constructor (
    private readonly _ethereumProvider: string,
    private readonly _contractAddress: string,
    privateKey?: string,
    options: VcStatusRegistryOptions = {}
  ) {
    this._gasLimit = options.gasLimit
    this._gasPrice = options.gasPrice
    this._provider = new ethers.providers.JsonRpcProvider(this._ethereumProvider)
    this._contract = new ethers.Contract(this._contractAddress, ABI, this._provider)

    if (privateKey) {
      this._wallet = new ethers.Wallet(Buffer.from(privateKey, 'hex'), this._provider)
      this._transactionCount = new TransactionCount(this._wallet, options)
      this._contract = this._contract.connect(this._wallet)
    }
  }

  get ethereumProvider (): string {
    return this._ethereumProvider
  }

  get contractAddress (): string {
    return this._contractAddress
  }

  get provider (): providers.JsonRpcProvider {
    return this._provider
  }

  get wallet (): Wallet | undefined {
    return this._wallet
  }

  public setVcStatus = async (credentialId: string): Promise<string> => {
    const txResponse = await this._sendSignedTransaction('setVcStatus',[ credentialId ])
    return txResponse.hash as string
  }

  public removeVcStatus = async (credentialId: string): Promise<string> => {
    const txResponse = await this._sendSignedTransaction('removeVcStatus', [credentialId])
    return txResponse.hash as string
  }

  public getVcStatus = async (issuer: string, credentialId: string): Promise<string> => {
    return this._contract.getVcStatus(issuer, credentialId)
  }

  private _sendSignedTransaction = async (method: string, parameters: any[]): Promise<ethers.providers.TransactionResponse> => {
    if (!this._wallet) {
      throw (new Error(`Error: Can not call "${method}" without privateKey`))
    }
    const nonce = await this._getTransactionCount()
    const overrides = {
      nonce: nonce,
      gasPrice: this._gasPrice,
      gasLimit: this._gasLimit
    }
    return this._contractMethod(method, parameters, overrides)
  }

  // Isolate external function for sinon stub
  private _getTransactionCount = async () => {
    return (this._transactionCount as TransactionCount).transactionCount()
  }

  // Isolate external function for sinon stub
  private _contractMethod = async (method: string, parameters: any[], overrides: object): Promise<ethers.providers.TransactionResponse> => {
    return this._contract[method](...parameters, overrides)
  }
}

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
    const maxRaceCount = this._options.txNonceMaxRaceCount || 100
    const maxIdleTime = this._options.txNonceMaxIdleTime || 30000 // Make sure to skip at least 1 block

    const now = new Date().valueOf() // Time in miliseconds since 1970
    const nonce = await this._getTransactionCount()

    if (
      (nonce > this._currentTransaction) ||
      (this._raceCount > maxRaceCount) ||
      ((now - this._lastTxTime) > maxIdleTime)
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

  // Isolate external function for sinon stub
  private _getTransactionCount = async () => {
    return (this._wallet).getTransactionCount()
  }
}

export { Wallet, TransactionCount }
export default VcStatusRegistry
