/*
 * Copyright 2020 Coöperatieve Rabobank U.A.
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

import * as chai from 'chai'
import * as sinon from 'sinon'
import * as chaiAsPromised from 'chai-as-promised'
import * as sinonChai from 'sinon-chai'
import { ethers, Wallet } from 'ethers'
import { TransactionCount, ContractEventData, NewBlockData, PastEventType, VcStatusRegistry } from '../src'

const assert = chai.assert

before(() => {
  chai.should()
  chai.use(chaiAsPromised)
  chai.use(sinonChai)
})

// const privateKey = '53fd2ebe003d072fe914a90581b8d36964f2392ede2fab9618d4492cff85f35d';
// const issuer = '0xf8fC941a64cFb70C8E34010f7370D84076d0361A';
// const contractAddress = '0xe9fdf8130ad68fd11d195fb1e49a479e30b6d3d4';
// const credentialId = '0x72d3bc4da6e025540edbfee8b376918f95ec59e4';

const provider = 'https://rinkeby.infura.io/'

describe('Test vcStatusRegistry functionality', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('should succesfully create vcStatusRegistry class with private key', () => {
    // Arrange
    const privateKey = '53fd2ebe003d072fe914a90581b8d36964f2392ede2fab9618d4492cff85f35d'
    const contractAddress = '0xe9fdf8130ad68fd11d195fb1e49a479e30b6d3d4'
    const options = {
      gasLimit: 220000,
      gasPrice: 111111,
      txNonceMaxRaceCount: 2,
      txNonceMaxIdleTime: 2
    }

    // Act
    const vcStatusRegistry = new VcStatusRegistry(
      provider,
      contractAddress,
      privateKey,
      options
    )

    // Assert
    assert.exists(vcStatusRegistry)
  })

  it('should succesfully create vcStatusRegistry class without private key', () => {
    // Arrange
    const contractAddress = '0xe9fdf8130ad68fd11d195fb1e49a479e30b6d3d4'

    // Act
    const vcStatusRegistry = new VcStatusRegistry(
      provider,
      contractAddress
    )

    // Assert
    assert.exists(vcStatusRegistry)
  })

  it('should throw if function setVcStatus calls without instantiating with privateKey', () => {
    // Arrange
    const contractAddress = '0xe9fdf8130ad68fd11d195fb1e49a479e30b6d3d4'
    const vcStatusRegistry = new VcStatusRegistry(
      provider,
      contractAddress
    )
    sinon
      .stub((vcStatusRegistry as any), '_contractMethod')
      .returns(Promise.resolve({ hash: 'dude' }))

    // Act

    return vcStatusRegistry.setVcStatus('credentialId').should.eventually.rejectedWith('Error: Can not call "setVcStatus" without privateKey')
  })

  it('should throw if function removeVcStatus calls without instantiating with privateKey', () => {
    // Arrange
    const contractAddress = '0xe9fdf8130ad68fd11d195fb1e49a479e30b6d3d4'
    const vcStatusRegistry = new VcStatusRegistry(
      provider,
      contractAddress
    )
    // Act
    return vcStatusRegistry.setVcStatus('credentialId', false).should.eventually.rejectedWith('Error: Can not call "removeVcStatus" without privateKey')
  })

  it('should throw error if non existent ethereum-provider used', async () => {
    // Arrange
    const privateKey = '53fd2ebe003d072fe914a90581b8d36964f2392ede2fab9618d4492cff85f35d'
    const issuer = '0xf8fC941a64cFb70C8E34010f7370D84076d0361A'
    const contractAddress = '0xe9fdf8130ad68fd11d195fb1e49a479e30b6d3d4'
    const credentialId = '0x72d3bc4da6e025540edbfee8b376918f95ec59e4'

    // Act
    const vcStatusRegistry = new VcStatusRegistry(
      'https://not-exists.infura.io',
      contractAddress,
      privateKey
    )

    const wrapper = async () => {
      return vcStatusRegistry.getVcStatus(issuer, credentialId)
    }

    // Assert
    assert.isRejected(wrapper(), 'Cannot read property \'getVcStatus\' of undefined')
  })

  it('should not add a value to the registry if not initialized with privateKey', async () => {
    // Arrange
    const contractAddress = '0xe9fdf8130ad68fd11d195fb1e49a479e30b6d3d4'
    const credentialId = '0x72d3bc4da6e025540edbfee8b376918f95ec59e4'

    // Act
    const vcStatusRegistry = new VcStatusRegistry(
      provider,
      contractAddress
    )

    // Assert
    vcStatusRegistry.setVcStatus(credentialId, false).should.eventually.be.rejectedWith('Error: Can not call "removeVcStatus" without privateKey')
  })

  // Arrange
  const issuer = '0xf8fC941a64cFb70C8E34010f7370D84076d0361A'
  const privateKey = '53fd2ebe003d072fe914a90581b8d36964f2392ede2fab9618d4492cff85f35d'
  const contractAddress = '0xe9fdf8130ad68fd11d195fb1e49a479e30b6d3d4'
  const credentialId1 = '0xf8fC941a64cFb70C8E34010f7370D84076d0361A'
  const credentialId2 = '0xe9fdf8130ad68fd11d195fb1e49a479e30b6d3d4'
  const credentialId3 = '0x72d3bc4da6e025540edbfee8b376918f95ec59e4'

  const vcStatusRegistry = new VcStatusRegistry(
    provider,
    contractAddress,
    privateKey
  )

  it('should return wallet', async () => {
    const result = vcStatusRegistry.wallet as Wallet
    assert.deepEqual(result.address, '0xac9E10ab57f6DcDad1bA0C634EdCAE25116F5dab')
    assert.deepEqual(result.privateKey, '0x' + privateKey)
  })

  it('should return provider', async () => {
    const result = vcStatusRegistry.provider
    assert.isObject(result)
  })

  it('should return ethereumProvider', async () => {
    const result = vcStatusRegistry.ethereumProvider
    assert.deepEqual(result, provider)
  })

  it('should return contractAddress', () => {
    const result = vcStatusRegistry.contractAddress
    assert.deepEqual(result, contractAddress)
  })

  it('should succesfully getVcStatus function()', async () => {
    const stubGetVcStatus = sinon
      .stub(vcStatusRegistry as any, 'getVcStatus')
      .returns(Promise.resolve('true'))
    const result = await vcStatusRegistry.getVcStatus(issuer, credentialId3)

    // Assert
    assert.isTrue(stubGetVcStatus.calledOnce)
    assert.isTrue(Boolean(result))
  })

  it('should add values to the registry', async () => {
    const stubContractMethod = sinon
      .stub((vcStatusRegistry as any), '_contractMethod')
      .returns(Promise.resolve({ hash: 'dude' }))
    sinon
      .stub((vcStatusRegistry as any)._wallet, 'getTransactionCount')
      .returns(Promise.resolve(31415))

    // Call it twice so 'racing' is also tested
    const res = await Promise.all([
      vcStatusRegistry.setVcStatus(credentialId1),
      vcStatusRegistry.setVcStatus(credentialId2)
    ])

    // Assert
    assert.isTrue(stubContractMethod.calledTwice)
    assert.deepEqual(res, ['dude', 'dude'])
  })

  it('should remove a value from the registry', async () => {
    const stubContractMethod = sinon
      .stub(vcStatusRegistry as any, '_contractMethod')
      .returns(Promise.resolve({ hash: 'dude' }))
    sinon
      .stub((vcStatusRegistry as any)._wallet, 'getTransactionCount')
      .returns(Promise.resolve(31415))

    await vcStatusRegistry.setVcStatus(credentialId3, false)

    // Assert
    assert.isTrue(stubContractMethod.calledOnce)
  })

  const vcStatusRegistryKeyless = new VcStatusRegistry(
    provider,
    contractAddress
  )

  it('should throw if setVcStatus is called without privateKey', async () => {
    sinon
      .stub(vcStatusRegistry as any, '_contractMethod')
      .returns(Promise.resolve({ hash: 'dude' }))
    sinon
      .stub((vcStatusRegistry as any)._wallet, 'getTransactionCount')
      .returns(Promise.resolve(31415))

    const wrapper = async () => {
      return vcStatusRegistryKeyless.setVcStatus(credentialId1)
    }

    // Assert
    assert.isRejected(wrapper(), 'Error: Can not call "setVcStatus" without privateKey')
  })

  it('should create and get a transaction count', async () => {
    const options = {
      txNonceMaxRaceCount: 5,
      txNonceMaxIdleTime: 30000
    }

    const wallet = new Wallet(Buffer.from(privateKey, 'hex'), vcStatusRegistry.provider)
    const transactionCount = new TransactionCount(wallet, options)

    const stubTransactionCount = sinon
      .stub(wallet, 'getTransactionCount')
      .returns(Promise.resolve(0))

    const count1 = await transactionCount.transactionCount()
    const count2 = await transactionCount.transactionCount()
    const count3 = await transactionCount.transactionCount()

    assert.deepEqual(count1, 0)
    assert.deepEqual(count2, 1)
    assert.deepEqual(count3, 2)
    assert.isTrue(stubTransactionCount.calledThrice)
  })

  it('should reset the transaction count because of maxRaceCount', async () => {
    const options = {
      txNonceMaxRaceCount: 1,
      txNonceMaxIdleTime: 30000
    }

    const wallet = new Wallet(Buffer.from(privateKey, 'hex'), vcStatusRegistry.provider)
    const transactionCount = new TransactionCount(wallet, options)

    const stubTransactionCount = sinon
      .stub(wallet, 'getTransactionCount')
      .returns(Promise.resolve(0))

    const count1 = await transactionCount.transactionCount()
    const count2 = await transactionCount.transactionCount()
    const count3 = await transactionCount.transactionCount()

    assert.deepEqual(count1, 0)
    assert.deepEqual(count2, 1)
    assert.deepEqual(count3, 0)
    assert.isTrue(stubTransactionCount.calledThrice)
  })

  it('should reset the transaction count because of maxIdleTime', async () => {
    const options = {
      txNonceMaxRaceCount: 5,
      txNonceMaxIdleTime: 0
    }

    const wallet = new Wallet(Buffer.from(privateKey, 'hex'), vcStatusRegistry.provider)
    const transactionCount = new TransactionCount(wallet, options)

    const stubTransactionCount = sinon
      .stub(wallet, 'getTransactionCount')
      .returns(Promise.resolve(0))

    const count1 = await transactionCount.transactionCount()
    const count2 = await transactionCount.transactionCount()
    const count3 = await transactionCount.transactionCount()

    assert.deepEqual(count1, 0)
    assert.deepEqual(count2, 0)
    assert.deepEqual(count3, 0)
    assert.isTrue(stubTransactionCount.calledThrice)
  })

  it('should return exactly this ABI', () => {
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

    const contractAddress = '0xe9fdf8130ad68fd11d195fb1e49a479e30b6d3d4'
    const vcStatusRegistry = new VcStatusRegistry(
      provider,
      contractAddress
    )

    // Act
    assert.deepEqual(vcStatusRegistry.ABI, ABI)
  })

  it('should forward the event when SetVcStatus happens on the contract', async () => {
    const providerData = {
      blockNumber: 12,
      blockHash: 'someHash',
      transactionIndex: 12,
      removed: true,
      address: '0xasd',
      data: 'SomeDataHere',
      topics: ['0xa', '0xb'],
      transactionHash: 'hashControl',
      logIndex: 54
    }
    const statusSetFilter = {
      address: contractAddress,
      topics: [ethers.utils.id('VcStatusSet(address,address)')]
    }
    let returnData: ContractEventData
    vcStatusRegistry.onSetVcStatus.subscribe(async (e: ContractEventData) => {
      returnData = e
    })
    vcStatusRegistry.provider.emit(statusSetFilter, providerData)
    setTimeout(() => {
      assert.deepEqual(returnData, providerData)
    },1)
  })

  it('should forward the event when RemoveVcStatus happens on the contract', async () => {
    const providerData = {
      blockNumber: 12,
      blockHash: 'someHash',
      transactionIndex: 12,
      removed: true,
      address: '0xasd',
      data: 'HelloDataHere',
      topics: ['0xa', '0xb'],
      transactionHash: 'hashControl',
      logIndex: 54
    }
    const statusSetFilter = {
      address: contractAddress,
      topics: [ethers.utils.id('VcStatusRemoved(address,address)')]
    }
    let returnData: ContractEventData
    vcStatusRegistry.onRemoveVcStatus.subscribe(async (e: ContractEventData) => {
      returnData = e
    })
    vcStatusRegistry.provider.emit(statusSetFilter, providerData)
    setTimeout(() => {
      assert.deepEqual(returnData, providerData)
    },1)
  })

  it('should forward the event when newBlock happens on the blockchain', async () => {
    let returnData: NewBlockData
    vcStatusRegistry.onNewBlock.subscribe(async (e: NewBlockData) => {
      returnData = e
    })
    vcStatusRegistry.provider.emit('block', 12)
    setTimeout(() => {
      assert.deepEqual(returnData, { blockNumber: 12 })
    },1)
  })

  it('should forward the error when it happens on the blockchain', async () => {
    let returnData: any
    vcStatusRegistry.onError.subscribe(async (e: any) => {
      returnData = e
    })
    vcStatusRegistry.provider.emit('error', { some: 'error' })
    setTimeout(() => {
      assert.deepEqual(returnData, { some: 'error' })
    },1)
  })

  it('return the current blockNumber when asked', async () => {
    sinon.stub(vcStatusRegistry.provider, 'getBlockNumber').returns(Promise.resolve(54))
    const blockNumber = await vcStatusRegistry.getBlockNumber()
    assert.equal(blockNumber, 54)
  })

  it('return the past events for SetStatus event when asked with fromBlock and toBlock', async () => {
    let sinonStub = sinon.stub(vcStatusRegistry.provider, 'getLogs')
    sinonStub.returns(Promise.resolve([{
      blockNumber: 1,
      blockHash: 'hash',
      transactionIndex: 1,
      removed: false,
      address: 'adress',
      data: 'data',
      topics: ['topic1', 'topic2'],
      transactionHash: '2',
      logIndex: 1
    }]))
    const pastEvents = await vcStatusRegistry.getPastStatusEvents(PastEventType.set, 'did', 1, 2)
    assert.equal(pastEvents.length, 1)
    assert.isTrue(sinonStub.calledWithExactly({
      address: contractAddress,
      fromBlock: 1,
      toBlock: 2,
      topics: [ethers.utils.id('VcStatusSet(address,address)'), [], 'did']
    }))
  })

  it('return the past events for SetStatus event when asked with default fromBlock and toBlock', async () => {
    let sinonStub = sinon.stub(vcStatusRegistry.provider, 'getLogs')
    sinonStub.returns(Promise.resolve([{
      blockNumber: 1,
      blockHash: 'hash',
      transactionIndex: 1,
      removed: false,
      address: 'adress',
      data: 'data',
      topics: ['topic1', 'topic2'],
      transactionHash: '2',
      logIndex: 1
    }]))
    const pastEvents = await vcStatusRegistry.getPastStatusEvents(PastEventType.set, 'did')
    assert.equal(pastEvents.length, 1)
    assert.isTrue(sinonStub.calledWithExactly({
      address: contractAddress,
      fromBlock: 0,
      toBlock: 'latest',
      topics: [ethers.utils.id('VcStatusSet(address,address)'), [], 'did']
    }))
  })

  it('return the past events for RemovedStatus event when asked with default fromBlock and toBlock', async () => {
    let sinonStub = sinon.stub(vcStatusRegistry.provider, 'getLogs')
    sinonStub.returns(Promise.resolve([{
      blockNumber: 1,
      blockHash: 'hash',
      transactionIndex: 1,
      removed: false,
      address: 'adress',
      data: 'data',
      topics: ['topic1', 'topic2'],
      transactionHash: '2',
      logIndex: 1
    }]))
    const pastEvents = await vcStatusRegistry.getPastStatusEvents(PastEventType.remove, 'did')
    assert.equal(pastEvents.length, 1)
    assert.isTrue(sinonStub.calledWithExactly({
      address: contractAddress,
      fromBlock: 0,
      toBlock: 'latest',
      topics: [ethers.utils.id('VcStatusRemoved(address,address)'), [], 'did']
    }))
  })

})
