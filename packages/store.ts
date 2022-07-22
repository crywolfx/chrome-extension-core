import { isObject } from "./utils";

export type WatcherCallback<T extends Record<string, unknown>> = (
  changes: Record<keyof T, chrome.storage.StorageChange>,
  areaName?: chrome.storage.AreaName,
) => void;
export class ChromeStorage<T extends Record<string, unknown>> {
  private runTimeApi: chrome.storage.SyncStorageArea | chrome.storage.LocalStorageArea;
  defaultValue: T;

  constructor(
    runTimeApi: chrome.storage.SyncStorageArea | chrome.storage.LocalStorageArea,
    defaultValue: T,
    onChange?: WatcherCallback<T>,
  ) {
    this.runTimeApi = runTimeApi;
    this.defaultValue = defaultValue;
    if (onChange) {
      this.initWatcher(onChange);
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
      if (isObject(key)) {
        this.runTimeApi.set(key, resolve);
      } else {
        this.runTimeApi?.set?.({ [key]: value }, resolve);
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
      this.runTimeApi?.get?.(key as string | string[], (res) => {
        const mergeDefaultRes = { ...this.defaultValue, ...res };
        if (Array.isArray(key)) resolve(mergeDefaultRes as Pick<T, Key>);
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
      this.runTimeApi?.get?.((item) => {
        resolve({ ...this.defaultValue, ...item } as T);
      });
    });
  }

  /**
   * @return promise
   * @support MV2 & MV3
   */
  clear() {
    return new Promise<void>((resolve) => {
      this.runTimeApi.clear(resolve);
    });
  }

  /**
   * @return promise
   * @support MV2 & MV3
   */
  remove<Key extends keyof T>(key: Key | Key[]) {
    return new Promise<void>((resolve) => {
      this.runTimeApi?.remove?.(key as string | string[], resolve);
    })
  }

  initWatcher(onChange: WatcherCallback<T>) {
    chrome.storage?.onChanged?.addListener?.(onChange as any);
  }

  removeWatcher(onChange: WatcherCallback<T>) {
    chrome.storage?.onChanged?.removeListener?.(onChange as any);
  }
}

export const Store = ChromeStorage;