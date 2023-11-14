import { serialize } from '@/utils/serialize';
import proxyEvent from './event';
import type {
  RequestOptionsInit,
  RequestOptionsWithResponse,
  RequestOptionsWithoutResponse,
  RequestResponse,
} from 'umi-request';

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

const createProxyRequest = () => {
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

const proxyRequest = createProxyRequest();

export default proxyRequest;
