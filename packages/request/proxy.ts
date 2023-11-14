import { serialize } from '@/utils/serialize';
import type {
  RequestOptionsInit,
  RequestOptionsWithResponse,
  RequestOptionsWithoutResponse,
  RequestResponse,
} from 'umi-request';
import createProxyEvent from './event';

export interface RequestMethodProxy<R = false> {
  /**
   * 发起代理请求，底层依赖umi-request, api和umi-request完全一致
   * 文档见[https://github.com/umijs/umi-request/blob/HEAD/README_zh-CN.md]
   */
  <T = any>(url: string, options: RequestOptionsWithResponse): Promise<
    RequestResponse<T>
  >;
  <T = any>(url: string, options: RequestOptionsWithoutResponse): Promise<T>;
  <T = any>(url: string, options?: RequestOptionsInit): R extends true
    ? Promise<RequestResponse<T>>
    : Promise<T>;
  get: RequestMethodProxy<R>;
  post: RequestMethodProxy<R>;
}

/**
 * 创建一个代理请求，将通过事件通信发送到background进行执行
 * @param {string} [scope] 代理请求scope, 可避免多个项目都初始化了该代理能力且配置不一样导致的代理混乱问题，需要和background配置保持一致
 * @return {*} 
 */
export const createProxyRequest = (scope?: string) => {
  const proxyEvent = createProxyEvent(scope);
  const request = async (url, config) => {
    const formatData = await serialize(config?.data);
    const res = await proxyEvent.emit('request', {
      url,
      ...config,
      data: formatData,
    });
    if (res?.success) return res?.data;
    return Promise.reject(res?.data);
  };

  request.get = (url, config) =>
    request(url, {
      ...config,
      method: 'get',
    });

  request.post = (url, config) =>
    request(url, {
      ...config,
      method: 'post',
    });
  return request as RequestMethodProxy<true | false>;
};
