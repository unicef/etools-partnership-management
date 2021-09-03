import './disaggregation-table-cell-number.js';
import './disaggregation-table-cell-percentage.js';
import './disaggregation-table-cell-ratio.js';
import '../../../../../../mixins/utils-mixin.js';
import {disaggregationTableStyles} from './styles/disaggregation-table-styles';
import {PolymerElement, html} from '@polymer/polymer';
import UtilsMixin from '../../../../../../mixins/utils-mixin.js';
import {property} from '@polymer/decorators';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableRow extends UtilsMixin(PolymerElement) {
  static get is() {
    return 'disaggregation-table-row';
  }

  static get template() {
    return html`
      ${disaggregationTableStyles}

      <tr class$="[[_computeClass(rowType)]]">
        <td class="cellTitle">
          <span class="cellValue">[[_capitalizeFirstLetter(data.title)]]</span>
        </td>

        <template is="dom-repeat" items="[[data.data]]">
          <td>
            <template is="dom-if" if="[[_equals(indicatorType, 'number')]]" restamp="true">
              <disaggregation-table-cell-number data="[[item.data]]"></disaggregation-table-cell-number>
            </template>

            <template is="dom-if" if="[[_equals(indicatorType, 'percentage')]]" restamp="true">
              <disaggregation-table-cell-percentage data="[[item.data]]"></disaggregation-table-cell-percentage>
            </template>

            <template is="dom-if" if="[[_equals(indicatorType, 'ratio')]]" restamp="true">
              <disaggregation-table-cell-ratio data="[[item.data]]"></disaggregation-table-cell-ratio>
            </template>
          </td>
        </template>

        <template is="dom-if" if="[[data.total]]">
          <td class="cellTotal">
            <template is="dom-if" if="[[_equals(indicatorType, 'number')]]" restamp="true">
              <disaggregation-table-cell-number data="[[data.total.data]]"></disaggregation-table-cell-number>
            </template>

            <template is="dom-if" if="[[_equals(indicatorType, 'percentage')]]" restamp="true">
              <disaggregation-table-cell-percentage data="[[data.total.data]]"></disaggregation-table-cell-percentage>
            </template>

            <template is="dom-if" if="[[_equals(indicatorType, 'ratio')]]" restamp="true">
              <disaggregation-table-cell-ratio data="[[data.total.data]]"></disaggregation-table-cell-ratio>
            </template>
          </td>
        </template>
      </tr>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: String})
  indicatorType!: string;

  @property({type: String})
  rowType!: string;

  _computeClass(rowType: string) {
    return rowType;
  }
}

window.customElements.define(DisaggregationTableRow.is, DisaggregationTableRow);
