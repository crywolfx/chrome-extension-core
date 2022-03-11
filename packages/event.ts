import { isFunction } from './utils';
import { getTab } from './tab';

export type Scope = string | symbol | undefined;

export class EventMessage<Key = EventType, DataType = any> {
  key: Key;
  data: DataType | undefined;
  scope: Scope;
  constructor(key: Key, data?: DataType, scope?: Scope) {
    this.key = key;
    this.data = data;
    this.scope = scope;
  }
}

export class CallbackResponse {
  success?: boolean;
  data: any;
  message?: string;
  constructor(success = true, data = null, message = '') {
    this.success = success;
    this.data = data;
    this.message = message;
  }
}

export function getCallbackResponse(data: CallbackResponse) {
  return new CallbackResponse(data.success, data.data, data.message);
}

export type EventType = string | symbol | number;
export type Handler<Events, Key extends keyof Events> = (
  data: Events[Key],
  sendResponse: (response?: CallbackResponse) => void,
) => CallbackResponse | Promise<CallbackResponse> | void | Promise<void>;

export class Event<Events extends Record<EventType, unknown>> {
  listeners = new Map();
  scope: Scope;
  /**
   * Creates an instance of Event.
   * @param {Scope} [scope] 隔离scope，避免监听到重名事件
   * @memberof Event
   */
  constructor(scope?: Scope) {
    this.scope = scope;
    chrome.runtime?.onMessage?.addListener?.((request, sender, sendResponse) => {
      this.dispatchEvent(request, sendResponse);
      return true;
    });
  }
  private dispatchEvent(
    request: EventMessage<keyof Events, Events[keyof Events]>,
    sendResponse: (response?: CallbackResponse) => void,
  ) {
    const { key, data, scope } = request;
    if (scope && scope !== this.scope) return;
    if (this.listeners.has(key)) {
      const handlers = this.listeners.get(key);
      handlers.forEach(
        (
          handler: (
            data: any,
            callback?: (response?: CallbackResponse) => void,
          ) => CallbackResponse | Promise<CallbackResponse> | void | Promise<void>,
        ) => {
          const paramSize = handler.length;
          const response = handler?.(data, sendResponse);
          if (paramSize < 2) {
            // 接口设计需要发送回执
            if (response) {
              if (response instanceof Promise) {
                response
                  .then((res) => {
                    const resData = res || new CallbackResponse(true, null, 'success');
                    sendResponse(getCallbackResponse(resData));
                  })
                  .catch((error) => {
                    sendResponse(new CallbackResponse(false, error, error?.toString?.()));
                  });
              } else {
                sendResponse(getCallbackResponse(response));
              }
            } else {
              sendResponse(new CallbackResponse(true, null, 'success'));
            }
          }
        },
      );
    }
  }

  on<Key extends keyof Events>(key: Key, handler: Handler<Events, Key>) {
    const handlers: Handler<Events, Key>[] = this.listeners.get(key);
    if (handlers) {
      handlers.push(handler);
    } else {
      this.listeners.set(key, [handler]);
    }
  }

  off<Key extends keyof Events>(key: Key, handler?: Handler<Events, Key>) {
    const handlers: Handler<Events, Key>[] = this.listeners.get(key);
    if (handlers) {
      if (handler) {
        handlers.splice(handlers.indexOf(handler) >>> 0, 1);
      } else {
        this.listeners?.set(key, []);
      }
    }
  }

  /**
   * 不指定tabId发送消息
   * 长用作给background发送消息
   */
  emit<Key extends keyof Events>(
    key: Key,
    data: Events[Key],
    successCallback?: (response?: CallbackResponse) => void,
  ) {
    const message = new EventMessage(key, data, this.scope);
    return new Promise<CallbackResponse | undefined>((resolve) => {
      chrome.runtime?.sendMessage?.(message, (res) => {
        successCallback?.(res);
        resolve(res);
      });
    });
  }

  /**
   * 指定tabId发送消息
   * 默认为当前激活状态的tabId
   */
  emitSpecify<Key extends keyof Events>(
    key: Key,
    data: Events[Key],
    successCallback?: (response?: CallbackResponse) => void,
    tabId?: number,
  ) {
    const message = new EventMessage(key, data, this.scope);
    return new Promise<CallbackResponse | undefined>(async (resolve, reject) => {
      const _tabId = tabId || (await getTab().catch(() => Promise.resolve({ id: undefined })))?.id;
      if (_tabId) {
        chrome.tabs?.sendMessage?.(_tabId, message, (res) => {
          successCallback?.(res);
          resolve(res);
        });
      } else {
        reject('tab id is not exist!');
      }
    });
  }
}
