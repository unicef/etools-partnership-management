import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import './disaggregation-table-cell-number.js';
import './disaggregation-table-cell-percentage.js';
import './disaggregation-table-cell-ratio.js';
import {disaggregationTableStyles} from './styles/disaggregation-table-styles';
import {appGridStyles} from './styles/app-grid-styles';
import {GenericObject} from '@unicef-polymer/etools-types';
import {capitalizeFirstLetter} from '@unicef-polymer/etools-utils/dist/general.util.js';

/**
 * @LitElement
 * @customElement
 */
@customElement('disaggregation-table-row')
export class DisaggregationTableRow extends LitElement {
  render() {
    return html`
      ${appGridStyles} ${disaggregationTableStyles}

      <tr class="${this._computeClass(this.rowType)}">
        <td class="cellTitle">
          <span class="cellValue">${capitalizeFirstLetter(this.data?.title)}</span>
        </td>

        ${(this.data?.data || []).map(
          (item: any) => html`
            <td>
              ${this.indicatorType === 'number'
                ? html`<disaggregation-table-cell-number .data="${item.data}"></disaggregation-table-cell-number>`
                : ''}
              ${this.indicatorType === 'percentage'
                ? html`<disaggregation-table-cell-percentage
                    .data="${item.data}"
                  ></disaggregation-table-cell-percentage>`
                : ''}
              ${this.indicatorType === 'ratio'
                ? html`<disaggregation-table-cell-ratio .data="${item.data}"></disaggregation-table-cell-ratio>`
                : ''}
            </td>
          `
        )}
        ${this.data?.total
          ? html` <td class="cellTotal">
              ${this.indicatorType === 'number'
                ? html`<disaggregation-table-cell-number
                    .data="${this.data.total.data}"
                  ></disaggregation-table-cell-number>`
                : ''}
              ${this.indicatorType === 'percentage'
                ? html`<disaggregation-table-cell-percentage
                    .data="${this.data.total.data}"
                  ></disaggregation-table-cell-percentage>`
                : ''}
              ${this.indicatorType === 'ratio'
                ? html`<disaggregation-table-cell-ratio
                    .data="${this.data.total.data}"
                  ></disaggregation-table-cell-ratio>`
                : ''}
            </td>`
          : ''}
      </tr>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

  @property({type: String, reflect: true, attribute: 'indicator-type'})
  indicatorType!: string;

  @property({type: String, reflect: true, attribute: 'row-type'})
  rowType!: string;

  _computeClass(rowType: string) {
    return rowType;
  }
}
