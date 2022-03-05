import { _ as __awaiter, a as __generator, b as __assign } from './_tslib-66d9c63d.js';

var ChromeStorage = /** @class */ (function () {
    function ChromeStorage(runTimeApi, defaultValue, onChange) {
        this.runTimeApi = runTimeApi;
        this.defaultValue = defaultValue;
        if (onChange) {
            this.initWatcher(onChange);
        }
    }
    /**
     * @return promise
     * @support MV2 & MV3
     */
    ChromeStorage.prototype.set = function (key, value) {
        var _this = this;
        return new Promise(function (resolve) {
            var _a;
            var _b, _c;
            (_c = (_b = _this.runTimeApi) === null || _b === void 0 ? void 0 : _b.set) === null || _c === void 0 ? void 0 : _c.call(_b, (_a = {}, _a[key] = value, _a), function () {
                resolve();
            });
        });
    };
    ChromeStorage.prototype.get = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var _a, _b;
                        (_b = (_a = _this.runTimeApi) === null || _a === void 0 ? void 0 : _a.get) === null || _b === void 0 ? void 0 : _b.call(_a, key, function (res) {
                            var mergeDefaultRes = __assign(__assign({}, _this.defaultValue), res);
                            if (Array.isArray(key))
                                resolve(mergeDefaultRes);
                            resolve(mergeDefaultRes[key]);
                        });
                    })];
            });
        });
    };
    ChromeStorage.prototype.getAll = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var _a, _b;
            (_b = (_a = _this.runTimeApi) === null || _a === void 0 ? void 0 : _a.get) === null || _b === void 0 ? void 0 : _b.call(_a, function (item) {
                resolve(__assign(__assign({}, _this.defaultValue), item));
            });
        });
    };
    /**
     * @return promise
     * @support MV2 & MV3
     */
    ChromeStorage.prototype.clear = function (callback) {
        var _this = this;
        return new Promise(function (resolve) {
            _this.runTimeApi.clear(function () {
                callback();
                resolve();
            });
        });
    };
    /**
     * @support MV3
     */
    ChromeStorage.prototype.remove = function (key) {
        var _a, _b;
        return (_b = (_a = this.runTimeApi) === null || _a === void 0 ? void 0 : _a.remove) === null || _b === void 0 ? void 0 : _b.call(_a, key);
    };
    ChromeStorage.prototype.initWatcher = function (onChange) {
        var _a, _b, _c;
        (_c = (_b = (_a = chrome.storage) === null || _a === void 0 ? void 0 : _a.onChanged) === null || _b === void 0 ? void 0 : _b.addListener) === null || _c === void 0 ? void 0 : _c.call(_b, onChange);
    };
    ChromeStorage.prototype.removeWatcher = function (onChange) {
        var _a, _b, _c;
        (_c = (_b = (_a = chrome.storage) === null || _a === void 0 ? void 0 : _a.onChanged) === null || _b === void 0 ? void 0 : _b.removeListener) === null || _c === void 0 ? void 0 : _c.call(_b, onChange);
    };
    return ChromeStorage;
}());

export { ChromeStorage as default };
