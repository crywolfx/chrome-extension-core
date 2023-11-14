'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _tslib = require('../_virtual/_tslib.js');
var cjs = require('../node_modules/deepmerge/dist/cjs.js');
var type = require('../utils/type.js');

var ChromeStorage = /** @class */ (function () {
    function ChromeStorage(runTimeApi, defaultValue, options) {
        this.watcherSet = new Set();
        this.originWatcherSet = new Set();
        this.runTimeApi = runTimeApi;
        this.defaultValue = defaultValue;
        this.scope = options === null || options === void 0 ? void 0 : options.scope;
        if (options === null || options === void 0 ? void 0 : options.onChange) {
            this.addWatcher(options.onChange);
        }
    }
    ChromeStorage.prototype.set = function (key, value) {
        var _this = this;
        return new Promise(function (resolve) {
            var _a;
            var _b, _c;
            var isPlainObject = type.isObject(key);
            if (!_this.scope) {
                if (isPlainObject) {
                    _this.runTimeApi.set(key, resolve);
                }
                else {
                    (_c = (_b = _this.runTimeApi) === null || _b === void 0 ? void 0 : _b.set) === null || _c === void 0 ? void 0 : _c.call(_b, (_a = {}, _a[key] = value, _a), resolve);
                }
            }
            else {
                _this.getAll()
                    .then(function (scopeData) {
                    if (isPlainObject) {
                        scopeData = _tslib.__assign(_tslib.__assign({}, scopeData), key);
                    }
                    else {
                        scopeData[key] = value;
                    }
                    return scopeData;
                })
                    .then(function (scopeData) {
                    var _a;
                    var _b, _c;
                    _this.scope &&
                        ((_c = (_b = _this.runTimeApi) === null || _b === void 0 ? void 0 : _b.set) === null || _c === void 0 ? void 0 : _c.call(_b, (_a = {}, _a[_this.scope] = scopeData, _a), resolve));
                });
            }
        });
    };
    ChromeStorage.prototype.get = function (key) {
        var _this = this;
        return new Promise(function (resolve) {
            var _a, _b;
            var reallyKey = _this.scope ? _this.scope : key;
            (_b = (_a = _this.runTimeApi) === null || _a === void 0 ? void 0 : _a.get) === null || _b === void 0 ? void 0 : _b.call(_a, reallyKey, function (res) {
                // The scenario where compatibility with "res" is {} (empty set).
                var reallyRes = _this.scope ? res[_this.scope] : res;
                var mergeDefaultRes = cjs["default"](_this.defaultValue, reallyRes !== null && reallyRes !== void 0 ? reallyRes : {});
                if (Array.isArray(key))
                    resolve(type.pick(mergeDefaultRes, key));
                resolve(mergeDefaultRes[key]);
            });
        });
    };
    /**
     * @return promise
     * @support MV2 & MV3
     */
    ChromeStorage.prototype.getAll = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var _a, _b;
            (_b = (_a = _this.runTimeApi) === null || _a === void 0 ? void 0 : _a.get) === null || _b === void 0 ? void 0 : _b.call(_a, function (res) {
                var reallyRes = _this.scope ? res[_this.scope] : res;
                var mergeDefaultRes = _tslib.__assign(_tslib.__assign({}, _this.defaultValue), reallyRes);
                resolve(mergeDefaultRes);
            });
        });
    };
    /**
     * @return promise
     * @support MV2 & MV3
     */
    ChromeStorage.prototype.clear = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var _a;
            if (_this.scope) {
                _this.runTimeApi.set((_a = {}, _a[_this.scope] = {}, _a), resolve);
            }
            else {
                _this.runTimeApi.clear(resolve);
            }
        });
    };
    /**
     * @return promise
     * @support MV2 & MV3
     */
    ChromeStorage.prototype.remove = function (key) {
        var _this = this;
        return new Promise(function (resolve) {
            var _a, _b;
            if (_this.scope) {
                _this.runTimeApi.get(_this.scope, function (value) {
                    var _a;
                    var _b, _c;
                    var valueData = value;
                    var keys = Array.isArray(key) ? key : [key];
                    var removedValue = (_c = (_b = type.objectKeys(valueData)) === null || _b === void 0 ? void 0 : _b.reduce) === null || _c === void 0 ? void 0 : _c.call(_b, function (pre, currentKey) {
                        if (!keys.includes(currentKey)) {
                            pre[currentKey] = valueData[currentKey];
                        }
                        return pre;
                    }, {});
                    _this.scope &&
                        _this.runTimeApi.set((_a = {}, _a[_this.scope] = removedValue, _a), resolve);
                });
            }
            else {
                (_b = (_a = _this.runTimeApi) === null || _a === void 0 ? void 0 : _a.remove) === null || _b === void 0 ? void 0 : _b.call(_a, key, resolve);
            }
        });
    };
    ChromeStorage.prototype.onChange = function (changes, areaName) {
        var _this = this;
        this.watcherSet.forEach(function (listener) {
            var _a, _b;
            if (_this.scope) {
                var oldValue_1 = (_a = changes === null || changes === void 0 ? void 0 : changes[_this.scope]) === null || _a === void 0 ? void 0 : _a.oldValue;
                var newValue_1 = (_b = changes === null || changes === void 0 ? void 0 : changes[_this.scope]) === null || _b === void 0 ? void 0 : _b.newValue;
                if (!newValue_1)
                    return;
                var scopeChanges = type.objectKeys(newValue_1).reduce(function (pre, key) {
                    pre[key] = {
                        oldValue: oldValue_1 === null || oldValue_1 === void 0 ? void 0 : oldValue_1[key],
                        newValue: newValue_1 === null || newValue_1 === void 0 ? void 0 : newValue_1[key],
                    };
                    return pre;
                }, {});
                listener(scopeChanges, areaName);
            }
            else {
                listener(changes, areaName);
            }
        });
    };
    /**
     * 添加watcher
     * 将会被收集起来，只能通过delWatcher删除
     * @param {WatcherCallback<T>} onChange
     * @memberof ChromeStorage
     */
    ChromeStorage.prototype.addWatcher = function (onChange) {
        this.watcherSet.add(onChange);
        if (this.watcherSet.size > 0) {
            this.addOriginalWatcher(this.onChange.bind(this));
        }
    };
    /**
     * 删除watcher监听
     * @desc 只能删除通过addWatcher添加的
     * @param {WatcherCallback<T>} onChange
     * @memberof ChromeStorage
     */
    ChromeStorage.prototype.removeWatcher = function (onChange) {
        this.watcherSet.delete(onChange);
        if (this.watcherSet.size <= 0) {
            this.removeOriginalWatcher(this.onChange.bind(this));
        }
    };
    /**
     * 清空watcher监听
     * @desc 只能清空通过addWatcher添加的
     * @memberof ChromeStorage
     */
    ChromeStorage.prototype.clearWatcher = function () {
        this.watcherSet.clear();
        this.removeWatcher(this.onChange.bind(this));
    };
    /**
     * 添加原生watcher
     * @desc 原生chromeAPI提供的监听方法，无法细分到当前scope，需要调用removeOriginalWatcher来移除
     * @param {WatcherCallback<T>} onChange
     * @memberof ChromeStorage
     */
    ChromeStorage.prototype.addOriginalWatcher = function (onChange) {
        var _a, _b, _c;
        this.originWatcherSet.add(onChange);
        (_c = (_b = (_a = chrome.storage) === null || _a === void 0 ? void 0 : _a.onChanged) === null || _b === void 0 ? void 0 : _b.addListener) === null || _c === void 0 ? void 0 : _c.call(_b, onChange);
    };
    /**
     * 删除原生watcher
     * @desc 移除原生添加的watcher
     * @param {WatcherCallback<T>} onChange
     * @memberof ChromeStorage
     */
    ChromeStorage.prototype.removeOriginalWatcher = function (onChange) {
        var _a, _b, _c;
        this.originWatcherSet.delete(onChange);
        (_c = (_b = (_a = chrome.storage) === null || _a === void 0 ? void 0 : _a.onChanged) === null || _b === void 0 ? void 0 : _b.removeListener) === null || _c === void 0 ? void 0 : _c.call(_b, onChange);
    };
    ChromeStorage.prototype.clearOriginalWatcher = function () {
        this.originWatcherSet.forEach(function (listener) {
            var _a, _b, _c;
            (_c = (_b = (_a = chrome.storage) === null || _a === void 0 ? void 0 : _a.onChanged) === null || _b === void 0 ? void 0 : _b.removeListener) === null || _c === void 0 ? void 0 : _c.call(_b, listener);
        });
        this.originWatcherSet.clear();
    };
    ChromeStorage.prototype.emptyWatcher = function () {
        this.clearWatcher();
        this.clearOriginalWatcher();
    };
    return ChromeStorage;
}());
var Store = ChromeStorage;

exports.ChromeStorage = ChromeStorage;
exports.Store = Store;
