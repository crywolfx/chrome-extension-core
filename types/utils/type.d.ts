export declare function isFunction(val: any): val is (...args: any[]) => any;
export declare function isArray<T>(val: any): val is T[];
export declare function isDate(val: any): val is Date;
export declare function isString(val: any): val is string;
export declare function isNumber(val: any): val is number;
export declare function isRegExp(val: any): val is RegExp;
export declare function isObject(val: any): val is Record<string, any>;
export declare function isFormData(val: any): val is FormData;
export declare function isUndefined(val: any): val is undefined;
export declare function isNull(val: any): val is null;
export declare function isDef(val: any): boolean;
export declare type FilterKeys<T, U> = {
    [K in keyof T]: K extends U ? never : K;
}[keyof T];
export declare type DeepReadonly<T> = T extends (infer R)[] ? DeepReadonlyArray<R> : T extends (...args: any[]) => any ? T : T extends Record<string, unknown> ? DeepReadonlyObject<T> : T;
declare type DeepReadonlyArray<T> = Record<string, unknown> & readonly DeepReadonly<T>[];
declare type DeepReadonlyObject<T> = {
    readonly [P in keyof T]: DeepReadonly<T[P]>;
};
export declare function jsonParse(string: string): any;
export declare function flatten<T>(array: T[]): T[];
export declare function toNum(size: any, defaultVal?: number): number;
export declare function objectKeys<T, K extends keyof T>(object: T): K[];
export {};
