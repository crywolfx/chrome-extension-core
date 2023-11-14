/// <reference types="chrome" />
export type WatcherCallback<T extends Record<string, unknown>> = (changes: Record<keyof T, chrome.storage.StorageChange>, areaName?: chrome.storage.AreaName) => void;
export type Options<T extends Record<string, unknown>> = {
    onChange?: WatcherCallback<T>;
    scope?: string;
};
export declare class ChromeStorage<T extends Record<string, unknown>> {
    private watcherSet;
    private originWatcherSet;
    private runTimeApi;
    defaultValue: T;
    scope?: string;
    constructor(runTimeApi: chrome.storage.SyncStorageArea | chrome.storage.LocalStorageArea, defaultValue: T, options?: Options<T>);
    /**
     * @return promise
     * @support MV2 & MV3
     */
    set<Key extends keyof T>(data: Record<Key, T[Key]>): Promise<void>;
    set<Key extends keyof T>(key: Key, value: T[Key]): Promise<void>;
    /**
     * @return promise
     * @support MV2 & MV3
     */
    get<Key extends keyof T>(key: Key): Promise<T[Key]>;
    get<Key extends keyof T>(key: Key[]): Promise<Pick<T, Key>>;
    /**
     * @return promise
     * @support MV2 & MV3
     */
    getAll(): Promise<T>;
    /**
     * @return promise
     * @support MV2 & MV3
     */
    clear(): Promise<void>;
    /**
     * @return promise
     * @support MV2 & MV3
     */
    remove<Key extends keyof T>(key: Key | Key[]): Promise<void>;
    private onChange;
    /**
     * 添加watcher
     * 将会被收集起来，只能通过delWatcher删除
     * @param {WatcherCallback<T>} onChange
     * @memberof ChromeStorage
     */
    addWatcher(onChange: WatcherCallback<T>): void;
    /**
     * 删除watcher监听
     * @desc 只能删除通过addWatcher添加的
     * @param {WatcherCallback<T>} onChange
     * @memberof ChromeStorage
     */
    removeWatcher(onChange: WatcherCallback<T>): void;
    /**
     * 清空watcher监听
     * @desc 只能清空通过addWatcher添加的
     * @memberof ChromeStorage
     */
    clearWatcher(): void;
    /**
     * 添加原生watcher
     * @desc 原生chromeAPI提供的监听方法，无法细分到当前scope，需要调用removeOriginalWatcher来移除
     * @param {WatcherCallback<T>} onChange
     * @memberof ChromeStorage
     */
    addOriginalWatcher(onChange: WatcherCallback<T>): void;
    /**
     * 删除原生watcher
     * @desc 移除原生添加的watcher
     * @param {WatcherCallback<T>} onChange
     * @memberof ChromeStorage
     */
    removeOriginalWatcher(onChange: WatcherCallback<T>): void;
    clearOriginalWatcher(): void;
    emptyWatcher(): void;
}
export declare const Store: typeof ChromeStorage;
