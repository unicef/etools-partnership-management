import {PolymerElement, html} from '@polymer/polymer';
import '@unicef-polymer/etools-loading/etools-loading.js';
declare const moment: any;
import CommonMixin from '../mixins/common-mixin';
import EndpointsMixin from '../endpoints/endpoints-mixin';
import {isEmptyObject} from '../utils/utils';
import {SharedStyles} from '../styles/shared-styles';
import {gridLayoutStyles} from '../styles/grid-layout-styles';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {property} from '@polymer/decorators';

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
        <etools-loading loading-text="Loading..." active$="[[showLoading]]"></etools-loading>

        <div hidden$="[[_hideMonitoringVisits(monitoringVisits.length, tpmActivities.length)]]">
          <etools-data-table-header
            id="listHeader"
            label="Showing [[_getVisitsCount(monitoringVisits.length, tpmActivities.length)]] results"
            no-collapse
          >
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
                  <a
                    class="truncate"
                    href$="/t2f/edit-travel/[[visit.trip_id]]"
                    title="[[visit.reference_number]]"
                    target="_blank"
                  >
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

          <template id="rows" is="dom-repeat" items="[[tpmActivities]]" as="visit">
            <etools-data-table-row no-collapse>
              <div slot="row-data">
                <span class="col-data col-2">
                  <a
                    class="truncate"
                    href$="/tpm/visits/[[visit.tpm_visit]]/details"
                    title="[[visit.visit_reference]]"
                    target="_blank"
                  >
                    [[visit.visit_reference]]
                  </a>
                </span>
                <span class="col-data col-2" title="[[visit.tpm_partner_name]]">
                  <span class="truncate"> [[visit.tpm_partner_name]] </span>
                </span>
                <span class="col-data col-2" title="[[getDisplayType(visit.is_pv)]]">
                  [[getDisplayType(visit.is_pv)]]
                </span>
                <span class="col-data col-2" title="[[getDateDisplayValue(visit.date)]]">
                  [[getDateDisplayValue(visit.date)]]
                </span>
                <span class="col-data col-2" title="[[getLocNames(visit.locations_details)]]">
                  [[getLocNames(visit.locations_details)]]
                </span>
                <span class="col-data col-2 capitalize" title="[[visit.status]]">
                  [[visit.status]]
                </span>
              </div>
            </etools-data-table-row>
          </template>
        </div>
        <div class="row-h" hidden$="[[!_hideMonitoringVisits(monitoringVisits.length, tpmActivities.length)]]">
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

  @property({type: Number, observer: '_interventionIdChanged'})
  interventionId!: number;

  @property({type: Number, observer: '_partnerIdChanged'})
  partnerId!: number;

  @property({type: Boolean, reflectToAttribute: true})
  showTpmVisits = false;

  @property({type: Boolean, reflectToAttribute: true})
  interventionOverview = false;

  static get observers() {
    return ['showTpmVisitsAndIdChanged(partnerId, showTpmVisits)'];
  }

  _interventionIdChanged(intervId: string) {
    this._getT2fVisits(intervId, 'monitoringVisits');
  }

  _partnerIdChanged(partnerId: string) {
    if (!this.interventionOverview) {
      this._getT2fVisits(partnerId, 'partnerT2fProgrammaticVisits');
    }
  }

  _getT2fVisits(interventionOrPartnerId: string, endpointName: string) {
    if (!interventionOrPartnerId) {
      return;
    }

    this.set('showLoading', true);
    const monitoringVisitsEndpoint = this.getEndpoint(endpointName, {
      id: interventionOrPartnerId,
      year: moment().year()
    });
    sendRequest({
      endpoint: monitoringVisitsEndpoint
    })
      .then((resp: any) => {
        this.set('monitoringVisits', resp);
        this.set('showLoading', false);
      })
      .catch((error: any) => {
        this.set('showLoading', false);
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

  showTpmVisitsAndIdChanged(partnerId: string, showTpmVisits: boolean) {
    if (!showTpmVisits || !partnerId) {
      this.set('tpmActivities', []);
      return;
    }
    const endpoint = this.interventionId
      ? this.getEndpoint('interventionTPMActivities', {
          year: moment().year(),
          interventionId: this.interventionId
        })
      : this.getEndpoint('partnerTPMActivities', {
          year: moment().year(),
          partnerId: this.partnerId
        });

    sendRequest({
      endpoint: endpoint
    })
      .then((resp: any) => {
        this.set('tpmActivities', resp);
        this.set('showLoading', false);
      })
      .catch((_error: any) => {
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
    return locations.map((a: any) => (a.name ? a.name : '')).join(', ');
  }
}

window.customElements.define('monitoring-visits-list', MonitoringVisitsList);
