import '../mixins/disaggregations';
import '../disaggregation-table-row';
import {PolymerElement, html} from '@polymer/polymer';
import DisaggregationsMixin from '../mixins/disaggregations';
import UtilsMixin from '../../../../../../../common/mixins/utils-mixin';
import {disaggregationTableStyles} from '../styles/disaggregation-table-styles';
import {property} from '@polymer/decorators';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 * @appliesMixin DisaggregationsMixin
 */
class TwoDisaggregations extends UtilsMixin(DisaggregationsMixin(PolymerElement)) {
  static get is() {
    return 'two-disaggregations';
  }

  static get template() {
    return html`
      ${disaggregationTableStyles}

      <tr class="horizontal layout headerRow">
        <th></th>

        <template is="dom-repeat" items="[[columns]]" as="column">
          <th>[[_capitalizeFirstLetter(column.value)]]</th>
        </template>

        <th>Total</th>
      </tr>

      <template is="dom-repeat" items="[[rowsForDisplay]]" as="row">
        <disaggregation-table-row data="[[row]]" indicator-type="[[data.display_type]]" row-type="middleRow">
        </disaggregation-table-row>
      </template>

      <disaggregation-table-row data="[[totalsForDisplay]]" indicator-type="[[data.display_type]]" row-type="totalsRow">
      </disaggregation-table-row>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: Array})
  mapping!: any[];

  @property({type: Array, computed: '_getColumns(mapping)'})
  columns!: any[];

  @property({type: Array, computed: '_getRows(mapping)'})
  rows!: any[];

  @property({type: Object, computed: '_determineTotals(columns, data)'})
  totalsForDisplay!: GenericObject;

  @property({
    type: Object,
    computed: '_determineRowsForDisplay(columns, rows, data)'
  })
  rowsForDisplay!: GenericObject;

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
    const columnData = columns.map((z) => {
      const formatted = this._formatDisaggregationIds([z.id]);

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
