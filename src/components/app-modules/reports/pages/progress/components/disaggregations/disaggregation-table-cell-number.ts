
import { PolymerElement, html } from '@polymer/polymer';
import './disaggregation-field.js';
import UtilsMixin from '../../../../../../mixins/utils-mixin.js';


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
      <style include="disaggregation-table-styles">
        :host {
          display: block;
        }
      </style>
      <span class="cellValue">[[_formatNumber(data.v, '-', 0, '\,')]]</span>
    `;
  }

  static get properties() {
    return {
      data: Object
    };
  }

}
window.customElements.define(DisaggregationTableCellNumber.is, DisaggregationTableCellNumber);

