import { GenericObject } from '../../typings/globals.types';

export const isObject = (a: any) => {
  return a && a.constructor === Object;
};

export const isArray = (a: any) => {
  return a && a.constructor === Array;
};

export const isEmptyObject = (a: any) => {
  if (!a) {
    return true;
  }
  if (isArray(a) && a.length === 0) {
    return true;
  }
  return isObject(a) && Object.keys(a).length === 0;
};

export const isJsonStrMatch = (a: any, b: any) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const copy = (a: any) => {
  return JSON.parse(JSON.stringify(a));
};

// For simple objects, no nesting
export const objectsAreTheSame = (obj1: any, obj2: any) =>{
  if (obj1 === obj2) {
    return true;
  }
  if (!obj1 && !obj2) {
    return true;
  }
  let props1: GenericObject = obj1 ? Object.keys(obj1) : {};
  let props2: GenericObject = obj2 ? Object.keys(obj2) : {};

  if (props1.length !== props2.length) {
    return false;
  }
  if (props1.length === 0) {
    return true;
  }

  let areDiff = false;
  props1.forEach((p: string) => {
    if( obj1[p] !== obj2[p]) {
      areDiff = true;
    }
  });
  return !areDiff;
};

export const testingUtils = (value: string) => {
  return `---- ${value} ----`;
};

