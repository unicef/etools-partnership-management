import { PolymerElement, html } from '@polymer/polymer';
import { disaggregationTableStyles } from '../styles/disaggregation-table-styles';
import '../disaggregation-table-row.js';


/**
 * @polymer
 * @customElement
 */
class ZeroDisaggregations extends PolymerElement {

  static get is() {
    return 'zero-disaggregations';
  }

  static get template() {
    return html`
      ${disaggregationTableStyles}

      <disaggregation-table-row
          data="[[totalRow]]"
          indicator-type="[[data.display_type]]"
          row-type="totalsRow">
      </disaggregation-table-row>
    `;
  }

  static get properties() {
    return {
      data: Object,
      mapping: Array,
      totalRow: {
        type: Array,
        computed: '_determineTotalRow(mapping, data)'
      }
    };
  }

  _determineTotalRow(_, data) {
    if (typeof data === 'undefined') {
      return;
    }
    return {
      title: 'total',
      total: {
        key: '()',
        data: data.disaggregation['()']
      }
    };
  }

}

window.customElements.define(ZeroDisaggregations.is, ZeroDisaggregations);
