import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';

/**
 * @polymer
 * @mixinFunction
 */
const DisaggregationFieldMixin = dedupingMixin((superClass: any) => class extends superClass {
  _toNumericValues(obj: any) {
    return Object.keys(obj).reduce(function(prev: any, curr: any) {
      prev[curr] = Number(obj[curr]);

      return prev;
    }, {});
  }
});

export default DisaggregationFieldMixin;
