import {PolymerElement, html} from '@polymer/polymer';
import './disaggregation-field.js';
import UtilsMixin from '../../../../../../mixins/utils-mixin.js';
import {disaggregationTableStyles} from './styles/disaggregation-table-styles';
import {property} from '@polymer/decorators';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableCellNumber extends UtilsMixin(PolymerElement) {
  static get is() {
    return 'disaggregation-table-cell-number';
  }

  static get template() {
    return html`
      ${disaggregationTableStyles}
      <style>
        :host {
          display: block;
        }
      </style>
      <span class="cellValue">[[_formatNumber(data.v, '-', 0, ',')]]</span>
    `;
  }

  @property({type: Object})
  data!: GenericObject;
}
window.customElements.define(DisaggregationTableCellNumber.is, DisaggregationTableCellNumber);
