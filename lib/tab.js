import { b as __assign } from './_tslib-66d9c63d.js';

function getTab(params) {
    return new Promise(function (resolve) {
        var _a, _b;
        (_b = (_a = chrome.tabs) === null || _a === void 0 ? void 0 : _a.query) === null || _b === void 0 ? void 0 : _b.call(_a, __assign({ active: true, currentWindow: true }, (params || {})), function (tabs) {
            var tabInfo = tabs === null || tabs === void 0 ? void 0 : tabs[0];
            resolve(tabInfo);
        });
    });
}

export { getTab };
