export declare class EventMessage<Key = EventType, DataType = any> {
    key: Key;
    data: DataType | undefined;
    constructor(key: Key, data?: DataType);
}
export declare class CallbackResponse {
    success?: boolean;
    data: any;
    message?: string;
    constructor(success?: boolean, data?: null, message?: string);
}
export declare function getCallbackResponse(data: CallbackResponse): CallbackResponse;
export declare type EventType = string | symbol | number;
export declare type Handler<Events, Key extends keyof Events> = (data: Events[Key], sendResponse: (response?: CallbackResponse) => void) => CallbackResponse | Promise<CallbackResponse> | void | Promise<void>;
export declare function getFuncParameters(func: (...args: any[]) => any): number;
declare class Event<Events extends Record<EventType, unknown>> {
    listeners: Map<any, any>;
    constructor();
    private dispatchEvent;
    on<Key extends keyof Events>(key: Key, handler: Handler<Events, Key>): void;
    off<Key extends keyof Events>(key: Key, handler?: Handler<Events, Key>): void;
}
export declare class ClientEvent<Events extends Record<EventType, unknown>> extends Event<Events> {
    emit<Key extends keyof Events>(key: Key, data: Events[Key], successCallback?: (response?: CallbackResponse) => void): Promise<unknown>;
}
export declare class ServiceEvent<Events extends Record<EventType, unknown>> extends Event<Events> {
    emit<Key extends keyof Events>(key: Key, data: Events[Key], successCallback?: (response?: CallbackResponse) => void, tabId?: number): Promise<unknown>;
}
export {};
