import { jsonStringify, parseQuery } from '../utils';
import { requestEvent } from './event';
import type { RequestInitType } from './type';

export function request<T>({ url, params = {}, data, method, ...others }: RequestInitType) {
  const urlWithQuery = parseQuery(params, url);
  return fetch(urlWithQuery, {
    body: jsonStringify(data),
    method,
    ...others,
  }).then((r) => <T>(<unknown>r?.json()));
}

export function initBackgroundRequest() {
  requestEvent.on('request', async (reqeustInit: RequestInitType) => {
    try {
      const res = await request(reqeustInit);
      return { success: true, data: res, message: 'success' };
    } catch (error) {
      return { success: false, data: error, message: 'error' };
    }
  });
}