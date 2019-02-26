import '../disaggregation-table-row.js';
import { PolymerElement, html } from '@polymer/polymer';
import UtilsMixin from '../../../../../../../mixins/utils-mixin.js';
import DisaggregationsMixin from '../mixins/disaggregations.js';
import { disaggregationTableStyles } from '../styles/disaggregation-table-styles.js';



/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin DisaggregationsMixin
 */
class ThreeDisaggregations extends UtilsMixin(DisaggregationsMixin(PolymerElement)) {

  static get is() {
    return 'three-disaggregations';
  }

  static get template() {
    return html`
    ${disaggregationTableStyles}
      <!-- Column names -->
      <tr class="horizontal layout headerRow">
        <th></th>
        <template is="dom-repeat"
                  items="[[columns]]"
                  as="column">
          <th>[[_capitalizeFirstLetter(column.value)]]</th>
        </template>
        <th>Total</th>
      </tr>

      <!-- Data rows: outer and middle. -->
      <template is="dom-repeat"
                items="[[outerRowsForDisplay]]"
                as="outerRow">
        <disaggregation-table-row
            data="[[outerRow]]"
            indicator-type="[[data.display_type]]"
            row-type="outerRow">
        </disaggregation-table-row>

        <template
            is="dom-repeat"
            items="[[_determineMiddleRows(outerRow.id, columns, middleRows, data)]]"
            as="middleRow">
          <disaggregation-table-row
              data="[[middleRow]]"
              indicator-type="[[data.display_type]]"
              row-type="middleRow">
          </disaggregation-table-row>
        </template>

      </template>

      <!-- Totals row -->
      <disaggregation-table-row
          data="[[columnTotalRow]]"
          indicator-type="[[data.display_type]]"
          row-type="totalsRow">
      </disaggregation-table-row>

      <!-- Bottom table -->
      <template is="dom-repeat"
                items="[[bottomRows]]"
                as="bottomRow">
        <disaggregation-table-row
            data="[[bottomRow]]"
            indicator-type="[[data.display_type]]"
            row-type="bottomRow">
        </disaggregation-table-row>
      </template>

    `;
  }

  static get properties() {
    return {
      data: Object,
      mapping: Array,
      columnTotalRow: Object,
      columns: {
        type: Array,
        computed: '_getColumns(mapping)'
      },
      rows: {
        type: Array,
        computed: '_getRows(mapping)'
      },
      bottomRows: Array,
      middleRows: {
        type: Array,
        computed: '_getMiddleRows(mapping)'
      },
      outerRowsForDisplay: {
        type: Array,
        computed: '_determineOuterRows(columns, rows, data)'
      }
    };
  }

  static get observers() {
    return ['_determineTotals(columns, middleRows, data)'];
  }

  _getColumns(mapping) {
    if (typeof mapping === 'undefined') {
      return;
    }
    return (mapping[0] || []).choices;
  }

  _getRows(mapping) {
    if (typeof mapping === 'undefined') {
      return;
    }
    return (mapping[1] || []).choices;
  }

  _getMiddleRows(mapping) {
    if (!mapping) {
      return;
    }
    return (mapping[2] || []).choices;
  }

  _determineOuterRows(columns, rows) {
    if (typeof columns === 'undefined' || typeof rows === 'undefined') {
      return;
    }
    return this._determineRows(this, rows, columns);
  }

  _determineMiddleRows(outerRowID, columns, middleRows, data) {
    if (!columns || !middleRows) {
      return [];
    }

    return middleRows.map(function(y) {
      let formatted;

      let columnData = columns.map(function(z) {
        formatted = this._formatDisaggregationIds([outerRowID, y.id, z.id]);

        return {
          key: formatted,
          data: data.disaggregation[formatted]
        };
      }, this);

      formatted = this._formatDisaggregationIds([outerRowID, y.id]);

      return {
        title: y.value,
        data: columnData,
        id: y.id,
        total: {
          key: formatted,
          data: data.disaggregation[formatted]
        }
      };
    }, this);
  }

  _determineTotals(columns, middleRows, data) {
    if (typeof columns === 'undefined' || typeof middleRows === 'undefined' || typeof data === 'undefined') {
      return;
    }
    let columnData = columns.map(function(z) {
      let formatted = this._formatDisaggregationIds([z.id]);

      return {
        key: formatted,
        data: data.disaggregation[formatted]
      };
    }, this);

    let columnTotalRow = {
      title: 'total',
      data: columnData,
      total: {
        key: '', // unused
        data: data.disaggregation['()']
      }
    };

    this.set('columnTotalRow', columnTotalRow);
    this.set('bottomRows', this._determineRows(this, middleRows, columns));
  }

}

window.customElements.define(ThreeDisaggregations.is, ThreeDisaggregations);
