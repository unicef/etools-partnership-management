
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
    return true
  }
  return isObject(a) && Object.keys(a).length === 0;
};

export const isJsonStrMatch = (a: any, b: any) => {
  return JSON.stringify(a) === JSON.stringify(b);
};
