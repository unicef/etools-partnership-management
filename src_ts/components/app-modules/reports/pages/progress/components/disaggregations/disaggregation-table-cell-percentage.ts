import '@polymer/app-layout/app-grid/app-grid-style.js';

import './disaggregation-field.js';
import UtilsMixin from '../../../../../../mixins/utils-mixin.js';
import { PolymerElement, html } from '@polymer/polymer';
import { disaggregationTableStyles } from './styles/disaggregation-table-styles.js';
import { property } from '@polymer/decorators';
import { GenericObject } from '../../../../../../../typings/globals.types.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableCellPercentage extends UtilsMixin(PolymerElement) {

  static get is() {
    return 'disaggregation-table-cell-percentage';
  }
  static get template() {
    return html`
      ${disaggregationTableStyles}
      <style include="app-grid-style">
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
          border-left: 1px solid white;
        }

        .computed-value {
          @apply --app-grid-expandible-item;

          color: var(--secondary-text-color);
        }
      </style>
      <div class="app-grid">
        <div class="item">
          <span>[[_formatNumber(data.v, '-', 0, '\,')]]</span>
        </div>
        <div class="item">
          <span>[[_formatNumber(data.d, '-', 0, '\,')]]</span>
        </div>
        <div class="computed-value">[[_toPercentage(data.c)]]</div>
      </div>
    `;
  }

  @property({type: Object})
  data!: GenericObject;

}

window.customElements.define(DisaggregationTableCellPercentage.is, DisaggregationTableCellPercentage);

