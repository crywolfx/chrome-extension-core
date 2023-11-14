'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function isObject(val) {
    return Object.prototype.toString.call(val) === '[object Object]';
}
function objectKeys(object) {
    return Object.keys(object);
}
function pick(data, keys) {
    return objectKeys(data).reduce(function (pre, key) {
        if (keys.includes(key)) {
            pre[key] = data[key];
        }
        return pre;
    }, {});
}

exports.isObject = isObject;
exports.objectKeys = objectKeys;
exports.pick = pick;
