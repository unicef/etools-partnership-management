import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import './disaggregation-field.js';
import {appGridStyles} from './styles/app-grid-styles';
import {disaggregationTableStyles} from './styles/disaggregation-table-styles';
import {GenericObject} from '@unicef-polymer/etools-types';
import {formatNumber, toPercentage} from '@unicef-polymer/etools-utils/dist/general.util.js';

/**
 * @LitElement
 * @customElement
 */
@customElement('disaggregation-table-cell-percentage')
export class DisaggregationTableCellPercentage extends LitElement {
  render() {
    return html`
      ${appGridStyles} ${disaggregationTableStyles}
      <style>
        :host {
          display: block;

          --app-grid-columns: 2;
          --app-grid-gutter: 0px;
          --app-grid-item-height: auto;
          --app-grid-expandible-item-columns: 2;
        }

        .item,
        .computed-value {
          box-sizing: border-box;
          min-height: 25px;
          line-height: 25px;
        }

        .item {
          padding: 0;
          border-bottom: 1px solid white;
        }

        .item:not(:first-child) {
          border-inline-start: 1px solid white;
        }

        .computed-value {
          color: var(--secondary-text-color);
        }
      </style>
      <div class="app-grid">
        <div class="item">
          <span>${formatNumber(this.data?.v, '-', 0, ',')}</span>
        </div>
        <div class="item">
          <span>${formatNumber(this.data?.d, '-', 0, ',')}</span>
        </div>
        <div class="computed-value app-grid-expandible-item">${toPercentage(this.data?.c)}</div>
      </div>
    `;
  }

  @property({type: Object})
  data!: GenericObject;
}
