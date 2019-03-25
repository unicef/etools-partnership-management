import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin';
import {logError} from "etools-behaviors/etools-logging";

/**
 * @polymer
 * @mixinFunction
 */
const ArrayHelperMixin = dedupingMixin((baseClass: any) =>
    // @ts-ignore
    class extends (baseClass as any) {

      /**
       * Compare arrays.
       * base array can be an array of values or an array of objects (if objects use basePropertyToVerify for matches)
       */
      getArraysDiff(base: any[], valuesToVerify: any[], basePropertyToVerify: string) {
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
              return this.getArrayFromObjsProp(base, basePropertyToVerify);
            }
            return base;
          }

          let diffVals: any[] = [];
          let valuesToCheck = JSON.parse(JSON.stringify(valuesToVerify));
          base.forEach(function(arrayVal) {
            let valToSearch = basePropertyToVerify ? arrayVal[basePropertyToVerify] : arrayVal;
            let searchedIdx = valuesToCheck.indexOf(valToSearch);
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
          logError('ArrayHelperMixin.compareArrays error occurred', 'array-helper-mixin',err);
        }
        return [];
      }

      /**
       * get an array of objects and return an array a property values
       */
      getArrayFromObjsProp(arr: any[], prop: string) {
        if (arr.length === 0) {
          return [];
        }
        return arr.map(function(a) {
          return a[prop];
        });
      }

    });

export default ArrayHelperMixin;
