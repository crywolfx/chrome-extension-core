import { c as __extends, _ as __awaiter, a as __generator } from './_tslib-66d9c63d.js';
import { getTab } from './tab.js';

function isFunction(val) {
    return Object.prototype.toString.call(val) === '[object Function]';
}

var EventMessage = /** @class */ (function () {
    function EventMessage(key, data) {
        this.key = key;
        this.data = data;
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
function getFuncParameters(func) {
    var _a, _b, _c, _d;
    if (isFunction(func)) {
        var match = /[^(]+\(([^)]*)?\)/gm.exec(Function.prototype.toString.call(func));
        if (match === null || match === void 0 ? void 0 : match[1]) {
            var args = (_d = (_c = (_b = match === null || match === void 0 ? void 0 : (_a = match[1]).replace) === null || _b === void 0 ? void 0 : _b.call(_a, /[^,\w]*/g, '')) === null || _c === void 0 ? void 0 : _c.split) === null || _d === void 0 ? void 0 : _d.call(_c, ',');
            return args.length;
        }
    }
    return 0;
}
var Event = /** @class */ (function () {
    function Event() {
        var _this = this;
        var _a, _b, _c;
        this.listeners = new Map();
        (_c = (_b = (_a = chrome.runtime) === null || _a === void 0 ? void 0 : _a.onMessage) === null || _b === void 0 ? void 0 : _b.addListener) === null || _c === void 0 ? void 0 : _c.call(_b, function (request, sender, sendResponse) {
            _this.dispatchEvent(request, sendResponse);
        });
    }
    Event.prototype.dispatchEvent = function (request, sendResponse) {
        var key = request.key, data = request.data;
        if (this.listeners.has(key)) {
            var handlers = this.listeners.get(key);
            handlers.forEach(function (handler) {
                var paramSize = getFuncParameters(handler);
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
    Event.prototype.on = function (key, handler) {
        var handlers = this.listeners.get(key);
        if (handlers) {
            handlers.push(handler);
        }
        else {
            this.listeners.set(key, [handler]);
        }
    };
    Event.prototype.off = function (key, handler) {
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
    return Event;
}());
var ClientEvent = /** @class */ (function (_super) {
    __extends(ClientEvent, _super);
    function ClientEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ClientEvent.prototype.emit = function (key, data, successCallback) {
        var message = new EventMessage(key, data);
        return new Promise(function (resolve) {
            var _a, _b;
            (_b = (_a = chrome.runtime) === null || _a === void 0 ? void 0 : _a.sendMessage) === null || _b === void 0 ? void 0 : _b.call(_a, message, function (res) {
                successCallback === null || successCallback === void 0 ? void 0 : successCallback(res);
                resolve(res);
            });
        });
    };
    return ClientEvent;
}(Event));
var ServiceEvent = /** @class */ (function (_super) {
    __extends(ServiceEvent, _super);
    function ServiceEvent() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ServiceEvent.prototype.emit = function (key, data, successCallback, tabId) {
        var _this = this;
        var message = new EventMessage(key, data);
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var _tabId, _a;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = tabId;
                        if (_a) return [3 /*break*/, 2];
                        return [4 /*yield*/, getTab()];
                    case 1:
                        _a = ((_b = (_e.sent())) === null || _b === void 0 ? void 0 : _b.id);
                        _e.label = 2;
                    case 2:
                        _tabId = _a;
                        if (_tabId) {
                            (_d = (_c = chrome.tabs) === null || _c === void 0 ? void 0 : _c.sendMessage) === null || _d === void 0 ? void 0 : _d.call(_c, _tabId, message, function (res) {
                                successCallback === null || successCallback === void 0 ? void 0 : successCallback(res);
                                resolve(res);
                            });
                        }
                        else {
                            reject('tab id is not exist!');
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    };
    return ServiceEvent;
}(Event));

export { CallbackResponse, ClientEvent, EventMessage, ServiceEvent, getCallbackResponse, getFuncParameters };
