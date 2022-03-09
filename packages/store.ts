import { objectKeys, pick } from "./utils";

export type WatcherCallback<T extends Record<string, unknown>> = (
  changes: Record<keyof T, chrome.storage.StorageChange>,
  areaName?: chrome.storage.AreaName,
) => void;

export type Options<T extends Record<string, unknown>> = {
  onChange?: WatcherCallback<T>,
  scope?: string,
}
export class ChromeStorage<T extends Record<string, unknown>> {
  private watcherMap = new Map();
  private runTimeApi: chrome.storage.SyncStorageArea | chrome.storage.LocalStorageArea;
  defaultValue: T;
  scope?: string;

  constructor(
    runTimeApi: chrome.storage.SyncStorageArea | chrome.storage.LocalStorageArea,
    defaultValue: T,
    options?: Options<T>,
  ) {
    this.runTimeApi = runTimeApi;
    this.defaultValue = defaultValue;
    this.scope = options?.scope;
    if (options?.onChange) {
      this.initWatcher(options.onChange);
    }
  }

  /**
   * @return promise
   * @support MV2 & MV3
   */
  set<Key extends keyof T>(key: Key, value: T[Key]): Promise<void> {
    return new Promise((resolve) => {
      if (!this.scope) {
        this.runTimeApi?.set?.({ [key]: value }, () => {
          resolve();
        });
      } else {
        this.getAll()
          .then((scopeData) => {
            scopeData[key] = value;
            return scopeData;
          })
          .then((scopeData) => {
            this.scope &&
              this.runTimeApi?.set?.({ [this.scope]: scopeData }, () => {
                resolve();
              });
          });
      }
    });
  }

  /**
   * @return promise
   * @support MV2 & MV3
   */
  async get<Key extends keyof T>(key: Key): Promise<T[Key]>;
  async get<Key extends keyof T>(key: Key[]): Promise<Pick<T, Key>>;
  async get<Key extends keyof T>(key: Key | Key[]): Promise<T[Key] | Pick<T, Key>> {
    return new Promise((resolve) => {
      const reallyKey = this.scope ? this.scope : key;
      this.runTimeApi?.get?.(reallyKey as string | string[], (res) => {
        const reallyRes = this.scope ? res[this.scope] : res;
        const mergeDefaultRes = { ...this.defaultValue, ...reallyRes };
        if (Array.isArray(key)) resolve(pick<T, Key>(mergeDefaultRes, key));
        resolve(mergeDefaultRes[key as string] as T[Key]);
      });
    });
  }

  getAll() {
    return new Promise<T>((resolve) => {
      this.runTimeApi?.get?.((res) => {
        const reallyRes = this.scope ? res[this.scope] : res;
        const mergeDefaultRes = { ...this.defaultValue, ...reallyRes };
        resolve(mergeDefaultRes as T);
      });
    });
  }

  /**
   * @return promise
   * @support MV2 & MV3
   */
  clear(): Promise<void> {
    return new Promise((resolve) => {
      if (this.scope) {
        this.runTimeApi.set({ [this.scope]: {} }, () => {
          resolve();
        });
      } else {
        this.runTimeApi.clear(() => {
          resolve();
        });
      }
    });
  }

  /**
   * @return promise
   * @support MV2 & MV3
   */
  remove<Key extends keyof T>(key: Key | Key[]) {
    return new Promise<void>((resolve) => {
      if (this.scope) {
        this.runTimeApi.get(this.scope, (value) => {
          const valueData = value as T;
          const keys = Array.isArray(key) ? key : [key];
          const removedValue = objectKeys<T, Key>(valueData)?.reduce?.(
            (pre: any, currentKey: Key) => {
              if (!keys.includes(currentKey)) {
                pre[currentKey as any] = valueData[currentKey];
              }
              return pre;
            },
            {} as Omit<T, Key>,
          );
          this.scope &&
            this.runTimeApi.set({ [this.scope]: removedValue }, () => {
              resolve();
            });
        });
      } else {
        this.runTimeApi?.remove?.(key as string | string[], () => {
          resolve();
        });
      }
    });
  }

  initWatcher(onChange: WatcherCallback<T>) {
    chrome.storage?.onChanged?.addListener?.(onChange as any);
  }

  removeWatcher(onChange: WatcherCallback<T>) {
    chrome.storage?.onChanged?.removeListener?.(onChange as any);
  }
}
