import { requestEvent } from './event';
import type { GetInit, RequestInitType } from './type';

export function createService({ baseUrl }: { baseUrl?: string } = {}) {
  function request<T>(data: RequestInitType) {
    // TODO 完善
    data.url = (baseUrl || '') + data.url;
    return requestEvent.emit('request', data).then((res) => {
      if (res?.success) return res.data as T;
      return Promise.reject(res?.data);
    });
  }

  function get<T>(getInitValue: GetInit) {
    return request<T>({ ...getInitValue, method: 'GET' });
  }

  function post<T>(postInitValue: Request) {
    const headers = {
      'Content-Type': 'application/json;charset=utf-8',
      ...(postInitValue.headers || {}),
    };
    return request<T>({ ...postInitValue, headers, method: 'POST' });
  }

  return { request, get, post };
}

