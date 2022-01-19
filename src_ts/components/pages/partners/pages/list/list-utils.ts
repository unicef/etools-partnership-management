import {Callback} from '@unicef-polymer/etools-types';

export function debounce(fn: Callback, time: number): Callback {
  let timeout: any;

  return (...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), time);
  };
}
