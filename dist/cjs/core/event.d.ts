export type Scope = string | symbol | undefined;
export declare class EventMessage<Key = EventType, DataType = any> {
    key: Key;
    data: DataType | undefined;
    scope: Scope;
    constructor(key: Key, data?: DataType, scope?: Scope);
}
export declare class CallbackResponse<T = any> {
    success?: boolean;
    data: T;
    message?: string;
    constructor(success?: boolean, data?: null, message?: string);
}
export declare function getCallbackResponse(data: CallbackResponse): CallbackResponse<any>;
export type EventType = string | symbol | number;
export type Handler<Events, Key extends keyof Events> = (data: Events[Key], sendResponse: (response?: CallbackResponse) => void) => CallbackResponse | Promise<CallbackResponse> | void | Promise<void>;
export declare class ChromeEvent<Events extends Record<EventType, unknown>> {
    listeners: Map<any, any>;
    scope: Scope;
    /**
     * Creates an instance of Event.
     * @param {Scope} [scope] 隔离scope，避免监听到重名事件
     * @memberof Event
     */
    constructor(scope?: Scope);
    private dispatchEvent;
    on<Key extends keyof Events>(key: Key, handler: Handler<Events, Key>): void;
    off<Key extends keyof Events>(key: Key, handler?: Handler<Events, Key>): void;
    emit<Key extends keyof Events, T = any>(key: Key, data: Events[Key], options?: {
        type: 'tab' | 'extension';
        id?: number | string;
    }): Promise<CallbackResponse<T> | undefined>;
}
export declare const Event: typeof ChromeEvent;
