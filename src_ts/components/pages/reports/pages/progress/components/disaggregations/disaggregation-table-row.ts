import {html, LitElement, property, customElement} from 'lit-element';
import './disaggregation-table-cell-number.js';
import './disaggregation-table-cell-percentage.js';
import './disaggregation-table-cell-ratio.js';
import '../../../../../../common/mixins/utils-mixin.js';
import {disaggregationTableStyles} from './styles/disaggregation-table-styles';
import {appGridStyles} from './styles/app-grid-styles';
import UtilsMixin from '../../../../../../common/mixins/utils-mixin.js';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
@customElement('disaggregation-table-row')
export class DisaggregationTableRow extends UtilsMixin(LitElement) {
  render() {
    return html`
      ${appGridStyles} ${disaggregationTableStyles}

      <tr class="${this._computeClass(this.rowType)}">
        <td class="cellTitle">
          <span class="cellValue">${this._capitalizeFirstLetter(this.data?.title)}</span>
        </td>

        ${(this.data?.data || []).map(
          (item: any) => html`
            <td>
              ${this._equals(this.indicatorType, 'number')
                ? html`<disaggregation-table-cell-number .data="${item.data}"></disaggregation-table-cell-number>`
                : ''}
              ${this._equals(this.indicatorType, 'percentage')
                ? html`<disaggregation-table-cell-percentage
                    .data="${item.data}"
                  ></disaggregation-table-cell-percentage>`
                : ''}
              ${this._equals(this.indicatorType, 'ratio')
                ? html`<disaggregation-table-cell-ratio .data="${item.data}"></disaggregation-table-cell-ratio>`
                : ''}
            </td>
          `
        )}
        ${this.data?.total
          ? html` <td class="cellTotal">
              ${this._equals(this.indicatorType, 'number')
                ? html`<disaggregation-table-cell-number
                    .data="${this.data.total.data}"
                  ></disaggregation-table-cell-number>`
                : ''}
              ${this._equals(this.indicatorType, 'percentage')
                ? html`<disaggregation-table-cell-percentage
                    .data="${this.data.total.data}"
                  ></disaggregation-table-cell-percentage>`
                : ''}
              ${this._equals(this.indicatorType, 'ratio')
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
