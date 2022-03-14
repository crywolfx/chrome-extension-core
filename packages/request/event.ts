import type { RequestInitType } from './type';
import { Event } from '../event';

type EventInfo = {
  request: RequestInitType;
};

export const requestEvent = new Event<EventInfo>('__chrome__event__request__');
