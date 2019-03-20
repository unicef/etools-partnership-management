import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout.js';

import {EtoolsMixinFactory} from 'etools-behaviors/etools-mixin-factory.js';
import {EtoolsCurrency} from 'etools-currency-amount-input/mixins/etools-currency-mixin.js';
import 'etools-data-table/etools-data-table.js';
import 'etools-loading/etools-loading.js';
import EndpointsMixin from '../../../../endpoints/endpoints-mixin';
import CommonMixin from '../../../../mixins/common-mixin';
import AjaxErrorsParserMixin from "../../../../mixins/ajax-errors-parser-mixin";

import {pageCommonStyles} from '../../../../styles/page-common-styles';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles';
import {SharedStyles} from '../../../../styles/shared-styles';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin CommonMixin
 * @appliesMixin EndpointsMixin
 * @appliesMixin EtoolsCurrency
 * @appliesMixin AjaxErrorsParserMixin
 */
const GovernmentSpendingMixins = EtoolsMixinFactory.combineMixins([
  CommonMixin, EndpointsMixin, EtoolsCurrency, AjaxErrorsParserMixin
], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin PartnerOverviewRequiredMixins
 */
class GovernmentSpending extends GovernmentSpendingMixins {

  static get template() {
    // language=HTML
    return html`
      ${pageCommonStyles} ${gridLayoutStyles} ${SharedStyles}
      <style include="data-table-styles">
        :host {
          width: 100%;
        }
        
        #totals {
          --list-row-wrapper-padding: 0 24px;
          --list-bg-color: var(--medium-theme-background-color);
        }
        
      </style>
      
      <etools-loading loading-text="Loading..."
                      active$="[[showLoading]]"></etools-loading>
      
      <template is="dom-if" if="[[!_hasData(governmentSpendingData.length)]]">
        <div class="row-h">
          <p>There is no government spending data available.</p>
        </div>
      </template>
      
      <template is="dom-if" if="[[_hasData(governmentSpendingData.length)]]">
        <etools-data-table-header no-collapse label="SOME ID">
          <etools-data-table-column class="col-3" field="fc_no">FC No.</etools-data-table-column>
          <etools-data-table-column class="col-2 right-align">FC Currency</etools-data-table-column>
          <etools-data-table-column class="col-2 right-align">FC Amount</etools-data-table-column>
          <etools-data-table-column class="col-2 right-align">Actual Disburs.</etools-data-table-column>
          <etools-data-table-column class="col-3 right-align">Outstanding DCT</etools-data-table-column>
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
        <etools-data-table-row no-collapse id="totals">
          <div slot="row-data">
            <span class="col-data col-3 right-align"><strong> TOTAL of FCs </strong></span>
            <span class="col-data col-2"></span>
            <span class="col-data col-2 right-align"> [[displayCurrencyAmount(41533, 0.00)]] </span>
            <span class="col-data col-2 right-align"> [[displayCurrencyAmount(5547, 0.00)]] </span>
            <span class="col-data col-3 right-align"> [[displayCurrencyAmount(100, 0.00)]] </span>
          </div>
        </etools-data-table-row>
      </template>
    `;
  }

  static get properties() {
    return {
      partnerId: {
        type: Number,
        observer: '_partnerIdChanged'
      },
      governmentSpendingData: Array,
      showLoading: Boolean
    };
  }

  public showLoading: boolean = false;

  ready() {
    super.ready();
    // TODO: remove this
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

  // @ts-ignore
  private _partnerIdChanged(id: number | null | undefined) {
    if (!id) {
      return
    }
    this.set('governmentSpendingData', []);
    this._requestGovernmentSpendingData(id);
  }

  private _requestGovernmentSpendingData(id: number) {
    this.showLoading = true;
    this.sendRequest({
      method: 'GET',
      endpoint: this.getEndpoint('governmentSpending', {id: id})
    }).then((resp: any) => {
      this.set('governmentSpendingData', resp);
    }).catch((error: any) => {
      this.parseRequestErrorsAndShowAsToastMsgs(error);
    }).then(() => {
      this.showLoading = false;
    });
  }

  // @ts-ignore
  private _hasData(l: number) {
    return l > 0;
  }


}

window.customElements.define('government-spending', GovernmentSpending);


