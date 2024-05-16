import {html, LitElement, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';

import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';
import CommonMixinLit from '../../../../../common/mixins/common-mixin-lit';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';

import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import pmpEndpoints from '../../../../../endpoints/endpoints';
import {repeat} from 'lit/directives/repeat.js';
import {translate} from 'lit-translate';
import dayjs from 'dayjs';

/**
 * @LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin CommonMixin
 */
@customElement('partner-monitoring-visits-list')
export class PartnerMonitoringVisitsList extends CommonMixinLit(EndpointsLitMixin(LitElement)) {
  static get styles() {
    return [layoutStyles];
  }

  render() {
    return html`
      <style>
        ${sharedStyles} ${dataTableStylesLit} :host {
          flex: 1;
          flex-basis: 0.000000001px;
        }

        .monitoring-visits-container {
          position: relative;
        }

        etools-loading {
          margin-top: -10px;
          margin-bottom: -40px;
        }
        .row.no-data {
          margin: 0;
          padding: 16px 11px;
        }
      </style>
      <etools-media-query
        query="(max-width: 767px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <div class="monitoring-visits-container">
        <etools-loading id="monitoring" .active="${this.showLoading}"></etools-loading>

        <div ?hidden="${this._hideMonitoringVisits(this.monitoringVisits.length, this.tpmActivities.length)}">
          <etools-data-table-header
            id="listHeader"
            label="Showing ${this._getVisitsCount(this.monitoringVisits.length, this.tpmActivities.length)} results"
            .lowResolutionLayout="${this.lowResolutionLayout}"
            no-collapse
          >
            <etools-data-table-column class="col-2" field="reference_number"
              >${translate('REFERENCE')}</etools-data-table-column
            >
            <etools-data-table-column class="col-2" field="primary_traveler"
              >${translate('TRAVELER')}</etools-data-table-column
            >
            <etools-data-table-column class="col-2" field="travel_type"
              >${translate('TRAVEL_TYPE')}</etools-data-table-column
            >
            <etools-data-table-column class="col-2" field="date">${translate('END_DATE')}</etools-data-table-column>
            <etools-data-table-column class="col-2" field="locations"
              >${translate('LOCATIONS')}</etools-data-table-column
            >
            <etools-data-table-column class="col-2" field="status">${translate('STATUS')}</etools-data-table-column>
          </etools-data-table-header>

          ${repeat(
            this.monitoringVisits || [],
            (visit: any) => html` <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
              <div slot="row-data">
                <span class="col-data col-2" data-col-header-label="${translate('REFERENCE')}">
                  <a
                    class="truncate"
                    href="/t2f/edit-travel/${visit.trip_id}"
                    title="${visit.reference_number}"
                    target="_blank"
                  >
                    ${visit.reference_number}
                  </a>
                </span>
                <span
                  class="col-data col-2"
                  data-col-header-label="${translate('TRAVELER')}"
                  title="${visit.primary_traveler}"
                >
                  <span class="truncate"> ${visit.primary_traveler} </span>
                </span>
                <span
                  class="col-data col-2"
                  data-col-header-label="${translate('TRAVEL_TYPE')}"
                  title="${visit.travel_type}"
                  >${visit.travel_type}</span
                >
                <span
                  class="col-data col-2"
                  data-col-header-label="${translate('END_DATE')}"
                  title="${this.getDateDisplayValue(visit.travel_latest_date)}"
                >
                  ${this.getDateDisplayValue(visit.travel_latest_date)}
                </span>
                <span
                  class="col-data col-2"
                  data-col-header-label="${translate('LOCATIONS')}"
                  title="${this.getDisplayValue(visit.locations)}"
                >
                  ${this.getDisplayValue(visit.locations)}
                </span>
                <span
                  class="col-data col-2 capitalize"
                  data-col-header-label="${translate('STATUS')}"
                  title="${visit.status}"
                  >${visit.status}</span
                >
              </div>
            </etools-data-table-row>`
          )}
          ${repeat(
            this.tpmActivities || [],
            (visit: any) => html` <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
              <div slot="row-data">
                <span class="col-data col-2" data-col-header-label="${translate('REFERENCE')}">
                  <a
                    class="truncate"
                    href="/tpm/visits/${visit.tpm_visit}/details"
                    title="${visit.visit_reference}"
                    target="_blank"
                  >
                    ${visit.visit_reference}
                  </a>
                </span>
                <span
                  class="col-data col-2"
                  data-col-header-label="${translate('TRAVELER')}"
                  title="${visit.tpm_partner_name}"
                >
                  <span class="truncate"> ${visit.tpm_partner_name} </span>
                </span>
                <span
                  class="col-data col-2"
                  data-col-header-label="${translate('TRAVEL_TYPE')}"
                  title="${this.getDisplayType(visit.is_pv)}"
                >
                  ${this.getDisplayType(visit.is_pv)}
                </span>
                <span
                  class="col-data col-2"
                  data-col-header-label="${translate('END_DATE')}"
                  title="${this.getDateDisplayValue(visit.date)}"
                >
                  ${this.getDateDisplayValue(visit.date)}
                </span>
                <span
                  class="col-data col-2"
                  data-col-header-label="${translate('LOCATIONS')}"
                  title="${this.getLocNames(visit.locations_details)}"
                >
                  ${this.getLocNames(visit.locations_details)}
                </span>
                <span
                  class="col-data col-2 capitalize"
                  data-col-header-label="${translate('STATUS')}"
                  title="${visit.status}"
                  >${visit.status}</span
                >
              </div>
            </etools-data-table-row>`
          )}
        </div>
        <div
          class="row no-data"
          ?hidden="${!this._hideMonitoringVisits(this.monitoringVisits.length, this.tpmActivities.length)}"
        >
          <p class="col-12">${this.showTpmVisits ? translate('NO_PROGRAMATIC_VISITS') : translate('NO_ACTIVITIES')}</p>
        </div>
      </div>
    `;
  }

  @property({type: String})
  endpointName!: string;

  @property({type: Boolean})
  initComplete = false;

  @property({type: Boolean})
  showLoading = true;

  @property({type: Array})
  monitoringVisits: any[] = [];

  @property({type: Array})
  tpmActivities: any[] = [];

  @property({type: Number})
  partnerId!: number;

  @property({type: Boolean, reflect: true, attribute: 'show-tpm-visits'})
  showTpmVisits = false;

  @property({type: Boolean})
  lowResolutionLayout = false;

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('partnerId')) {
      this._getT2fVisits(this.partnerId, 'partnerT2fProgrammaticVisits');
    }
    if (changedProperties.has('partnerId') || changedProperties.has('showTpmVisits')) {
      this.showTpmVisitsAndIdChanged(this.partnerId, this.showTpmVisits);
    }
  }

  _getT2fVisits(partnerId: number, endpointName: string) {
    if (!partnerId) {
      return;
    }

    this.showLoading = true;
    const monitoringVisitsEndpoint = this.getEndpoint(pmpEndpoints, endpointName, {
      id: partnerId,
      year: dayjs().year()
    });
    sendRequest({
      endpoint: monitoringVisitsEndpoint
    })
      .then((resp: any) => {
        this.monitoringVisits = resp;
        this.showLoading = false;
      })
      .catch((error: any) => {
        this.showLoading = false;
        parseRequestErrorsAndShowAsToastMsgs(error, this);
      });
  }

  _getVisitsCount(t2flength: number, tpmLength: number) {
    return this.showTpmVisits ? t2flength + tpmLength : t2flength;
  }

  getDisplayType(is_pv: boolean) {
    return is_pv ? 'TPM Programmatic' : 'TPM Monitoring';
  }

  _hideMonitoringVisits(t2flength: number, tpmLength: number) {
    let shouldHide = t2flength === 0;
    if (this.showTpmVisits) {
      shouldHide = shouldHide && tpmLength === 0;
    }
    return shouldHide;
  }

  showTpmVisitsAndIdChanged(partnerId: number, showTpmVisits: boolean) {
    if (!showTpmVisits || !partnerId) {
      this.tpmActivities = [];
      return;
    }
    const endpoint = this.getEndpoint(pmpEndpoints, 'partnerTPMActivities', {
      year: dayjs().year(),
      partnerId: this.partnerId
    });

    sendRequest({
      endpoint: endpoint
    })
      .then((resp: any) => {
        this.tpmActivities = resp;
        this.showLoading = false;
      })
      .catch((_error: any) => {
        this.showLoading = false;
        EtoolsLogger.error('Error on get TPM visits');
      });
  }

  getLocNames(locations: any) {
    if (isEmptyObject(locations)) {
      return '-';
    }

    if (locations.length === 1) {
      return locations[0].name;
    }
    return locations.map((a: any) => (a.name ? a.name : '')).join(', ');
  }
}
