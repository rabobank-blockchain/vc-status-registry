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

import Web3 = require('web3')
import EthTx = require('ethereumjs-tx')
import Contract from 'web3/eth/contract'

/**
 * Override Ethereum gas options
 */
declare interface VcStatusRegistryOptions {
  gasMultiplier?: number
  gasLimit?: number
  gasPriceMax?: number
}

declare interface Account {
  address?: string
  privateKey?: string
  publicKey?: string
}

const DEFAULT_GAS_MULTIPLIER = 100000
const DEFAULT_GAS_PRICE_MAX = 100000000000
const DEFAULT_GAS_LIMIT = 300000
const DEFAULT_ABI = [
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
  private readonly _web3: Web3
  private readonly _ethereumProvider: string
  private readonly _contractAddress: string
  private readonly _ABI: any[]
  private readonly _contract: Contract
  private readonly _account: Account
  private readonly _gasMultiplier: number
  private readonly _gasLimit: number
  private readonly _gasPriceMax: number
  private _transactionCount: TransactionCount | undefined

  /**
   * @constructor Will set up the connection to an ethereum provider with provided credentials.
   * @param ethereumProvider connection string
   * @param contractAddress address of the contract '0x...'
   * @param privateKey optional, private key for issuing credentials
   * @param options optional, see VcStatusRegistryOptions
   */
  constructor (
    ethereumProvider: string,
    contractAddress: string,
    privateKey?: string,
    options: VcStatusRegistryOptions = {}
  ) {
    this._ethereumProvider = ethereumProvider
    this._contractAddress = contractAddress

    this._web3 = new Web3(Web3.givenProvider || this._ethereumProvider)

    this._account = {}

    if (privateKey) {
      this._account = this._web3.eth.accounts.privateKeyToAccount('0x' + privateKey)
      this._transactionCount = new TransactionCount(this._web3, this._account.address as string)
    }

    this._gasMultiplier = this.pickDefault(options.gasMultiplier, DEFAULT_GAS_MULTIPLIER)
    this._gasLimit = this.pickDefault(options.gasLimit, DEFAULT_GAS_LIMIT)
    this._gasPriceMax = this.pickDefault(options.gasPriceMax, DEFAULT_GAS_PRICE_MAX)
    this._ABI = DEFAULT_ABI

    this._contract = new this._web3.eth.Contract(this._ABI, this._contractAddress)
  }

  get ethereumProvider (): string {
    return this._ethereumProvider
  }

  get contractAddress (): string {
    return this._contractAddress
  }

  get web3 (): Web3 {
    return this._web3
  }

  get account (): Account {
    return this._account
  }

  public setVcStatus = (credentialId: string): Promise<string> => {
    return this.sendSignedTransaction('setVcStatus', [credentialId])
  }

  public removeVcStatus = (credentialId: string): Promise<string> => {
    return this.sendSignedTransaction('removeVcStatus', [credentialId])
  }

  public getVcStatus = (issuer: string, credentialId: string): Promise<string> => {
    return this._contract.methods.getVcStatus(issuer, credentialId).call()
  }

  private pickDefault = function (obj1: any, obj2: any): any {
    return (typeof (obj1) === 'undefined') ? obj2 : obj1
  }

  private sendSignedTransaction = async (method: string, parameters: any[]): Promise<string> => {
    if (!this._account.privateKey) {
      throw(new Error(`Error: Can not call "${method}" without privateKey`))
    }
    const contractMethod = this._contract.methods[method](...parameters)
    const data = contractMethod.encodeABI()
    const [gas, nonce] = await Promise.all([
      contractMethod.estimateGas(),
      (this._transactionCount as TransactionCount).transactionCount()
    ])
    const rawTx = {
      nonce: this._web3.utils.toHex(nonce),
      gasPrice: this._web3.utils.toHex(Math.min(gas * this._gasMultiplier, this._gasPriceMax)),
      gasLimit: this._web3.utils.toHex(this._gasLimit),
      to: this._contractAddress,
      value: '0x00',
      data
    }
    const ethTx = new EthTx(rawTx)
    const privateKey = this._account.privateKey
    ethTx.sign(Buffer.from(privateKey.slice(2), 'hex'))
    const serializedTx = ethTx.serialize()
    return this._sendSignedTransaction('0x' + serializedTx.toString('hex'))
  }

  // Wrap this function, so it can be stubbed using sinon
  public _sendSignedTransaction = (serializedTx: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      this._web3.eth.sendSignedTransaction(serializedTx)
        .once('transactionHash', txHash => {
          resolve(txHash)
        })
        .once('error', error => {
          reject(error)
        })
    })
  }

}

class TransactionCount {
  private readonly _web3: Web3
  private readonly _address: string

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

  constructor (web3: Web3, address: string) {
    this._web3 = web3
    this._address = address
  }

  public transactionCount = async (): Promise<number> => {
    const maxRaceCount = 100
    const maxIdleTime = 30 * 1000 // Make sure to skip at least 1 block

    const now = new Date().valueOf() // Time in miliseconds since 1970
    const nonce = await this._web3.eth.getTransactionCount(this._address)

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
}

export default VcStatusRegistry
