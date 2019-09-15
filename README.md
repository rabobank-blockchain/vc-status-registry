# vc-status-registry

[![Build Status](https://travis-ci.org/rabobank-blockchain/vc-status-registry.svg?branch=master)](https://travis-ci.org/rabobank-blockchain/vc-status-registry)
[![Test Coverage](https://api.codeclimate.com/v1/badges/4f6f66422a0d54c3ca38/test_coverage)](https://codeclimate.com/github/rabobank-blockchain/vc-status-registry/test_coverage)
[![Maintainability](https://api.codeclimate.com/v1/badges/4f6f66422a0d54c3ca38/maintainability)](https://codeclimate.com/github/rabobank-blockchain/vc-status-registry/maintainability)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

A TypeScript/JavaScript library for interacting with the `VCStatusRegistry` smart contract on Ethereum.

The `VCStatusRegistry` smart contract keeps track of DID's in two ways:
- An issuer will call `setVcStatus` when issuing a new credential to a DID
- An issuer is able to revoke a credential by calling `removeVcStatus` for the DID

## Installation

In an existing project (with `package.json`), install `vc-status-registry`

```bash
npm install vc-status-registry --save
```

## Usage

```typescript
import VcStatusRegistry from 'vc-status-registry'

const privateKey = '53fd2ebe003d072fe914a90581b8d36964f2392ede2fab9618d4492cff85f35d' // Issuer private key
const address = '0xac9E10ab57f6DcDad1bA0C634EdCAE25116F5dab' // Issuer address
const contractAddress = '0xe9fdf8130ad68fd11d195fb1e49a479e30b6d3d4' // VC Status Registry smart contract address
const provider = 'https://rinkeby.infura.io'

const vcStatusRegistry = new VcStatusRegistry(
  provider,
  contractAddress,
  privateKey
)

const credentialId = '0x72d3bc4da6e025540edbfee8b376918f95ec59e4' // The address of the holder, extracted from the DID

(async () => {

  // Set a credential using 'privateKey/address'
  await vcStatusRegistry.setVcStatus(credentialId)

  // Check credential status 
  const credendialIdStatus = await vcStatusRegistry.getVcStatus(address, credentialId)
  console.log('status:', credentialIdStatus) // "true" if active or "false" if revoked or never registered

  // Remove a credential using 'privateKey/address'
  await vcStatusRegistry.removeVcStatus(credentialId)

})()
```

## Running tests

Besides unit testing with Mocha, the effectivity of all tests are also measured with the Stryker mutation testing framework.

```bash
npm run test
npm run stryker
```

We aim to achieve a coverage of 100%. Stryker and/or mocha test scores below 80% will fail the build.

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License and disclaimer

[apache-2.0](https://choosealicense.com/licenses/apache-2.0/) with a [notice](NOTICE).

We discourage the use of this work in production environments as it is in active development and not mature enough.
