import merge from 'deepmerge';
import { isObject, objectKeys, pick } from "./utils";

export type WatcherCallback<T extends Record<string, unknown>> = (
  changes: Record<keyof T, chrome.storage.StorageChange>,
  areaName?: chrome.storage.AreaName,
) => void;

export type Options<T extends Record<string, unknown>> = {
  onChange?: WatcherCallback<T>,
  scope?: string,
}
export class ChromeStorage<T extends Record<string, unknown>> {
  private watcherSet = new Set<WatcherCallback<T>>();
  private originWatcherSet = new Set<WatcherCallback<T>>();
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
      this.addWatcher(options.onChange);
    }
  }

  /**
   * @return promise
   * @support MV2 & MV3
   */
  set<Key extends keyof T>(data: Record<Key, T[Key]>): Promise<void>;
  set<Key extends keyof T>(key: Key, value: T[Key]): Promise<void>;
  set<Key extends keyof T>(key: Key | Record<Key, T[Key]>, value?: T[Key]): Promise<void> {
    return new Promise<void>((resolve) => {
      const isPlainObject = isObject(key);
      if (!this.scope) {
        if (isPlainObject) {
          this.runTimeApi.set(key, resolve);
        } else {
          this.runTimeApi?.set?.({ [key]: value }, resolve);
        } 
      } else {
        this.getAll()
          .then((scopeData) => {
            if (isPlainObject) {
              scopeData = { ...scopeData, ...key };
            } else {
              scopeData[key] = value as T[Key];
            }
            return scopeData;
          })
          .then((scopeData) => {
            this.scope &&
              this.runTimeApi?.set?.({ [this.scope]: scopeData }, resolve);
          });
      }
    });
  }

  /**
   * @return promise
   * @support MV2 & MV3
   */
  get<Key extends keyof T>(key: Key): Promise<T[Key]>;
  get<Key extends keyof T>(key: Key[]): Promise<Pick<T, Key>>;
  get<Key extends keyof T>(key: Key | Key[]): Promise<T[Key] | Pick<T, Key>> {
    return new Promise((resolve) => {
      const reallyKey = this.scope ? this.scope : key;
      this.runTimeApi?.get?.(reallyKey as string | string[], (res) => {
        // The scenario where compatibility with "res" is {} (empty set).
        const reallyRes = this.scope ? res[this.scope] : res;
        const mergeDefaultRes = merge(this.defaultValue, reallyRes ?? {}) as T;
        if (Array.isArray(key)) resolve(pick<T, Key>(mergeDefaultRes, key));
        resolve(mergeDefaultRes[key as string] as T[Key]);
      });
    });
  }

  /**
   * @return promise
   * @support MV2 & MV3
   */
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
  clear() {
    return new Promise<void>((resolve) => {
      if (this.scope) {
        this.runTimeApi.set({ [this.scope]: {} }, resolve);
      } else {
        this.runTimeApi.clear(resolve);
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
            (pre, currentKey: Key) => {
              if (!keys.includes(currentKey)) {
                pre[currentKey as any] = valueData[currentKey];
              }
              return pre;
            },
            {} as Omit<T, Key>,
          );
          this.scope &&
            this.runTimeApi.set({ [this.scope]: removedValue }, resolve);
        });
      } else {
        this.runTimeApi?.remove?.(key as string | string[], resolve);
      }
    });
  }

  private onChange(changes: Record<keyof T, chrome.storage.StorageChange>, areaName?: chrome.storage.AreaName) {
    this.watcherSet.forEach((listener) => {
      if (this.scope) {
        const oldValue = changes?.[this.scope]?.oldValue as T;
        const newValue = changes?.[this.scope]?.newValue as T;
        if (!newValue) return;
        const scopeChanges = objectKeys(newValue).reduce<Record<keyof T, chrome.storage.StorageChange>>((pre, key) => {
          pre[key] = {
            oldValue: oldValue?.[key],
            newValue: newValue?.[key],
          }
          return pre;
        }, {} as any);
        listener(scopeChanges, areaName);
      } else {
        listener(changes, areaName);
      }
    })
  }

  /**
   * 添加watcher
   * 将会被收集起来，只能通过delWatcher删除
   * @param {WatcherCallback<T>} onChange
   * @memberof ChromeStorage
   */
  addWatcher(onChange: WatcherCallback<T>) {
    this.watcherSet.add(onChange);
    if (this.watcherSet.size > 0) {
      this.addOriginalWatcher(this.onChange.bind(this));
    }
  }

  /**
   * 删除watcher监听
   * @desc 只能删除通过addWatcher添加的
   * @param {WatcherCallback<T>} onChange
   * @memberof ChromeStorage
   */
  removeWatcher(onChange: WatcherCallback<T>) {
    this.watcherSet.delete(onChange);
    if (this.watcherSet.size <= 0) {
      this.removeOriginalWatcher(this.onChange.bind(this));
    }
  }

  /**
   * 清空watcher监听
   * @desc 只能清空通过addWatcher添加的
   * @memberof ChromeStorage
   */
  clearWatcher () {
    this.watcherSet.clear();
    this.removeWatcher(this.onChange.bind(this));
  }

  /**
   * 添加原生watcher
   * @desc 原生chromeAPI提供的监听方法，无法细分到当前scope，需要调用removeOriginalWatcher来移除
   * @param {WatcherCallback<T>} onChange
   * @memberof ChromeStorage
   */
  addOriginalWatcher(onChange: WatcherCallback<T>) {
    this.originWatcherSet.add(onChange);
    chrome.storage?.onChanged?.addListener?.(onChange as any);
  }

  /**
   * 删除原生watcher
   * @desc 移除原生添加的watcher
   * @param {WatcherCallback<T>} onChange
   * @memberof ChromeStorage
   */
  removeOriginalWatcher(onChange: WatcherCallback<T>) {
    this.originWatcherSet.delete(onChange);
    chrome.storage?.onChanged?.removeListener?.(onChange as any);
  }

  clearOriginalWatcher () {
    this.originWatcherSet.forEach((listener) => {
      chrome.storage?.onChanged?.removeListener?.(listener as any);
    });
    this.originWatcherSet.clear();
  }

  emptyWatcher () {
    this.clearWatcher();
    this.clearOriginalWatcher();
  }
}

export const Store = ChromeStorage;
