import { ChromeEvent } from '../event';
import { RequestOptionsInit } from './direct';

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