"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
exports.Wallet = ethers_1.Wallet;
const rxjs_1 = require("rxjs");
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
];
class VcStatusRegistry {
    /**
     * @constructor Will set up the connection to an ethereum provider with provided credentials.
     * @param ethereumProvider connection string
     * @param contractAddress address of the contract '0x...'
     * @param privateKey optional, private key for issuing credentials
     * @param options optional, see VcStatusRegistryOptions
     */
    constructor(_ethereumProvider, _contractAddress, privateKey, options = {}) {
        this._ethereumProvider = _ethereumProvider;
        this._contractAddress = _contractAddress;
        this._onNewBlock = new rxjs_1.Subject();
        this._onSetVcStatus = new rxjs_1.Subject();
        this._onRemoveVcStatus = new rxjs_1.Subject();
        this._onError = new rxjs_1.Subject();
        this.setVcStatus = (credentialId) => __awaiter(this, void 0, void 0, function* () {
            const txResponse = yield this._sendSignedTransaction('setVcStatus', [credentialId]);
            return txResponse.hash;
        });
        this.removeVcStatus = (credentialId) => __awaiter(this, void 0, void 0, function* () {
            const txResponse = yield this._sendSignedTransaction('removeVcStatus', [credentialId]);
            return txResponse.hash;
        });
        this.getVcStatus = (issuer, credentialId) => __awaiter(this, void 0, void 0, function* () {
            return this._contract.getVcStatus(issuer, credentialId);
        });
        this._sendSignedTransaction = (method, parameters) => __awaiter(this, void 0, void 0, function* () {
            if (!this._wallet) {
                throw (new Error(`Error: Can not call "${method}" without privateKey`));
            }
            const nonce = yield this._getTransactionCount();
            const overrides = {
                nonce: nonce,
                gasPrice: this._gasPrice,
                gasLimit: this._gasLimit
            };
            return this._contractMethod(method, parameters, overrides);
        });
        // Isolate external function for sinon stub
        this._getTransactionCount = () => __awaiter(this, void 0, void 0, function* () {
            return this._transactionCount.transactionCount();
        });
        // Isolate external function for sinon stub
        this._contractMethod = (method, parameters, overrides) => __awaiter(this, void 0, void 0, function* () {
            return this._contract[method](...parameters, overrides);
        });
        // Probably remove since they are convenience methods, should live in a separate class
        this.getBlockNumber = () => __awaiter(this, void 0, void 0, function* () {
            return this.provider.getBlockNumber();
        });
        this._gasLimit = options.gasLimit;
        this._gasPrice = options.gasPrice;
        this._provider = new ethers_1.ethers.providers.JsonRpcProvider(this._ethereumProvider);
        this._contract = new ethers_1.ethers.Contract(this._contractAddress, ABI, this._provider);
        if (privateKey) {
            this._wallet = new ethers_1.ethers.Wallet(Buffer.from(privateKey, 'hex'), this._provider);
            this._transactionCount = new TransactionCount(this._wallet, options);
            this._contract = this._contract.connect(this._wallet);
        }
        this.initiateEventSubscriptions();
    }
    get ethereumProvider() {
        return this._ethereumProvider;
    }
    get contractAddress() {
        return this._contractAddress;
    }
    get provider() {
        return this._provider;
    }
    get wallet() {
        return this._wallet;
    }
    get onNewBlock() {
        return this._onNewBlock;
    }
    get onSetVcStatus() {
        return this._onSetVcStatus;
    }
    get onRemoveVcStatus() {
        return this._onRemoveVcStatus;
    }
    get onError() {
        return this._onError;
    }
    initiateEventSubscriptions() {
        this.initiateStatusSetEventSubscriber();
        this.initiateStatusRemovedEventSubscriber();
        this.initiateErrorEventSubscriber();
        this.initiateNewBlockEventSubscriber();
    }
    initiateStatusSetEventSubscriber() {
        const statusSetFilter = {
            address: this.contractAddress,
            topics: [ethers_1.ethers.utils.id('VcStatusSet(address,address)')]
        };
        this.provider.on(statusSetFilter, (result) => {
            this._onSetVcStatus.next(result);
        });
    }
    initiateStatusRemovedEventSubscriber() {
        const statusRemoveFilter = {
            address: this.contractAddress,
            topics: [ethers_1.ethers.utils.id('VcStatusRemoved(address,address)')]
        };
        this.provider.on(statusRemoveFilter, (result) => {
            this._onRemoveVcStatus.next(result);
        });
    }
    initiateErrorEventSubscriber() {
        this.provider.on('error', (error) => {
            this._onError.next(error);
        });
    }
    initiateNewBlockEventSubscriber() {
        this.provider.on('block', (blockNumber) => {
            this._onNewBlock.next({ blockNumber });
        });
    }
    getPastStatusSetEvents(did, fromBlock = 0, toBlock = 'latest') {
        const filter = {
            address: this.contractAddress,
            fromBlock: fromBlock,
            toBlock: toBlock,
            // second argument is an empty array to ignore issuer did
            topics: [ethers_1.ethers.utils.id('VcStatusSet(address,address)'), [], did]
        };
        return this.provider.getLogs(filter);
    }
    getPastStatusRemoveEvents(did, fromBlock = 0, toBlock = 'latest') {
        const filter = {
            address: this.contractAddress,
            fromBlock: fromBlock,
            toBlock: toBlock,
            // second argument is an empty array to ignore issuer did
            topics: [ethers_1.ethers.utils.id('VcStatusRemoved(address,address)'), [], did]
        };
        return this.provider.getLogs(filter);
    }
}
exports.VcStatusRegistry = VcStatusRegistry;
class TransactionCount {
    constructor(_wallet, _options = {}) {
        this._wallet = _wallet;
        this._options = _options;
        /**
         * currentTransaction holds the last transactionCount
         * Race conditions might occur. try to manage:
         * - transactionNr missed. reset if raceCount > maxRaceCount
         * - idle for some time. reset if lastTxTime > maxIdleTime
         * In the future you might want to handle this completely different by keeping
         * track of all open requests
         */
        this._currentTransaction = 0;
        this._raceCount = 0;
        this._lastTxTime = 0;
        this.transactionCount = () => __awaiter(this, void 0, void 0, function* () {
            const maxRaceCount = this._options.txNonceMaxRaceCount || 100;
            const maxIdleTime = this._options.txNonceMaxIdleTime || 30000; // Make sure to skip at least 1 block
            const now = new Date().valueOf(); // Time in miliseconds since 1970
            const nonce = yield this._getTransactionCount();
            if ((nonce > this._currentTransaction) ||
                (this._raceCount > maxRaceCount) ||
                ((now - this._lastTxTime) > maxIdleTime)) {
                // Normal situation
                this._raceCount = 0;
                this._lastTxTime = now;
                this._currentTransaction = nonce;
                return this._currentTransaction;
            }
            else {
                // We might be racing. Add one more transaction
                this._raceCount++;
                this._lastTxTime = now;
                return ++this._currentTransaction;
            }
        });
        // Isolate external function for sinon stub
        this._getTransactionCount = () => __awaiter(this, void 0, void 0, function* () {
            return (this._wallet).getTransactionCount();
        });
    }
}
exports.TransactionCount = TransactionCount;
exports.default = VcStatusRegistry;
//# sourceMappingURL=vc-status-registry.js.map