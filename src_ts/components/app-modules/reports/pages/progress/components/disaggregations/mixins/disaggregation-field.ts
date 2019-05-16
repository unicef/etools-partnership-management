

export function toNumericValues(obj: any) {
  return Object.keys(obj).reduce(function(prev: any, curr: any) {
    prev[curr] = Number(obj[curr]);

    return prev;
  }, {});
}


