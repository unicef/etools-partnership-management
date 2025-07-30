import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import './disaggregation-field.js';
import {disaggregationTableStyles} from './styles/disaggregation-table-styles';
import {GenericObject} from '@unicef-polymer/etools-types';
import {formatNumber} from '@unicef-polymer/etools-utils/dist/general.util.js';

/**
 * @LitElement
 * @customElement
 */
@customElement('disaggregation-table-cell-number')
export class DisaggregationTableCellNumber extends LitElement {
  render() {
    return html`
      ${disaggregationTableStyles}
      <style>
        :host {
          display: block;
        }
      </style>
      <span class="cellValue">${formatNumber(this.data?.v, '-', 0, ',')}</span>
    `;
  }

  @property({type: Object})
  data!: GenericObject;
}
