import '../mixins/disaggregations';
import '../disaggregation-table-row';
import { PolymerElement, html } from '@polymer/polymer';
import DisaggregationsMixin from '../mixins/disaggregations';
import UtilsMixin from '../../../../../../../mixins/utils-mixin';
import { disaggregationTableStyles } from '../styles/disaggregation-table-styles';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin DisaggregationsMixin
 */
class TwoDisaggregations extends (UtilsMixin(DisaggregationsMixin(PolymerElement)) as any) {

  static get is() {
    return 'two-disaggregations';
  }

  static get template() {
    return html`
     ${disaggregationTableStyles}

      <tr class='horizontal layout headerRow'>
        <th></th>

        <template is="dom-repeat"
                  items="[[columns]]"
                  as="column">
          <th>[[_capitalizeFirstLetter(column.value)]]</th>
        </template>

        <th>Total</th>
      </tr>

      <template
          is="dom-repeat"
          items="[[rowsForDisplay]]"
          as="row">
        <disaggregation-table-row
            data="[[row]]"
            indicator-type="[[data.display_type]]"
            row-type="middleRow">
        </disaggregation-table-row>
      </template>

      <disaggregation-table-row
          data="[[totalsForDisplay]]"
          indicator-type="[[data.display_type]]"
          row-type="totalsRow">
      </disaggregation-table-row>
    `;
  }

  static get properties() {
    return {
      data: Object,
      mapping: Array,
      columns: {
        type: Array,
        computed: '_getColumns(mapping)'
      },
      rows: {
        type: Array,
        computed: '_getRows(mapping)'
      },
      totalsForDisplay: {
        type: Object,
        computed: '_determineTotals(columns, data)'
      },
      rowsForDisplay: {
        type: Object,
        computed: '_determineRowsForDisplay(columns, rows, data)'
      }
    };
  }

  _getColumns(mapping: any) {
    if (typeof mapping === 'undefined') {
      return;
    }
    return (mapping[0] || []).choices;
  }

  _getRows(mapping: any) {
    if (typeof mapping === 'undefined') {
      return;
    }
    return (mapping[1] || []).choices;
  }

  _determineRowsForDisplay(columns: any[], rows: any[]) {
    if (typeof columns === 'undefined' || typeof rows === 'undefined') {
      return;
    }
    return this._determineRows(this, rows, columns);
  }

  _determineTotals(columns: any[], data: any) {
    if (typeof columns === 'undefined' || typeof data === 'undefined') {
      return;
    }
    let columnData = columns.map((z) => {
      let formatted = this._formatDisaggregationIds([z.id]);

      return {
        key: formatted,
        data: data.disaggregation[formatted]
      };
    });

    return {
      title: 'total',
      data: columnData,
      total: {
        key: '', // unused,
        data: data.disaggregation['()']
      }
    };
  }

}

window.customElements.define(TwoDisaggregations.is, TwoDisaggregations);
