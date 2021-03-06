import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-label/iron-label';
import '@unicef-polymer/etools-loading/etools-loading.js';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import EndpointsMixin from '../endpoints/endpoints-mixin';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {Debouncer} from '@polymer/polymer/lib/utils/debounce';
import {timeOut} from '@polymer/polymer/lib/utils/async';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {property} from '@polymer/decorators';
import {fireEvent} from '../utils/fire-custom-event';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
class EtoolsRamIndicators extends EndpointsMixin(PolymerElement) {
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

  @property({type: Number})
  interventionId!: number;

  @property({type: Number})
  cpId!: number;

  @property({type: Array})
  ramIndicators: any[] = [];

  @property({type: Boolean})
  loading = false;

  private _debounceRamIndRequest!: Debouncer;

  static get observers() {
    return ['_getRamIndicatorsData(interventionId, cpId)'];
  }

  _getRamIndicatorsData(interventionId: number, cpId: number) {
    // Debounce to make sure the request is called only after both params are updated
    this._debounceRamIndRequest = Debouncer.debounce(this._debounceRamIndRequest, timeOut.after(100), () => {
      const validIds = interventionId > 0 && cpId > 0;
      if (!validIds) {
        return;
      }

      this._requestRamIndicatorsData({
        intervention_id: interventionId,
        cp_output_id: cpId
      });
    });
  }

  _requestRamIndicatorsData(reqPayload: any) {
    this.set('loading', true);
    sendRequest({
      method: 'GET',
      endpoint: this.getEndpoint('cpOutputRamIndicators', reqPayload)
    })
      .then((resp: any) => {
        this.set('loading', false);
        this.set(
          'ramIndicators',
          resp.ram_indicators.map((ri: any) => ri.indicator_name)
        );
      })
      .catch((error: any) => {
        if (error.status === 404) {
          fireEvent(this, 'toast', {
            text: 'PMP is not synced with PRP',
            showCloseBtn: true
          });
        } else {
          parseRequestErrorsAndShowAsToastMsgs(error, this);
        }
        logError(
          'Error occurred on RAM Indicators request for PD ID: ' +
            reqPayload.intervention_id +
            ' and CP Output ID: ' +
            reqPayload.cp_output_id,
          'etools-ram-indicators',
          error
        );
        this.set('loading', false);
      });
  }

  _noRamIndicators(l: number) {
    return typeof l !== 'number' || l === 0;
  }
}

window.customElements.define(EtoolsRamIndicators.is, EtoolsRamIndicators);
