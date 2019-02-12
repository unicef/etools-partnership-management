import { dedupingMixin } from '@polymer/polymer/lib/utils/mixin';


/**
 * Disaggregation table mixin
 * @polymer
 * @mixinFunction
 */
const DisaggregationsMixin = dedupingMixin(
(superClass: any) => class extends superClass {
  // Used to display rows for two and three disaggregations.
  // It will NOT work for one and zero disaggregations.
  _determineRows(self, rows, columns) {
    let rowsForDisplay = [];
    rows.forEach(function(x) {
      let formatted = '';

      let rowData = columns.map(function(z) {
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
  _formatDisaggregationIds(unsortedIds) {
    // IDs must be in ascending order.
    let ids = unsortedIds.sort(function(a, b) {
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
});

export default DisaggregationsMixin;


