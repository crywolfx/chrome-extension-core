# chrome-extension-core
Simple use of the chrome Extension API

## install
` $ npm install --save chrome-extension-core `

## Usage
### Init Event
```typescript
import { Event } from 'chrome-extension-core';
import type { RequestInitType } from '@/common/request/type';

type EventInfo = {
  anyEvent: string
};

export const chromeEvent = new Event<EventInfo>('scope');
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

export const chromeStore = new Store<StorageInfo>(chrome.storage.local, defaultValue);
```

### Use Store
```typescript
chromeStore.get('anyStore').then((res) => {
  console.log(res); // false
})
chromeStore.set('anyStore', true);
chromeStore.get('anyStore').then((res) => {
  console.log(res); // true
})
```

## API 
TODO