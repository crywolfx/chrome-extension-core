import { ChromeEvent } from '../core/event';
import { RequestOptionsInit } from 'umi-request';

type ProxyEvent = {
  request: RequestOptionsInit & {
    url: string;
    scope?: string;
  };
};

type ProxyEventRes = {
  request: any;
};

const createProxyEvent = (scope = 'proxy-request') =>
  new ChromeEvent<ProxyEvent, ProxyEventRes>(scope);

export default createProxyEvent;
