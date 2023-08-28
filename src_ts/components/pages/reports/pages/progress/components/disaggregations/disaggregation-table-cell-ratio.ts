import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {appGridStyles} from './styles/app-grid-styles';
import './disaggregation-field.js';
import UtilsMixin from '../../../../../../common/mixins/utils-mixin.js';
import {disaggregationTableStyles} from './styles/disaggregation-table-styles';
import {GenericObject} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
@customElement('disaggregation-table-cell-ratio')
export class DisaggregationTableCellRatio extends UtilsMixin(LitElement) {
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
          @apply --app-grid-expandible-item;

          color: var(--secondary-text-color);
        }
      </style>

      <div class="app-grid">
        <div class="item">
          <span>${this._formatNumber(this.data?.v, '-', 0, ',')}</span>
        </div>
        <div class="item">
          <span>${this._formatNumber(this.data?.d, '-', 0, ',')}</span>
        </div>
        <div class="computed-value">
          <span>${this._formatNumber(this.data?.v, '-', 0, ',')}</span>
          /
          <span>${this._formatNumber(this.data?.d, '-', 0, ',')}</span>
        </div>
      </div>
    `;
  }

  @property({type: Object})
  data!: GenericObject;
}
