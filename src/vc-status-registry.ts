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
import { Subject } from 'rxjs'

/**
 * Override Ethereum gas options
 */
declare interface VcStatusRegistryOptions {
  gasLimit?: number
  gasPrice?: number
  txNonceMaxRaceCount?: number
  txNonceMaxIdleTime?: number
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

export interface ContractEventData {
  blockNumber: number
  blockHash: string
  transactionIndex: number
  removed: boolean
  address: string
  data: string
  topics: string[]
  transactionHash: string
  logIndex: number
}

export interface NewBlockData {
  blockNumber: number
}

export class VcStatusRegistry {
  private _provider: providers.JsonRpcProvider
  private readonly _wallet: Wallet | undefined
  private readonly _contract: Contract
  private _transactionCount: TransactionCount | undefined
  private _onNewBlock = new Subject<NewBlockData>()
  private _onSetVcStatus = new Subject<ContractEventData>()
  private _onRemoveVcStatus = new Subject<ContractEventData>()
  private _onError = new Subject<any>()

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
    private readonly _options: VcStatusRegistryOptions = {}
  ) {
    this._provider = new ethers.providers.JsonRpcProvider(this._ethereumProvider)
    this._contract = new ethers.Contract(this._contractAddress, ABI, this._provider)

    if (privateKey) {
      this._wallet = new ethers.Wallet(Buffer.from(privateKey, 'hex'), this._provider)
      this._transactionCount = new TransactionCount(this._wallet, this._options)
      this._contract = this._contract.connect(this._wallet)
    }
    this.initiateEventSubscriptions()
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

  get ABI (): object {
    return ABI
  }

  get onNewBlock (): Subject<NewBlockData> {
    return this._onNewBlock
  }
  get onSetVcStatus (): Subject<ContractEventData> {
    return this._onSetVcStatus
  }
  get onRemoveVcStatus (): Subject<ContractEventData> {
    return this._onRemoveVcStatus
  }
  get onError (): Subject<any> {
    return this._onError
  }

  public setVcStatus = async (credentialId: string): Promise<string> => {
    const txResponse = await this._sendSignedTransaction('setVcStatus', [credentialId])
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
    const nonce = await (this._transactionCount as TransactionCount).transactionCount()
    const overrides = {
      nonce: nonce,
      gasPrice: this._options.gasPrice,
      gasLimit: this._options.gasLimit
    }
    return this._contractMethod(method, parameters, overrides)
  }

  // Isolate external function for sinon stub
  private _contractMethod = async (method: string, parameters: any[], overrides: object): Promise<ethers.providers.TransactionResponse> => {
    return this._contract[method](...parameters, overrides)
  }

  private initiateEventSubscriptions () {
    this.initiateStatusSetEventSubscriber()
    this.initiateStatusRemovedEventSubscriber()
    this.initiateErrorEventSubscriber()
    this.initiateNewBlockEventSubscriber()
  }

  private initiateStatusSetEventSubscriber () {
    const statusSetFilter = {
      address: this.contractAddress,
      topics: [ethers.utils.id('VcStatusSet(address,address)')]
    }
    this.provider.on(statusSetFilter, (result) => {
      this._onSetVcStatus.next(result as ContractEventData)
    })
  }

  private initiateStatusRemovedEventSubscriber () {

    const statusRemoveFilter = {
      address: this.contractAddress,
      topics: [ethers.utils.id('VcStatusRemoved(address,address)')]
    }

    this.provider.on(statusRemoveFilter, (result) => {
      this._onRemoveVcStatus.next(result as ContractEventData)
    })
  }

  private initiateErrorEventSubscriber () {
    this.provider.on('error', (error) => {
      this._onError.next(error)
    })
  }

  // Probably remove since they are convenience methods, should live in a separate class
  public getBlockNumber = async (): Promise<number> => {
    return this.provider.getBlockNumber()
  }

  private initiateNewBlockEventSubscriber () {
    this.provider.on('block', (blockNumber) => {
      this._onNewBlock.next({ blockNumber } as NewBlockData)
    })
  }

  public getPastStatusSetEvents (did: string, fromBlock = 0, toBlock: number | string = 'latest'): Promise<Array<ContractEventData>> {
    const filter = {
      address: this.contractAddress,
      fromBlock: fromBlock,
      toBlock: toBlock,
      // second argument is an empty array to ignore issuer did
      topics: [ethers.utils.id('VcStatusSet(address,address)'), [], did]
    }
    return this.provider.getLogs(filter) as Promise<Array<ContractEventData>>
  }

  public getPastStatusRemoveEvents (did: string, fromBlock = 0, toBlock: number | string = 'latest'): Promise<Array<ContractEventData>> {
    const filter = {
      address: this.contractAddress,
      fromBlock: fromBlock,
      toBlock: toBlock,
      // second argument is an empty array to ignore issuer did
      topics: [ethers.utils.id('VcStatusRemoved(address,address)'), [], did]
    }
    return this.provider.getLogs(filter) as Promise<Array<ContractEventData>>
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

export { Wallet, TransactionCount }
export default VcStatusRegistry
