# chrome-extension-core
Simple use of the chrome extension api

## install
` $ npm install --save chrome-extension-core `

## Usage
### Init Event
```typescript
import { Event } from 'chrome-extension-core';

type EventInfo = {
  anyEvent: string
};

type EventResponse = {
  anyEvent: number;
}

export const chromeEvent = new Event<EventInfo, EventResponse>('scope');
```
### Use Event
```typescript
chromeEvent.on('anyEvent', (val) => {
  console.log(val); // test test test
  return { message: 'success', success: true, data: 123 };
})

chromeEvent.emit('anyEvent', 'test test test').then((res) => {
  console.log(res);   //  { message: 'success', success: true, data: 123 }
})
```


### Init Store
```typescript
import { Store } from 'chrome-extension-core';

export type StorageInfo = {
  anyStore: boolean; 
};

export const defaultValue: StorageInfo = {
  anyStore: false,
};

export const chromeStore = new Store<StorageInfo>(chrome.storage.local, defaultValue, { scope: 'scope' });
```

### Use Store
```typescript
chromeStore.get('anyStore').then((res) => {
  console.log(res); // false
});
chromeStore.addWatcher((data) => {
  console.log(data) // { anyStore: { newValue: true, oldValue: false }}
})
chromeStore.set('anyStore', true);
chromeStore.get('anyStore').then((res) => {
  console.log(res); // true
});
```

### Init Proxy Request
- background(service worker)
```typescript
import { initProxyRequest } from 'chrome-extension-core';
initProxyRequest();
```
- content script
```typescript
import { createProxyRequest } from 'chrome-extension-core';
export const proxyRequest = createProxyRequest();
```

### Use Proxy Request

## API 
### Event
`constructor(scope?)`

Create a new `ChromeEvent` instance.

### `on<Key>(key, handler)`

Add an event listener for the specified event key.

- **Parameters:**
  - `key`: The key of the event to listen for.
  - `handler`: The event handler function.

### `emit<Key>(key, data, options)`

Emit an event with the specified key and data.

- **Parameters:**
  - `key`: The key of the event to emit.
  - `data`: The data to associate with the event.
  - `options`: An optional object containing additional options.
    - `type`: The type of emission ('tab' or 'extension').
    - `id`: The ID of the tab or extension (optional).

- **Returns:**
  - A `Promise` that resolves to the response of the event handler.


### `off<Key>(key, handler)`

Remove an event listener for the specified event key.

- **Parameters:**
  - `key`: The key of the event to remove the listener for.
  - `handler`: The event handler function to remove (optional). If not provided, all listeners for the specified event key will be removed.
---

### Store
`constructor(runTimeApi, defaultValue, options?)`

Create a new `ChromeStorage` instance.

- `runTimeApi`: `chrome.storage.SyncStorageArea` or `chrome.storage.LocalStorageArea`.
- `defaultValue`: Default value.
- `options`: Optional, containing `onChange` and `scope`.

### `set(data)`

Set values in storage.

- `data`: An object containing key-value pairs to set.

### `get(key)`

Get a value from storage.

- `key`: The key to retrieve.

### `getAll()`

Get all values from storage.

### `clear()`

Clear all values in storage.

### `remove(key)`

Remove values associated with the specified key from storage.

- `key`: The key or array of keys to remove.

### `addWatcher(onChange)`

Add a scoped observer to monitor changes within the specified scope.

- `onChange`: The callback function to listen for changes.

### `removeWatcher(onChange)`

Remove a specified observer from the list of scoped observers.

- `onChange`: The callback function of the observer to remove.

### `clearWatcher()`

Clear all scoped observers.

### `addOriginalWatcher(onChange)`

Add a global storage watcher to monitor changes in the entire storage.

- `onChange`: The callback function of the global watcher.

### `removeOriginalWatcher(onChange)`

Remove a global storage watcher.

- `onChange`: The callback function of the global watcher to remove.

### `clearOriginalWatcher()`

Clear all global storage watchers.

### `emptyWatcher()`

Clear all scoped and global observers.