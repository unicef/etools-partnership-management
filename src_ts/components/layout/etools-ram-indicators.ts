import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-label/iron-label';
import 'etools-loading/etools-loading.js';
import {EtoolsMixinFactory} from 'etools-behaviors/etools-mixin-factory';
import {logError} from 'etools-behaviors/etools-logging.js';
import EndpointsMixin from '../endpoints/endpoints-mixin';
import { Debouncer } from '@polymer/polymer/lib/utils/debounce';
import { timeOut } from '@polymer/polymer/lib/utils/async';
import {parseRequestErrorsAndShowAsToastMsgs} from '../utils/ajax-errors-parser.js';

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
const EtoolsRamIndicatorsMixins = EtoolsMixinFactory.combineMixins([
  EndpointsMixin,
], PolymerElement);


/**
 * @polymer
 * @customElement
 * @appliesMixin EtoolsRamIndicatorsMixins
 */
class EtoolsRamIndicators extends EtoolsRamIndicatorsMixins {
  static get is() {
    return 'etools-ram-indicators';
  }

  static get template() {
    return html`
      <style>
        :host {
          position: relative;
          background-color: var(--light-theme-background-color);
        }

        *[hidden] {
          display: none !important;
        }

        #label,
        #no-ram-indicators {
          color: var(--secondary-text-color, #737373);
        }

        #ram-indicators-list {
          margin: 0;
          padding-left: 24px;
          list-style: circle;
        }

      </style>

      <etools-loading active="[[loading]]">Loading...</etools-loading>

      <iron-label>
        <span id="label">RAM Indicators</span>
        <div id="ram-indicators" iron-label-target>
          <template is="dom-if" if="[[_noRamIndicators(ramIndicators.length)]]">
            <span id="no-ram-indicators">&#8212;</span>
          </template>
          <template is="dom-if" if="[[!_noRamIndicators(ramIndicators.length)]]">
            <ul id="ram-indicators-list">
              <template is="dom-repeat" items="[[ramIndicators]]" as="ramIndName">
                <li>[[ramIndName]]</li>
              </template>
            </ul>
          </template>
        </div>
      </iron-label>
    `;
  }

  static get properties() {
    return {
      interventionId: {
        type: Number
      },
      cpId: {
        type: Number
      },
      ramIndicators: {
        type: Array,
        value: []
      },
      loading: {
        type: Boolean,
        value: false
      }
    };
  }

  static get observers() {
    return [
      '_getRamIndicatorsData(interventionId, cpId)'
    ];
  }

  _getRamIndicatorsData(interventionId: number, cpId: number) {
    // Debounce to make sure the request is called only after both params are updated
    this._debounceRamIndRequest = Debouncer.debounce(this._debounceRamIndRequest,
        timeOut.after(100),
        () => {
          const validIds = interventionId > 0 && cpId > 0;
          if (!validIds) {
            return;
          }

          this._requestRamIndicatorsData({intervention_id: interventionId, cp_output_id: cpId});
        });
  }

  _requestRamIndicatorsData(reqPayload: any) {
    this.set('loading', true);
    this.sendRequest({
      method: 'GET',
      endpoint: this.getEndpoint('cpOutputRamIndicators', reqPayload)
    }).then((resp: any) => {
      this.set('loading', false);
      this.set('ramIndicators', resp.ram_indicators.map((ri: any) => ri.indicator_name));
    }).catch((error: any) => {
      logError('Error occurred on RAM Indicators request for PD ID: ' + reqPayload.intervention_id +
          ' and CP Output ID: ' + reqPayload.cp_output_id, 'etools-ram-indicators', error);
      parseRequestErrorsAndShowAsToastMsgs(error, this);
      this.set('loading', false);
    });
  }

  _noRamIndicators(l: number) {
    return typeof l !== 'number' || l === 0;
  }

}

window.customElements.define(EtoolsRamIndicators.is, EtoolsRamIndicators);
