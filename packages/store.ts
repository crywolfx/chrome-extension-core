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
  set<Key extends keyof T>(key: Key, value: T[Key]): Promise<void> {
    return new Promise((resolve) => {
      this.runTimeApi?.set?.({ [key]: value }, () => {
        resolve();
      });
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
      this.runTimeApi?.get?.(key as string | string[], (res) => {
        const mergeDefaultRes = { ...this.defaultValue, ...res };
        if (Array.isArray(key)) resolve(mergeDefaultRes as Pick<T, Key>);
        resolve(mergeDefaultRes[key as string] as T[Key]);
      });
    });
  }

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
  clear(callback: () => void): Promise<void> {
    return new Promise((resolve) => {
      this.runTimeApi.clear(() => {
        callback();
        resolve();
      });
    });
  }

  /**
   * @support MV3
   */
  remove<Key extends keyof T>(key: Key | Key[]) {
    return this.runTimeApi?.remove?.(key as string | string[]);
  }

  initWatcher(onChange: WatcherCallback<T>) {
    chrome.storage?.onChanged?.addListener?.(onChange as any);
  }

  removeWatcher(onChange: WatcherCallback<T>) {
    chrome.storage?.onChanged?.removeListener?.(onChange as any);
  }
}
