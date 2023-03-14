import {html, LitElement, property, customElement} from 'lit-element';
import './disaggregation-field.js';
import UtilsMixin from '../../../../../../common/mixins/utils-mixin.js';
import {disaggregationTableStyles} from './styles/disaggregation-table-styles';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
@customElement('disaggregation-table-cell-number')
export class DisaggregationTableCellNumber extends UtilsMixin(LitElement) {
  render() {
    return html`
      ${disaggregationTableStyles}
      <style>
        :host {
          display: block;
        }
      </style>
      <span class="cellValue">${this._formatNumber(this.data?.v, '-', 0, ',')}</span>
    `;
  }

  @property({type: Object})
  data!: GenericObject;
}
