import _isFunction from 'lodash.isfunction';
import _isArray from 'lodash.isarray';
import _isDate from 'lodash.isdate';
import _isString from 'lodash.isstring';
import _isNumber from 'lodash.isnumber';
import _isRegExp from 'lodash.isregexp';
import _isPlainObject from 'lodash.isplainobject';
import _isBoolean from 'lodash.isboolean';

export function isFunction<T extends (...args: unknown[]) => unknown>(
  val: unknown
): val is T {
  return _isFunction(val);
}
export function isArray<T extends unknown[]>(val: unknown): val is T {
  return _isArray(val);
}
export function isDate<T extends Date>(val: unknown): val is T {
  return _isDate(val);
}
export function isString<T extends string>(val: unknown): val is T {
  return _isString(val);
}
export function isNumber<T extends number>(val: unknown): val is T {
  return _isNumber(val);
}
export function isRegExp<T extends RegExp>(val: unknown): val is T {
  return _isRegExp(val);
}
export function isObject<T extends Record<PropertyKey, unknown>>(
  val: unknown
): val is T {
  return _isPlainObject(val);
}
export function isBoolean<T extends boolean>(val: unknown): val is T {
  return _isBoolean(val);
}
export function isFormData<T extends FormData>(val: unknown): val is T {
  return Object.prototype.toString.call(val) === '[object FormData]';
}
export function isUndefined(val: unknown): val is undefined {
  return val === undefined;
}
export function isNull(val: unknown): val is null {
  return val === null;
}
export function isDef<T>(val: unknown): val is Required<T> {
  return !isUndefined(val) && !isNull(val);
}
export function isNotEmpty<T>(val: unknown): val is Exclude<Required<T>, ''> {
  return !isUndefined(val) && !isNull(val) && val !== '';
}

export function objectKeys<
  T extends Record<string, unknown>,
  K extends keyof T
>(object: T) {
  return Object.keys(object) as K[];
}

export function pick<T extends Record<string, unknown>, Key extends keyof T>(
  data: T,
  keys: Key[]
) {
  return objectKeys<T, Key>(data).reduce((pre, key) => {
    if (keys.includes(key)) {
      pre[key] = data[key];
    }
    return pre;
  }, {} as Pick<T, Key>);
}

export type JsonParseParams = Parameters<JSON['parse']>;
export type JsonStringifyParams = Parameters<JSON['stringify']>;

export function jsonParse(string: unknown, reviver?: JsonParseParams[1]) {
  if (!isString(string)) return string;
  try {
    const data = JSON.parse(string, reviver);
    return data;
  } catch (error) {
    return null;
  }
}

export function jsonStringify(
  value: unknown,
  replacer?: JsonStringifyParams[1],
  space?: JsonStringifyParams[2]
) {
  try {
    const string = JSON.stringify(value, replacer, space);
    return string;
  } catch (error) {
    return '';
  }
}
