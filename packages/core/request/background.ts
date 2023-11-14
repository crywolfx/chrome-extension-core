import proxyEvent from './event';
import request, { extend } from 'umi-request';
import type {
  ExtendOptionsInit,
  ExtendOptionsWithResponse,
  ExtendOptionsWithoutResponse,
  RequestMethod,
} from 'umi-request';
import { isObject } from '@/utils';
import { deserialize } from '@/utils/serialize';

/**
 * 在background中初始化代理请求
 * 详细传参见[https://github.com/umijs/umi-request/blob/HEAD/README_zh-CN.md]
 */
export function initProxyRequest(): void;
export function initProxyRequest(
  options:
    | ExtendOptionsInit
    | ExtendOptionsWithoutResponse
    | ExtendOptionsWithResponse
): RequestMethod<any>;
export function initProxyRequest(
  options?:
    | ExtendOptionsInit
    | ExtendOptionsWithoutResponse
    | ExtendOptionsWithResponse
): RequestMethod<any> | void {
  const instance = isObject(options) ? extend(options) : request;
  proxyEvent.on('request', async (config) => {
    const { url, data, ...extra } = config || {};
    try {
      const deserializeData = deserialize(data);
      const result = await instance(url, {
        ...extra,
        data: deserializeData,
      });
      return {
        data: result,
        message: '',
        success: true,
      };
    } catch (error) {
      return {
        data: error,
        message: '',
        success: false,
      };
    }
  });
  if (options) return instance;
}