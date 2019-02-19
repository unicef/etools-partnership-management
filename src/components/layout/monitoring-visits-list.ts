import { PolymerElement, html } from '@polymer/polymer';
import 'etools-loading/etools-loading.js';
declare const moment: any;
// @ts-ignore
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import CommonMixin from '../mixins/common-mixin';
import AjaxErrorsParserMixin from '../mixins/ajax-errors-parser-mixin';
import EndpointsMixin from '../endpoints/endpoints-mixin';
import { isEmptyObject } from '../utils/utils';
import { SharedStyles } from '../styles/shared-styles';
import { gridLayoutStyles } from '../styles/grid-layout-styles';

/**
     * @polymer
     * @mixinFunction
     * @appliesMixin EtoolsLogsMixin
     * @appliesMixin AjaxErrorsParserMixin
     * @appliesMixin EndpointsMixin
     * @appliesMixin CommonMixin
     */
    const MonitoringVisitsListMixins = EtoolsMixinFactory.combineMixins([
      EtoolsLogsMixin,
      AjaxErrorsParserMixin,
      EndpointsMixin,
      CommonMixin
    ], PolymerElement);

    /**
     * @polymer
     * @customElement
     * @appliesMixin MonitoringVisitsListMixins
     */
    class MonitoringVisitsList extends MonitoringVisitsListMixins {
      [x: string]: any;

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

      static get properties() {
        return {
          endpointName: String,
          initComplete: {
            type: Boolean,
            value: false
          },
          showLoading: {
            type: Boolean,
            value: true
          },
          monitoringVisits: {
            type: Array,
            value: []
          },
          tpmMonitoringVisits: {
            type: Array,
            value: []
          },
          interventionOrPartnerId: {
            type: Number,
            observer: '_interventionOrPartnerIdChanged'
          },
          showTpmVisits: {
            type: Boolean,
            value: false,
            reflectToAttribute: true
          }
        };
      }

      static get observers() {
        return ['showTpmVisitsAndIdChanged(interventionOrPartnerId, showTpmVisits)'];
      }

      _interventionOrPartnerIdChanged(newId: string) {
        if (!newId) {
          return;
        }

        this.set('showLoading', true);
        let monitoringVisitsEndpoint = this.getEndpoint(this.endpointName, {
          id: newId, year: moment().year()
        });
        let self = this;
        this.sendRequest({
          endpoint: monitoringVisitsEndpoint
        }).then(function(resp: any) {
          self.set('monitoringVisits', resp);
          self.set('showLoading', false);
        }).catch(function(error: any) {
          self.set('showLoading', false);
          self.parseRequestErrorsAndShowAsToastMsgs(error);
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
          this.logError('Error on get TPM visits');
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
