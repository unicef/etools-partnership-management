import {LitElement, html, property, customElement, PropertyValues} from 'lit-element';
import '@polymer/iron-label/iron-label';
import '@unicef-polymer/etools-loading/etools-loading.js';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {debounce} from '@unicef-polymer/etools-utils/dist/debouncer.util';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import pmpEdpoints from '../../endpoints/endpoints';
import {translate, get as getTranslation} from 'lit-translate';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
@customElement('etools-ram-indicators-common')
export class EtoolsRamIndicators extends EndpointsLitMixin(LitElement) {
  render() {
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
          padding-inline-start: 24px;
          list-style: circle;
        }
      </style>

      <etools-loading ?active="${this.loading}"></etools-loading>

      <iron-label>
        <span id="label">${translate('RAM_INDICATORS')}</span>
        <div id="ram-indicators" iron-label-target>
          ${this._noRamIndicators(this.ramIndicators.length)
            ? html`<span id="no-ram-indicators">&#8212;</span>`
            : html`
                <ul id="ram-indicators-list">
                  ${this.ramIndicators.map((ramIndName: any) => html`<li>${ramIndName}</li>`)}
                </ul>
              `}
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

  connectedCallback() {
    super.connectedCallback();

    this._getRamIndicatorsData = debounce(this._getRamIndicatorsData.bind(this), 100) as any;
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('interventionId') || changedProperties.has('cpId')) {
      this.ramIndicators = [];
      this._getRamIndicatorsData(this.interventionId, this.cpId);
    }
  }

  _getRamIndicatorsData(interventionId: number, cpId: number) {
    // Debounce to make sure the request is called only after both params are updated
    const validIds = interventionId > 0 && cpId > 0;
    if (!validIds) {
      return;
    }

    this._requestRamIndicatorsData({
      intervention_id: interventionId,
      cp_output_id: cpId
    });
  }

  _requestRamIndicatorsData(reqPayload: any) {
    this.loading = true;
    sendRequest({
      method: 'GET',
      endpoint: this.getEndpoint(pmpEdpoints, 'cpOutputRamIndicators', reqPayload)
    })
      .then((resp: any) => {
        this.loading = false;
        this.ramIndicators = resp.ram_indicators.map((ri: any) => ri.indicator_name);
      })
      .catch((error: any) => {
        if (error.status === 404) {
          fireEvent(this, 'toast', {
            text: getTranslation('PMP_NOT_SYNCED')
          });
        } else {
          parseRequestErrorsAndShowAsToastMsgs(error, this);
        }
        EtoolsLogger.error(
          'Error occurred on RAM Indicators request for PD ID: ' +
            reqPayload.intervention_id +
            ' and CP Output ID: ' +
            reqPayload.cp_output_id,
          'etools-ram-indicators',
          error
        );
        this.loading = false;
      });
  }

  _noRamIndicators(l: number) {
    return typeof l !== 'number' || l === 0;
  }
}
