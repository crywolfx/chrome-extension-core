'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var _tslib = require('../_virtual/_tslib.js');
var tab = require('./tab.js');

var EventMessage = /** @class */ (function () {
    function EventMessage(key, data, scope) {
        this.key = key;
        this.data = data;
        this.scope = scope;
    }
    return EventMessage;
}());
var CallbackResponse = /** @class */ (function () {
    function CallbackResponse(success, data, message) {
        if (success === void 0) { success = true; }
        if (data === void 0) { data = null; }
        if (message === void 0) { message = ''; }
        this.success = success;
        this.data = data;
        this.message = message;
    }
    return CallbackResponse;
}());
function getCallbackResponse(data) {
    return new CallbackResponse(data.success, data.data, data.message);
}
var ChromeEvent = /** @class */ (function () {
    /**
     * Creates an instance of Event.
     * @param {Scope} [scope] 隔离scope，避免监听到重名事件
     * @memberof Event
     */
    function ChromeEvent(scope) {
        var _this = this;
        var _a, _b, _c;
        this.listeners = new Map();
        this.scope = scope;
        (_c = (_b = (_a = chrome.runtime) === null || _a === void 0 ? void 0 : _a.onMessage) === null || _b === void 0 ? void 0 : _b.addListener) === null || _c === void 0 ? void 0 : _c.call(_b, function (request, sender, sendResponse) {
            _this.dispatchEvent(request, sendResponse);
            return true;
        });
    }
    ChromeEvent.prototype.dispatchEvent = function (request, sendResponse) {
        var key = request.key, data = request.data, scope = request.scope;
        if (scope && scope !== this.scope)
            return;
        if (this.listeners.has(key)) {
            var handlers = this.listeners.get(key);
            handlers.forEach(function (handler) {
                var paramSize = handler.length;
                var response = handler === null || handler === void 0 ? void 0 : handler(data, sendResponse);
                if (paramSize < 2) {
                    // 接口设计需要发送回执
                    if (response) {
                        if (response instanceof Promise) {
                            response
                                .then(function (res) {
                                var resData = res || new CallbackResponse(true, null, 'success');
                                sendResponse(getCallbackResponse(resData));
                            })
                                .catch(function (error) {
                                var _a;
                                sendResponse(new CallbackResponse(false, error, (_a = error === null || error === void 0 ? void 0 : error.toString) === null || _a === void 0 ? void 0 : _a.call(error)));
                            });
                        }
                        else {
                            sendResponse(getCallbackResponse(response));
                        }
                    }
                    else {
                        sendResponse(new CallbackResponse(true, null, 'success'));
                    }
                }
            });
        }
    };
    ChromeEvent.prototype.on = function (key, handler) {
        var handlers = this.listeners.get(key);
        if (handlers) {
            handlers.push(handler);
        }
        else {
            this.listeners.set(key, [handler]);
        }
    };
    ChromeEvent.prototype.off = function (key, handler) {
        var _a;
        var handlers = this.listeners.get(key);
        if (handlers) {
            if (handler) {
                handlers.splice(handlers.indexOf(handler) >>> 0, 1);
            }
            else {
                (_a = this.listeners) === null || _a === void 0 ? void 0 : _a.set(key, []);
            }
        }
    };
    ChromeEvent.prototype.emit = function (key, data, options) {
        var _this = this;
        var message = new EventMessage(key, data, this.scope);
        return new Promise(function (resolve, reject) { return _tslib.__awaiter(_this, void 0, void 0, function () {
            var id, id, _a;
            var _b, _c, _d, _e, _f, _g, _h;
            return _tslib.__generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (!options) {
                            return [2 /*return*/, (_c = (_b = chrome.runtime) === null || _b === void 0 ? void 0 : _b.sendMessage) === null || _c === void 0 ? void 0 : _c.call(_b, message, resolve)];
                        }
                        if (!(options.type === 'extension')) return [3 /*break*/, 1];
                        id = options.id || chrome.runtime.id;
                        if (!id)
                            return [2 /*return*/, reject('id is not exist!')];
                        (_e = (_d = chrome.runtime) === null || _d === void 0 ? void 0 : _d.sendMessage) === null || _e === void 0 ? void 0 : _e.call(_d, id, message, resolve);
                        return [3 /*break*/, 4];
                    case 1:
                        _a = options.id;
                        if (_a) return [3 /*break*/, 3];
                        return [4 /*yield*/, tab.getTab().catch(function () { return Promise.resolve({ id: undefined }); })];
                    case 2:
                        _a = ((_f = (_j.sent())) === null || _f === void 0 ? void 0 : _f.id);
                        _j.label = 3;
                    case 3:
                        id = _a;
                        if (!id)
                            return [2 /*return*/, reject('id is not exist!')];
                        (_h = (_g = chrome.tabs) === null || _g === void 0 ? void 0 : _g.sendMessage) === null || _h === void 0 ? void 0 : _h.call(_g, id, message, resolve);
                        _j.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    return ChromeEvent;
}());
var Event = ChromeEvent;

exports.CallbackResponse = CallbackResponse;
exports.ChromeEvent = ChromeEvent;
exports.Event = Event;
exports.EventMessage = EventMessage;
exports.getCallbackResponse = getCallbackResponse;
