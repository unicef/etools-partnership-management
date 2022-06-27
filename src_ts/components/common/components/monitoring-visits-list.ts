import {customElement, html, LitElement, property, PropertyValues} from 'lit-element';
import '@unicef-polymer/etools-loading/etools-loading.js';
import CommonMixinLit from '../mixins/common-mixin-lit';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {isEmptyObject} from '../../utils/utils';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';

import {dataTableStylesLit} from '@unicef-polymer/etools-data-table/data-table-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import pmpEndpoints from '../../endpoints/endpoints';
import {repeat} from 'lit-html/directives/repeat';
declare const dayjs: any;

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin CommonMixin
 */
@customElement('monitoring-visits-list2')
export class MonitoringVisitsList extends CommonMixinLit(EndpointsLitMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit];
  }

  render() {
    return html`
      <style>
        ${sharedStyles} ${dataTableStylesLit} :host {
          @apply --layout-flex;
        }

        .monitoring-visits-container {
          position: relative;
        }

        etools-loading {
          margin-top: -10px;
          margin-bottom: -40px;
        }
      </style>

      <div class="monitoring-visits-container">
        <etools-loading id="monitoring" loading-text="Loading..." .active="${this.showLoading}"></etools-loading>

        <div ?hidden="${this._hideMonitoringVisits(this.monitoringVisits.length, this.tpmActivities.length)}">
          <etools-data-table-header
            id="listHeader"
            label="Showing ${this._getVisitsCount(this.monitoringVisits.length, this.tpmActivities.length)} results"
            no-collapse
          >
            <etools-data-table-column class="col-2" field="reference_number">Reference #</etools-data-table-column>
            <etools-data-table-column class="col-2" field="primary_traveler">Traveler</etools-data-table-column>
            <etools-data-table-column class="col-2" field="travel_type">Travel Type</etools-data-table-column>
            <etools-data-table-column class="col-2" field="date">End Date</etools-data-table-column>
            <etools-data-table-column class="col-2" field="locations">Locations</etools-data-table-column>
            <etools-data-table-column class="col-2" field="status">Status</etools-data-table-column>
          </etools-data-table-header>

          ${repeat(
            this.monitoringVisits || [],
            (visit: any) => html` <etools-data-table-row no-collapse>
              <div slot="row-data">
                <span class="col-data col-2">
                  <a
                    class="truncate"
                    href="/t2f/edit-travel/${visit.trip_id}"
                    title="${visit.reference_number}"
                    target="_blank"
                  >
                    ${visit.reference_number}
                  </a>
                </span>
                <span class="col-data col-2" title="${visit.primary_traveler}">
                  <span class="truncate"> ${visit.primary_traveler} </span>
                </span>
                <span class="col-data col-2" title="${visit.travel_type}">${visit.travel_type}</span>
                <span class="col-data col-2" title="${this.getDateDisplayValue(visit.travel_latest_date)}">
                  ${this.getDateDisplayValue(visit.travel_latest_date)}
                </span>
                <span class="col-data col-2" title="${this.getDisplayValue(visit.locations)}">
                  ${this.getDisplayValue(visit.locations)}
                </span>
                <span class="col-data col-2 capitalize" title="${visit.status}">${visit.status}</span>
              </div>
            </etools-data-table-row>`
          )}
          ${repeat(
            this.tpmActivities || [],
            (visit: any) => html` <etools-data-table-row no-collapse>
              <div slot="row-data">
                <span class="col-data col-2">
                  <a
                    class="truncate"
                    href="/tpm/visits/${visit.tpm_visit}/details"
                    title="${visit.visit_reference}"
                    target="_blank"
                  >
                    ${visit.visit_reference}
                  </a>
                </span>
                <span class="col-data col-2" title="${visit.tpm_partner_name}">
                  <span class="truncate"> ${visit.tpm_partner_name} </span>
                </span>
                <span class="col-data col-2" title="${this.getDisplayType(visit.is_pv)}">
                  ${this.getDisplayType(visit.is_pv)}
                </span>
                <span class="col-data col-2" title="${this.getDateDisplayValue(visit.date)}">
                  ${this.getDateDisplayValue(visit.date)}
                </span>
                <span class="col-data col-2" title="${this.getLocNames(visit.locations_details)}">
                  ${this.getLocNames(visit.locations_details)}
                </span>
                <span class="col-data col-2 capitalize" title="${visit.status}">${visit.status}</span>
              </div>
            </etools-data-table-row>`
          )}
        </div>
        <div
          class="row-h"
          ?hidden="${!this._hideMonitoringVisits(this.monitoringVisits.length, this.tpmActivities.length)}"
        >
          <p>There are no activities.</p>
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
  interventionId!: number;

  @property({type: Number})
  partnerId!: number;

  @property({type: Boolean, reflect: true, attribute: 'show-tpm-visits'})
  showTpmVisits = false;

  @property({type: Boolean, reflect: true, attribute: 'intervention-overview'})
  interventionOverview = false;

  updated(changedProperties: PropertyValues) {
    console.log(changedProperties);
    console.log(this.interventionId, this.partnerId);
    if (changedProperties.has('interventionId')) {
      this._interventionIdChanged(this.interventionId);
    }
    if (changedProperties.has('partnerId')) {
      this._partnerIdChanged(this.partnerId);
    }
    if (changedProperties.has('partnerId') || changedProperties.has('showTpmVisits')) {
      this.showTpmVisitsAndIdChanged(this.partnerId, this.showTpmVisits);
    }
  }

  _interventionIdChanged(intervId: number) {
    this._getT2fVisits(intervId, 'monitoringVisits');
  }

  _partnerIdChanged(partnerId: number) {
    if (!this.interventionOverview) {
      this._getT2fVisits(partnerId, 'partnerT2fProgrammaticVisits');
    }
  }

  _getT2fVisits(interventionOrPartnerId: number, endpointName: string) {
    if (!interventionOrPartnerId) {
      return;
    }

    this.showLoading = true;
    const monitoringVisitsEndpoint = this.getEndpoint(pmpEndpoints, endpointName, {
      id: interventionOrPartnerId,
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
    const endpoint = this.interventionId
      ? this.getEndpoint(pmpEndpoints, 'interventionTPMActivities', {
          year: dayjs().year(),
          interventionId: this.interventionId
        })
      : this.getEndpoint(pmpEndpoints, 'partnerTPMActivities', {
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
        logError('Error on get TPM visits');
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
