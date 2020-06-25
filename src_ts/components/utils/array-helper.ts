import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
/**
 * Compare arrays.
 * base array can be an array of values or an array of objects (if objects use basePropertyToVerify for matches)
 */

export function getArraysDiff(base: any[], valuesToVerify: any[], basePropertyToVerify?: string) {
  try {
    if (base instanceof Array === false || valuesToVerify instanceof Array === false) {
      // both method arguments have to be arrays
      throw new Error('Only array arguments accepted');
    }

    if (base.length === 0) {
      return valuesToVerify;
    }
    if (valuesToVerify.length === 0) {
      if (basePropertyToVerify) {
        return getArrayFromObjsProp(base, basePropertyToVerify);
      }
      return base;
    }

    let diffVals: any[] = [];
    const valuesToCheck = JSON.parse(JSON.stringify(valuesToVerify));
    base.forEach(function (arrayVal) {
      const valToSearch = basePropertyToVerify ? arrayVal[basePropertyToVerify] : arrayVal;
      const searchedIdx = valuesToCheck.indexOf(valToSearch);
      if (searchedIdx === -1) {
        diffVals.push(valToSearch);
      } else {
        valuesToCheck.splice(searchedIdx, 1);
      }
    });
    if (valuesToCheck.length) {
      // if base values were checked and there are still valuesToVerify values left unchecked
      diffVals = diffVals.concat(valuesToCheck);
    }

    return diffVals;
  } catch (err) {
    logError('ArrayHelper.getArraysDiff error occurred', 'array-helper-mixin', err);
  }
  return [];
}

/**
 * get an array of objects and return an array a property values
 */
function getArrayFromObjsProp(arr: any[], prop: string) {
  if (arr.length === 0) {
    return [];
  }
  return arr.map(function (a) {
    return a[prop];
  });
}
