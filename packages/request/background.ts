import request, { extend } from 'umi-request';
import type {
  ExtendOptionsInit,
  ExtendOptionsWithResponse,
  ExtendOptionsWithoutResponse,
  RequestMethod,
} from 'umi-request';
import { isObject } from '@/utils';
import { deserialize } from '@/utils/serialize';
import createProxyEvent from './event';

/**
 * 在background中初始化代理请求
 * 详细传参见[https://github.com/umijs/umi-request/blob/HEAD/README_zh-CN.md]
 * @export
 * @param {{
 *   scope?: string;
 *   options?: undefined;
 * }} [config]
 */
export function initProxyRequest(config?: {
  /**
   * 代理请求scope, 可避免多个项目都初始化了该代理能力且配置不一样导致的代理混乱问题
   * @type {string}
   */
  scope?: string;
  options?:
    | ExtendOptionsInit
    | ExtendOptionsWithoutResponse
    | ExtendOptionsWithResponse;
}): RequestMethod<boolean> {
  const { scope, options }= config || {};
  const proxyEvent = createProxyEvent(scope);
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
  return instance;
}