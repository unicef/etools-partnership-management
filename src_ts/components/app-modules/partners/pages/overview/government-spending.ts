import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import 'etools-content-panel/etools-content-panel.js';
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import EndpointsMixin from '../../../../endpoints/endpoints-mixin';
import {EtoolsCurrency} from 'etools-currency-amount-input/mixins/etools-currency-mixin.js';
import 'etools-info-tooltip/etools-info-tooltip.js';
import 'etools-data-table/etools-data-table.js';

import CommonMixin from '../../../../mixins/common-mixin.js';

import {pageCommonStyles} from '../../../../styles/page-common-styles';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles';
import { SharedStyles } from '../../../../styles/shared-styles';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin CommonMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin EtoolsCurrency
 */
const GovernmentSpendingMixins = EtoolsMixinFactory.combineMixins([
  CommonMixin, EndpointsMixin, EtoolsCurrency
], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin PartnerOverviewRequiredMixins
 */
class GovernmentSpending extends GovernmentSpendingMixins {

  static get template() {

    return html`
        ${pageCommonStyles} ${gridLayoutStyles} ${SharedStyles}
      <style include="data-table-styles">
        :host {
          width: 100%;
        }
  
        .bottom-row {
          background-color: var(--medium-theme-background-color);
        }
  
        .row-h {
          margin-top: 0;
          border-top: 1px solid var(--dark-divider-color);
        }
      
      </style>
      
      <template is="dom-if" if="[[!governmentSpendingData.length]]">
        <div class="row-h">
          <p>There is no government spending data available.</p>
        </div>
      </template>
      
      
      <etools-data-table-header no-collapse label="SOME ID">
        
        <etools-data-table-column class="col-3" field="fc_no">
          FC No.
        </etools-data-table-column>
        
        <etools-data-table-column class="col-2 right-align">
          FC Currency
        </etools-data-table-column>
        
        <etools-data-table-column class="col-2 right-align">
          FC Amount
        </etools-data-table-column>
        
        <etools-data-table-column class="col-2 right-align">
          Actual Disburs.
        </etools-data-table-column>
        
        <etools-data-table-column class="col-3 right-align">
          Outstanding DCT
        </etools-data-table-column>
        
      </etools-data-table-header>
      
      <template is="dom-repeat" items="[[governmentSpendingData]]" as="spend">
        <etools-data-table-row no-collapse>
          <div slot="row-data">
            <span class="col-data col-3">[[spend.fc_no]]</span>
            <span class="col-data col-2 right-align">[[spend.fc_currency]]</span>
            <span class="col-data col-2 right-align">[[displayCurrencyAmount(spend.fc_amount, 0.00)]]</span>
            <span class="col-data col-2 right-align">[[displayCurrencyAmount(spend.act_disb, 0.00)]]</span>
            <span class="col-data col-3 right-align">[[spend.outstand_dct]]</span>
          </div>
        </etools-data-table-row>
      </template>
      <div class="row-h bottom-row">
        <span class="col-data col-3 right-align"><strong> TOTAL of FCs </strong></span>
        <span class="col-data col-2"></span>
        <span class="col-data col-2 right-align"> [[displayCurrencyAmount(41533, 0.00)]] </span>
        <span class="col-data col-2 right-align"> [[displayCurrencyAmount(5547, 0.00)]] </span>
        <span class="col-data col-3 right-align"> [[displayCurrencyAmount(100, 0.00)]] </span>
      </div>
    
    `;
  }

  static get properties() {
    return {
      governmentSpendingData: Array,
      governmentSpendingEndpoint: String
    };
  }

  ready() {
    super.ready();
    this.set('governmentSpendingEndpoint', this.getEndpoint('governmentSpending'));
    const data = [
      {
        id: '122/A6/333/4',
        fc_no: 155163541325,
        fc_currency: 'LBP',
        fc_amount: 22122,
        act_disb: 222122,
        outstand_dct: 0
      },
      {
        id: '122/A6/333/4',
        fc_no: 225165441325,
        fc_currency: 'LBP',
        fc_amount: 98547,
        act_disb: 884569,
        outstand_dct: 22
      },
      {
        id: '122/A6/333/4',
        fc_no: 5478936554,
        fc_currency: 'LBP',
        fc_amount: 77847,
        act_disb: 551469,
        outstand_dct: 84
      }

    ];

    this.set('governmentSpendingData', data);
  }

  // _requestGovernmentSpendingData() {
  //   // this.set('loading', true);
  //   this.sendRequest({
  //     method: 'GET',
  //     endpoint: this.getEndpoint('governmentSpending')
  //   }).then((resp) => {
  //     // this.set('loading', false);
  //     this.set('governmentSpendingData', resp);
  //   }).catch((error) => {
  //     // this.parseRequestErrorsAndShowAsToastMsgs(error);
  //     // this.set('loading', false);
  //   });
  // }



}

window.customElements.define('government-spending', GovernmentSpending);


