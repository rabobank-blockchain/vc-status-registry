"use strict";
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
exports.TransactionCount = void 0;
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
            const maxRaceCount = this._options.txNonceMaxRaceCount !== undefined ? this._options.txNonceMaxRaceCount : 100;
            let maxIdleTime = this._options.txNonceMaxIdleTime !== undefined ? this._options.txNonceMaxIdleTime : 30000; // Make sure to skip at least 1 block
            const now = new Date().valueOf(); // Time in miliseconds since 1970
            const nonce = yield this._wallet.getTransactionCount();
            if ((nonce > this._currentTransaction) ||
                (this._raceCount >= maxRaceCount) ||
                ((now - this._lastTxTime) >= maxIdleTime)) {
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
    }
}
exports.TransactionCount = TransactionCount;
//# sourceMappingURL=transaction-count.js.map