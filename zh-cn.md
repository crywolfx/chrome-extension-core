# chrome-extension-core

Simple use of the chrome extension api

```json
"peerDependencies": {
  "umi-request": ">=1.4.0"
},
```

## 安装

`$ npm install --save chrome-extension-core`

## 用法

### 初始化事件

```typescript
import { Event } from 'chrome-extension-core';

type EventInfo = {
  anyEvent: string;
};

type EventResponse = {
  anyEvent: number;
};

export const chromeEvent = new Event<EventInfo, EventResponse>('scope');
```

### 使用事件

```typescript
chromeEvent.on('anyEvent', (val) => {
  console.log(val); // test test test
  return { message: 'success', success: true, data: 123 };
});

chromeEvent.emit('anyEvent', 'test test test').then((res) => {
  console.log(res); //  { message: 'success', success: true, data: 123 }
});
```

### 初始化存储

```typescript
import { Store } from 'chrome-extension-core';

export type StorageInfo = {
  anyStore: boolean;
};

export const defaultValue: StorageInfo = {
  anyStore: false,
};

export const chromeStore = new Store<StorageInfo>(
  chrome.storage.local,
  defaultValue,
  { scope: 'scope' }
);
```

### 使用存储

```typescript
chromeStore.get('anyStore').then((res) => {
  console.log(res); // false
});
chromeStore.addWatcher((data) => {
  console.log(data); // { anyStore: { newValue: true, oldValue: false }}
});
chromeStore.set('anyStore', true);
chromeStore.get('anyStore').then((res) => {
  console.log(res); // true
});
```

### 初始化代理请求

- 后台（service worker）

```typescript
const directRequest = initProxyRequest({
  scope: 'your-scope', // 可选，代理请求的范围
  options: {
    // umi-request 配置选项
    // ...
  },
});

// 发起 directRequest
directRequest({
  url: '/api/data',
  method: 'GET',
}).then((response) => {
  console.log('响应:', response);
});
```

### 使用代理请求
- 内容脚本

```typescript
const proxyRequest = createProxyRequest({
  scope: 'your-scope', // 可选，代理请求的范围，与 initProxyRequest 保持一致
});

// 发起 proxyRequest
proxyRequest({
  url: '/api/data',
  method: 'GET',
}).then((response) => {
  console.log('响应:', response);
});

// 或使用简写方法
proxyRequest.get('/api/data', { params: { key: 'value' } }).then((response) => {
  console.log('响应:', response);
});

proxyRequest.post('/api/data', { data: { key: 'value' } }).then((response) => {
  console.log('响应:', response);
});
```

## API

### Event

`constructor(scope?)`

创建一个新的 `ChromeEvent` 实例。

### `on<Key>(key, handler)`

为指定的事件键添加事件监听器。

- **参数：**
  - `key`：要监听的事件的键。
  - `handler`：事件处理程序函数。

### `emit<Key>(key, data, options)`

发射具有指定键和数据的事件。

- **参数：**

  - `key`：要发射的事件的键。
  - `data`：与事件关联的数据。
  - `options`：包含其他选项的可选对象。
    - `type`：发射类型（'tab' 或 'extension'）。
    - `id`：选项卡或扩展的 ID（可选）。

- **返回：**
  - 一个解析为事件处理程序响应的 `Promise`。

### `off<Key>(key, handler)`

删除指定事件键的事件监听器。

- **参数：**
  - `key`：要为其删除侦听器的事件键。
  - `handler`：要删除的事件处理程序函数（可选）。如果未提供，将删除指定事件键的所有侦听器。

---

### Store

`constructor(runTimeApi, defaultValue, options?)`

创建一个新的 `ChromeStorage` 实例。

- `runTimeApi`：`chrome.storage.SyncStorageArea` 或 `chrome.storage.LocalStorageArea`。
- `defaultValue`：默认值。
- `options`：可选，包含 `onChange` 和 `scope`。

### `set(data)`

在存储中设置值。

- `data`：包含要设置的键值对的对象。

### `get(key)`

从存储中获取值。

- `key`：要检索的键。

### `getAll()`

从存储中获取所有值。

### `clear()`

清除存储中的所有值。

### `remove(key)`

从存储中删除与指定键关联的值。

- `key`：要删除的键或键数组。

### `addWatcher(onChange)`

添加一个作用域观察者，以监视指定范围内的更改。

- `onChange`：要监听更改的回调函数。

### `removeWatcher(onChange)`

从作用域观察者列表中删除指定的观察者。

- `onChange`：要删除的观察者的回调函数。

### `clearWatcher()`

清除所有作用域观察者。

### `addOriginalWatcher(onChange)`

向全局存储中添加一个观察者，以监视整个存

储中的更改。

- `onChange`：全局观察者的回调函数。

### `removeOriginalWatcher(onChange)`

删除一个全局存储观察者。

- `onChange`：要删除的全局观察者的回调函数。

### `clearOriginalWatcher()`

清除所有全局存储观察者。

### `emptyWatcher()`

清除所有作用域和全局观察者。

### Request

### initProxyRequest
`initProxyRequest(config?: { scope?: string; options?: ExtendOptionsInit | ExtendOptionsWithoutResponse | ExtendOptionsWithResponse }): RequestMethod<boolean>`

在 `background` 中初始化代理请求。

- `config`（可选）：包含以下属性的配置对象：
  - `scope`（可选）：代理请求的范围，以避免在多个项目中配置不同的情况下导致代理混乱。
  - `options`（可选）：umi-request 的配置选项，详见 [umi-request 文档](https://github.com/umijs/umi-request/blob/HEAD/README_zh-CN.md)。

- 返回：可以在服务工作器中用于发起请求的 umi-request 的实例。

### createProxyRequest
`createProxyRequest(options?: { scope?: string }): RequestMethodProxy<false>`

创建一个代理请求，将通过事件通信发送到 `background` 进行执行。

- `options`（可选）：包含以下属性的配置对象：
  - `scope`（可选）：代理请求的范围，以避免在多个项目中配置不同的情况下导致代理混乱。

- 返回：可用于发起请求的代理请求函数。

### Request Method Proxy

一组用于发起代理请求的方法，包括：
- `get(url: string, options?: RequestOptionsInit): Promise<T>`
- `post(url: string, options?: RequestOptionsInit): Promise<T>`

这些方法可用于发起特定的 HTTP 请求。

此文档提供了有关创建代理请求的使用说明以及有关用于发起请求的可用方法的详细信息。根据特定要求和项目配置进行调整。