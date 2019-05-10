import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/app-layout/app-grid/app-grid-style.js';

import './disaggregation-field.js';
import UtilsMixin from '../../../../../../mixins/utils-mixin.js';
import { disaggregationTableStyles } from './styles/disaggregation-table-styles.js';


/**
 * @polymer
 * @customElement
 * @appliesMixin UtilsMixin
 */
class DisaggregationTableCellRatio extends UtilsMixin(PolymerElement) {

  static get is() {
    return 'disaggregation-table-cell-ratio';
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
        <div class="computed-value">
          <span>[[_formatNumber(data.v, '-', 0, '\,')]]</span>
          /
          <span>[[_formatNumber(data.d, '-', 0, '\,')]]</span>
        </div>
      </div>
    `;
  }

  static get properties() {
    return {
      data: Object
    };
  }

}

window.customElements.define(DisaggregationTableCellRatio.is, DisaggregationTableCellRatio);

