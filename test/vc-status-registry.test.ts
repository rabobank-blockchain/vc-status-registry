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

import * as chai from 'chai'
import * as sinon from 'sinon'
import * as chaiAsPromised from 'chai-as-promised'
import * as sinonChai from 'sinon-chai'
import { VcStatusRegistry, Wallet } from '../src/vc-status-registry'
import { TransactionResponse } from 'ethers/providers'

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

describe('Test vcStatusRegistry functionality', () => {
  afterEach(() => {
    sinon.restore()
  })

  it('should succesfully create vcStatusRegistry class with private key', () => {
    // Arrange
    const privateKey = '53fd2ebe003d072fe914a90581b8d36964f2392ede2fab9618d4492cff85f35d'
    const contractAddress = '0xe9fdf8130ad68fd11d195fb1e49a479e30b6d3d4'

    // Act
    const vcStatusRegistry = new VcStatusRegistry(
      'https://rinkeby.infura.io',
      contractAddress,
      privateKey
    )

    // Assert
    assert.exists(vcStatusRegistry)
  })

  it('should succesfully create vcStatusRegistry class without private key', () => {
    // Arrange
    const contractAddress = '0xe9fdf8130ad68fd11d195fb1e49a479e30b6d3d4'

    // Act
    const vcStatusRegistry = new VcStatusRegistry(
      'https://rinkeby.infura.io',
      contractAddress
    )

    // Assert
    assert.exists(vcStatusRegistry)
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
      'https://rinkeby.infura.io',
      contractAddress
    )

    // Assert
    vcStatusRegistry.removeVcStatus(credentialId).should.eventually.be.rejectedWith('Error: Can not call "removeVcStatus" without privateKey')
  })

  // Arrange
  const issuer = '0xf8fC941a64cFb70C8E34010f7370D84076d0361A'
  const privateKey = '53fd2ebe003d072fe914a90581b8d36964f2392ede2fab9618d4492cff85f35d'
  const contractAddress = '0xe9fdf8130ad68fd11d195fb1e49a479e30b6d3d4'
  const credentialId1 = '0xf8fC941a64cFb70C8E34010f7370D84076d0361A'
  const credentialId2 = '0xe9fdf8130ad68fd11d195fb1e49a479e30b6d3d4'
  const credentialId3 = '0x72d3bc4da6e025540edbfee8b376918f95ec59e4'
  const provider = 'https://rinkeby.infura.io'

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
      .stub(vcStatusRegistry, 'getVcStatus')
      .returns(Promise.resolve('true'))

    const result = await vcStatusRegistry.getVcStatus(issuer, credentialId3)

    // Assert
    assert.isTrue(stubGetVcStatus.calledOnce)
    assert.isTrue(Boolean(result))
  })

  it('should add values to the registry', async () => {
    const stubContractMethod = sinon
      .stub(vcStatusRegistry, '_contractMethod')
      .returns(Promise.resolve({ hash: 'dude' } as TransactionResponse))

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
      .stub(vcStatusRegistry, '_contractMethod')
      .returns(Promise.resolve({ hash: 'dude' } as TransactionResponse))

    await vcStatusRegistry.removeVcStatus(credentialId3)

    // Assert
    assert.isTrue(stubContractMethod.calledOnce)
  })

  const vcStatusRegistryKeyless = new VcStatusRegistry(
    provider,
    contractAddress
  )

  it('should throw if setVcStatus is called without privateKey', async () => {
    const stubContractMethod = sinon
      .stub(vcStatusRegistry, '_contractMethod')
      .returns(Promise.resolve({ hash: 'dude' } as TransactionResponse))

    const wrapper = async () => {
      return vcStatusRegistryKeyless.setVcStatus(credentialId1)
    }

    // Assert
    assert.isRejected(wrapper(), 'Error: Can not call "setVcStatus" without privateKey')
  })

})
