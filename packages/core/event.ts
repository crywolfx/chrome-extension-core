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

export class CallbackResponse<T = any> {
  success?: boolean;
  data: T;
  message?: string;
  constructor(success = true, data: T, message = '') {
    this.success = success;
    this.data = data;
    this.message = message;
  }
}

export function getCallbackResponse<T = any>(data: CallbackResponse<T>) {
  return new CallbackResponse<T>(data.success, data.data, data.message);
}

export type EventType = string | symbol | number;
export type Handler<
  Events,
  Key extends keyof Events,
  EventsResponse extends Partial<Record<keyof Events, any>>
> = (
  data: Events[Key],
  sendResponse: (response?: CallbackResponse<EventsResponse[Key]>) => void
) =>
  | CallbackResponse<EventsResponse[Key]>
  | Promise<CallbackResponse<EventsResponse[Key]>>
  | void
  | Promise<void>;

export class ChromeEvent<
  Events extends Record<EventType, unknown>,
  EventsResponse extends Partial<Record<keyof Events, any>> = Record<
    keyof Events,
    any
  >
> {
  listeners = new Map();
  scope: Scope;
  /**
   * Creates an instance of Event.
   * @param {Scope} [scope] 隔离scope，避免监听到重名事件
   * @memberof Event
   */
  constructor(scope?: Scope) {
    this.scope = scope;
    chrome.runtime?.onMessage?.addListener?.(
      (request, sender, sendResponse) => {
        this.dispatchEvent(request, sendResponse);
        return true;
      }
    );
  }
  private dispatchEvent(
    request: EventMessage<keyof Events, Events[keyof Events]>,
    sendResponse: (response?: CallbackResponse) => void
  ) {
    const { key, data, scope } = request;
    if (scope && scope !== this.scope) return;
    if (this.listeners.has(key)) {
      const handlers = this.listeners.get(key);
      handlers.forEach(
        (
          handler: (
            data: any,
            callback?: (response?: CallbackResponse) => void
          ) =>
            | CallbackResponse
            | Promise<CallbackResponse>
            | void
            | Promise<void>
        ) => {
          const paramSize = handler.length;
          const response = handler?.(data, sendResponse);
          if (paramSize < 2) {
            // 接口设计需要发送回执
            if (response) {
              if (response instanceof Promise) {
                response
                  .then((res) => {
                    const resData =
                      res || new CallbackResponse(true, null, 'success');
                    sendResponse(getCallbackResponse(resData));
                  })
                  .catch((error) => {
                    sendResponse(
                      new CallbackResponse(false, error, error?.toString?.())
                    );
                  });
              } else {
                sendResponse(getCallbackResponse(response));
              }
            } else {
              sendResponse(new CallbackResponse(true, null, 'success'));
            }
          }
        }
      );
    }
  }

  on<Key extends keyof Events>(
    key: Key,
    handler: Handler<Events, Key, EventsResponse>
  ) {
    const handlers: Handler<Events, Key, EventsResponse>[] =
      this.listeners.get(key);
    if (handlers) {
      handlers.push(handler);
    } else {
      this.listeners.set(key, [handler]);
    }
  }

  off<Key extends keyof Events>(
    key: Key,
    handler?: Handler<Events, Key, EventsResponse>
  ) {
    const handlers: Handler<Events, Key, EventsResponse>[] =
      this.listeners.get(key);
    if (handlers) {
      if (handler) {
        handlers.splice(handlers.indexOf(handler) >>> 0, 1);
      } else {
        this.listeners?.set(key, []);
      }
    }
  }

  emit<Key extends keyof Events>(
    key: Key,
    data: Events[Key],
    options?: {
      type: 'tab' | 'extension';
      id?: number | string;
    }
  ) {
    const message = new EventMessage(key, data, this.scope);
    return new Promise<CallbackResponse<EventsResponse[Key]> | undefined>(
      async (resolve, reject) => {
        if (!options) return chrome.runtime?.sendMessage?.(message, resolve);
        if (options.type === 'extension') {
          const id = (options.id as string) || chrome.runtime.id;
          if (!id) return reject('id is not exist!');
          chrome.runtime?.sendMessage?.(id, message, resolve);
        } else {
          const id =
            options.id ||
            (await getTab().catch(() => Promise.resolve({ id: undefined })))
              ?.id;
          if (!id) return reject('id is not exist!');
          chrome.tabs?.sendMessage?.(id as number, message, resolve);
        }
      }
    );
  }
}

export const Event = ChromeEvent;
