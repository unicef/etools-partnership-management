import {LitElement} from 'lit-element';
import {GenericObject, Constructor} from '@unicef-polymer/etools-types';

// import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';

/**
 * Disaggregation table mixin
 * @polymer
 * @mixinFunction
 */
function DisaggregationsMixin<T extends Constructor<LitElement>>(baseClass: T) {
  class DisaggregationsClass extends baseClass {
    // Used to display rows for two and three disaggregations.
    // It will NOT work for one and zero disaggregations.
    _determineRows(self: any, rows: any, columns: any) {
      const rowsForDisplay: GenericObject[] = [];
      rows.forEach(function (x: any) {
        let formatted = '';

        const rowData = columns.map(function (z: any) {
          formatted = self._formatDisaggregationIds([x.id, z.id]);

          return {
            key: formatted,
            data: self.data.disaggregation[formatted]
          };
        });

        formatted = self._formatDisaggregationIds([x.id]);

        rowsForDisplay.push({
          title: x.value,
          data: rowData,
          id: x.id,
          total: {
            key: formatted,
            data: self.data.disaggregation[formatted]
          }
        });
      });

      return rowsForDisplay;
    }

    // Accepts a list of disaggregation IDs, sorts them, and
    // structures them in "()" format for lookup.
    _formatDisaggregationIds(unsortedIds: any) {
      // IDs must be in ascending order.
      const ids = unsortedIds.sort(function (a: number, b: number) {
        return a - b;
      });
      let sortedString = '';

      if (ids.length === 1) {
        sortedString = ids[0] + ',';
      } else {
        sortedString = ids.join(', ');
      }

      return '(' + sortedString + ')';
    }
  }
  return DisaggregationsClass;
}

export default DisaggregationsMixin;
