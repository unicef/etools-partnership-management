import {GenericObject, LabelAndValue} from '@unicef-polymer/etools-types';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import difference from 'lodash-es/difference';
import {formatDate} from './date-utils';
import {appLanguages} from '../../config/app-constants';
import {getTranslatedValue} from '@unicef-polymer/etools-modules-common/dist/utils/utils';

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
export const objectsAreTheSame = (obj1: any, obj2: any) => {
  if (obj1 === obj2) {
    return true;
  }
  if (!obj1 && !obj2) {
    return true;
  }
  const props1: GenericObject = obj1 ? Object.keys(obj1) : {};
  const props2: GenericObject = obj2 ? Object.keys(obj2) : {};

  if (props1.length !== props2.length) {
    return false;
  }
  if (props1.length === 0) {
    return true;
  }

  let areDiff = false;
  props1.forEach((p: string) => {
    if (obj1[p] !== obj2[p]) {
      areDiff = true;
    }
  });
  return !areDiff;
};

export function arraysAreEqual(array1: [], array2: []) {
  let differencesArray = [];
  if ((!array1 && array2 && array2.length) || (!array2 && array1 && array1.length)) {
    return false;
  }
  if (array1.length > array2.length) {
    differencesArray = difference(array1, array2);
  } else {
    differencesArray = difference(array2, array1);
  }
  return isEmptyObject(differencesArray);
}

let unique = 1;
export function getUniqueId() {
  return `id-${unique++}`;
}

/**
 * Cases that should return `true` also
 * 1 should equal '1'
 * [1] should equal ['1']
 * {any: 1} should equal {any: '1'}
 */
export const areEqual = (obj1: any, obj2: any): boolean => {
  if (!obj1 && !obj2) {
    return true;
  }
  if ((!obj1 && obj2) || (obj1 && !obj2)) {
    return false;
  }

  if (obj1 instanceof Date) {
    return formatDate(obj1, 'YYYY-MM-DD') === _formatYYYY_MM_DD(obj2);
  }

  if (obj2 instanceof Date) {
    return formatDate(obj2, 'YYYY-MM-DD') === _formatYYYY_MM_DD(obj1);
  }

  if (typeof obj1 === 'number' || typeof obj2 === 'number') {
    return String(obj1) === String(obj2);
  }
  if (typeof obj1 === 'string') {
    return obj1 === obj2;
  }
  if (Array.isArray(obj1)) {
    return obj1.length === obj2.length && obj1.every((o: any, i: number) => areEqual(o, obj2[i]));
  }
  if (typeof obj1 === 'object') {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    return keys1.length === keys2.length && keys1.every((key: string) => areEqual(obj1[key], obj2[key]));
  }
  if (obj1 !== obj2) {
    return false;
  }
  return true;
};

export const stopGlobalLoading = (el: any, source: string) => {
  fireEvent(el, 'global-loading', {
    active: false,
    loadingSource: source
  });
};

function _formatYYYY_MM_DD(obj2: string | Date) {
  if (typeof obj2 === 'string') {
    return obj2;
  }
  return formatDate(obj2, 'YYYY-MM-DD');
}

export const languageIsAvailableInApp = (lngCode: string) => {
  return appLanguages.some((lng) => lng.value === lngCode);
};

export function translateLabelAndValueArray(arrData: LabelAndValue[], keyPrefix: string): LabelAndValue[] {
  const arrTranslated: LabelAndValue[] = [];
  arrData.forEach((x) => arrTranslated.push({value: x.value, label: getTranslatedValue(x.label, keyPrefix)}));
  return arrTranslated;
}
