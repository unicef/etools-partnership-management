
import { PolymerElement, html } from '@polymer/polymer';
import '../disaggregation-table-row.js';
import DisaggregationsMixin from '../mixins/disaggregations.js';
import { disaggregationTableStyles } from '../styles/disaggregation-table-styles.js';


/**
 * @polymer
 * @customElement
 * @appliesMixin DisaggregationsMixin
 */
class OneDisaggregation extends DisaggregationsMixin(PolymerElement) {

  static get is() {
    return 'one-disaggregation';
  }

  static get template() {
    return html`
      ${disaggregationTableStyles}
      <style>
        :host {}
      </style>

      <tr class='horizontal layout headerRow'>
        <th></th>
        <th>Total</th>
      </tr>

      <template is="dom-repeat"
                items="[[rows]]"
                as="row">
        <disaggregation-table-row
            data="[[row]]"
            indicator-type="[[data.display_type]]"
            row-type="middleRow">
        </disaggregation-table-row>
      </template>

      <disaggregation-table-row
          data="[[totalRow]]"
          indicator-type="[[data.display_type]]"
          row-type="totalsRow">
      </disaggregation-table-row>
    `;
  }

  static get properties() {
    return {
      data: Object,
      mapping: Array,
      totalRow: {
        type: Array,
        computed: '_determineTotalRow(data)'
      },
      columns: {
        type: Array,
        computed: '_getColumns(mapping)'
      },
      rows: {
        type: Array,
        computed: '_determineRows(columns, data)'
      }
    };
  }

  _getColumns(mapping: any) {
    if (typeof mapping === 'undefined') {
      return;
    }
    return (mapping[0] || []).choices;
  }

  _determineTotalRow(data: any) {
    if (typeof data === 'undefined') {
      return;
    }
    return {
      title: 'total',
      total: {
        key: '', // unused
        data: data.disaggregation['()']
      }
    };
  }

  _determineRows(columns: any, data: any) {
    if (typeof columns === 'undefined' || typeof data === 'undefined') {
      return;
    }
    return columns.map(function(z) {
      let formatted = this._formatDisaggregationIds([z.id]);

      return {
        title: z.value,
        data: [{
          key: formatted,
          data: data.disaggregation[formatted]
        }]
      };
    }, this);
  }

}

window.customElements.define(OneDisaggregation.is, OneDisaggregation);
