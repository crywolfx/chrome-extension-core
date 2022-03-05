/// <reference types="chrome" />
export declare type WatcherCallback<T extends Record<string, unknown>> = (changes: Record<keyof T, chrome.storage.StorageChange>, areaName?: chrome.storage.AreaName) => void;
export default class ChromeStorage<T extends Record<string, unknown>> {
    private runTimeApi;
    defaultValue: T;
    constructor(runTimeApi: chrome.storage.SyncStorageArea | chrome.storage.LocalStorageArea, defaultValue: T, onChange?: WatcherCallback<T>);
    /**
     * @return promise
     * @support MV2 & MV3
     */
    set<Key extends keyof T>(key: Key, value: T[Key]): Promise<void>;
    /**
     * @return promise
     * @support MV2 & MV3
     */
    get<Key extends keyof T>(key: Key): Promise<T[Key]>;
    get<Key extends keyof T>(key: Key[]): Promise<Pick<T, Key>>;
    getAll(): Promise<T>;
    /**
     * @return promise
     * @support MV2 & MV3
     */
    clear(callback: () => void): Promise<void>;
    /**
     * @support MV3
     */
    remove<Key extends keyof T>(key: Key | Key[]): Promise<void>;
    initWatcher(onChange: WatcherCallback<T>): void;
    removeWatcher(onChange: WatcherCallback<T>): void;
}
