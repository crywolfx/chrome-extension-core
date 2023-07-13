export function isFunction(val: any): val is (...args: any[]) => any {
  return Object.prototype.toString.call(val) === '[object Function]';
}
export function isArray<T>(val: any): val is T[] {
  return Object.prototype.toString.call(val) === '[object Array]';
}
export function isDate(val: any): val is Date {
  return Object.prototype.toString.call(val) === '[object Date]';
}
export function isString(val: any): val is string {
  return Object.prototype.toString.call(val) === '[object String]';
}
export function isNumber(val: any): val is number {
  return Object.prototype.toString.call(val) === '[object Number]';
}
export function isRegExp(val: any): val is RegExp {
  return Object.prototype.toString.call(val) === '[object RegExp]';
}
export function isObject(val: any): val is Record<string, any> {
  return Object.prototype.toString.call(val) === '[object Object]';
}
export function isFormData(val: any): val is FormData {
  return Object.prototype.toString.call(val) === '[object FormData]';
}
export function isUndefined(val: any): val is undefined {
  return val === undefined;
}
export function isNull(val: any): val is null {
  return val === null;
}
export function isDef(val: any) {
  return !isUndefined(val) && !isNull(val);
}

export function objectKeys<T extends Record<string, unknown>, K extends keyof T>(object: T) {
  return Object.keys(object) as K[];
}

export function pick<T extends Record<string, unknown>, Key extends keyof T> (data: T, keys: Key[]) {
  return objectKeys<T, Key>(data).reduce((pre, key) => {
    if (keys.includes(key)) {
      pre[key] = data[key];
    }
    return pre;
  }, {} as Pick<T, Key>)
}
