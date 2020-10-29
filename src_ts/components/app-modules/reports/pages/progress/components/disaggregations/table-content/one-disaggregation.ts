import {PolymerElement, html} from '@polymer/polymer';
import '../disaggregation-table-row';
import DisaggregationsMixin from '../mixins/disaggregations';
import {disaggregationTableStyles} from '../styles/disaggregation-table-styles';
import {property} from '@polymer/decorators';
import {GenericObject} from '@unicef-polymer/etools-types';

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
        :host {
        }
      </style>

      <tr class="horizontal layout headerRow">
        <th></th>
        <th>Total</th>
      </tr>

      <template is="dom-repeat" items="[[rows]]" as="row">
        <disaggregation-table-row data="[[row]]" indicator-type="[[data.display_type]]" row-type="middleRow">
        </disaggregation-table-row>
      </template>

      <disaggregation-table-row data="[[totalRow]]" indicator-type="[[data.display_type]]" row-type="totalsRow">
      </disaggregation-table-row>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Array})
  mapping!: any[];

  @property({type: Array, computed: '_determineTotalRow(data)'})
  totalRow!: any[];

  @property({type: Array, computed: '_getColumns(mapping)'})
  columns!: any[];

  @property({type: Array, computed: '_determineRows(columns, data)'})
  rows!: any[];

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
    return columns.map((z: any) => {
      const formatted = this._formatDisaggregationIds([z.id]);

      return {
        title: z.value,
        data: [
          {
            key: formatted,
            data: data.disaggregation[formatted]
          }
        ]
      };
    });
  }
}

window.customElements.define(OneDisaggregation.is, OneDisaggregation);
