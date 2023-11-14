import { ChromeEvent } from '../core/event';
import { RequestOptionsInit } from 'umi-request';

export type Event = {
  request: RequestOptionsInit & {
    url: string;
  }; 
};

export type EventRes = {
  request: any
};


const proxyEvent = new ChromeEvent<Event, EventRes>('proxy-request');

export default proxyEvent;