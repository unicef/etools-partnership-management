import { PolymerElement, html } from '@polymer/polymer';
import 'etools-loading/etools-loading.js';
declare const moment: any;
import CommonMixin from '../mixins/common-mixin';
import EndpointsMixin from '../endpoints/endpoints-mixin';
import { isEmptyObject } from '../utils/utils';
import { SharedStyles } from '../styles/shared-styles';
import { gridLayoutStyles } from '../styles/grid-layout-styles';
import {logError} from 'etools-behaviors/etools-logging.js';
import {parseRequestErrorsAndShowAsToastMsgs} from '../utils/ajax-errors-parser.js';
import { property } from '@polymer/decorators';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin CommonMixin
 */
class MonitoringVisitsList extends EndpointsMixin(CommonMixin(PolymerElement)) {

  static get template() {
    return html`
      ${SharedStyles} ${gridLayoutStyles}
      <style include="data-table-styles">
        :host {
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
        <etools-loading loading-text="Loading..."
                        active$="[[showLoading]]"></etools-loading>

        <div hidden$="[[_hideMonitoringVisits(monitoringVisits.length, tpmMonitoringVisits.length)]]">
          <etools-data-table-header id="listHeader" label="Showing [[monitoringVisits.length]] results" no-collapse>
            <etools-data-table-column class="col-2" field="reference_number">
              Reference #
            </etools-data-table-column>
            <etools-data-table-column class="col-2" field="primary_traveler">
              Traveler
            </etools-data-table-column>
            <etools-data-table-column class="col-2" field="travel_type">
              Travel Type
            </etools-data-table-column>
            <etools-data-table-column class="col-2" field="date">
              End Date
            </etools-data-table-column>
            <etools-data-table-column class="col-2" field="locations">
              Locations
            </etools-data-table-column>
            <etools-data-table-column class="col-2" field="status">
              Status
            </etools-data-table-column>
          </etools-data-table-header>

          <template id="rows" is="dom-repeat" items="[[monitoringVisits]]" as="visit">
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <span class="col-data col-2">
                  <a class="truncate"
                    href$="/t2f/edit-travel/[[visit.trip_id]]"
                    title="[[visit.reference_number]]"
                    target="_blank">
                    [[visit.reference_number]]
                  </a>
                </span>
                <span class="col-data col-2" title="[[visit.primary_traveler]]">
                  <span class="truncate"> [[visit.primary_traveler]] </span>
                </span>
                <span class="col-data col-2" title="[[visit.travel_type]]">
                    [[visit.travel_type]]
                </span>
                <span class="col-data col-2" title="[[getDateDisplayValue(visit.travel_latest_date)]]">
                    [[getDateDisplayValue(visit.travel_latest_date)]]
                </span>
                <span class="col-data col-2" title="[[getDisplayValue(visit.locations)]]">
                    [[getDisplayValue(visit.locations)]]
                </span>
                <span class="col-data col-2 capitalize" title="[[visit.status]]">
                    [[visit.status]]
                </span>
              </div>
            </etools-data-table-row>
          </template>

          <template id="rows" is="dom-repeat" items="[[tpmMonitoringVisits]]" as="visit">
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <span class="col-data col-2">
                  <a class="truncate"
                    href$="/tpm/visits/[[visit.id]]/details"
                    title="[[visit.reference_number]]"
                    target="_blank">
                    [[visit.reference_number]]
                  </a>
                </span>
                <span class="col-data col-2" title="[[visit.tpm_partner.name]]">
                  <span class="truncate"> [[visit.tpm_partner.name]] </span>
                </span>
                <span class="col-data col-2" title="TPM Visit">
                    TPM Visit
                </span>
                <span class="col-data col-2" title="[[getDateDisplayValue(visit.end_date)]]">
                    [[getDateDisplayValue(visit.end_date)]]
                </span>
                <span class="col-data col-2" title="[[getDisplayValue(visit.locations)]]">
                    [[getLocNames(visit.locations)]]
                </span>
                <span class="col-data col-2 capitalize" title="[[visit.status]]">
                    [[visit.status]]
                </span>
              </div>
            </etools-data-table-row>
          </template>
        </div>
        <div class="row-h" hidden$="[[!_hideMonitoringVisits(monitoringVisits.length, tpmMonitoringVisits.length)]]">
          <p>There are no monitoring visits.</p>
        </div>
      </div>
    `;
  }

  @property({type: String})
  endpointName!: string;

  @property({type: Boolean})
  initComplete: boolean = false;

  @property({type: Boolean})
  showLoading: boolean = true;

  @property({type: Array})
  monitoringVisits: any[] = [];

  @property({type: Array})
  tpmMonitoringVisits: any[] = [];

  @property({type: Number,  observer: '_interventionIdChanged'})
  interventionId!: number;

  @property({type: Number,  observer: '_partnerIdChanged'})
  partnerId!: number;

  @property({type: Boolean, reflectToAttribute: true})
  showTpmVisits: boolean = false;

  @property({type: Boolean, reflectToAttribute: true})
  interventionOverview: boolean = false;

  static get observers() {
    return [
             'showTpmVisitsAndIdChanged(partnerId, showTpmVisits)'
           ];
  }

  _interventionIdChanged(intervId: string) {
    this._getT2fVisits(intervId, 'monitoringVisits');
  }

  _partnerIdChanged(partnerId: string) {
    if (!this.interventionOverview) {
      this._getT2fVisits(partnerId, 'partnerT2fProgrammaticVisits');
    }
  }

  _getT2fVisits(interventionOrPartnerId: string , endpointName: string) {
    if (!interventionOrPartnerId) {
      return;
    }

    this.set('showLoading', true);
    let monitoringVisitsEndpoint = this.getEndpoint(endpointName, {
      id: interventionOrPartnerId, year: moment().year()
    });
    let self = this;
    this.sendRequest({
      endpoint: monitoringVisitsEndpoint
    }).then(function(resp: any) {
      self.set('monitoringVisits', resp);
      self.set('showLoading', false);
    }).catch(function(error: any) {
      self.set('showLoading', false);
      parseRequestErrorsAndShowAsToastMsgs(error, self);
    });
  }


  _hideMonitoringVisits(t2flength: number, tpmLength: number) {
    let shouldHide = t2flength === 0;
    if (this.showTpmVisits) {
      shouldHide = shouldHide && (tpmLength === 0);
    }
    return shouldHide;
  }

  showTpmVisitsAndIdChanged(partnerId: string, showTpmVisits: boolean) {
    if (!showTpmVisits || !partnerId) {
      this.set('tpmMonitoringVisits', []);
      return;
    }

    this.sendRequest({
      endpoint: this.getEndpoint('partnerTPMProgrammaticVisits',
       {partnerId: partnerId})
    }).then((resp: any) => {
      this.set('tpmMonitoringVisits', resp.results);
      this.set('showLoading', false);
    }).catch((_error: any) => {
      this.set('showLoading', false);
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

    return locations.reduce((a: any, b: any) => a.name + ', ' + b.name);
  }
}

window.customElements.define('monitoring-visits-list', MonitoringVisitsList);
