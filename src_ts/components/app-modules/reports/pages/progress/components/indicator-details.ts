import '@polymer/iron-pages/iron-pages.js';
import '@polymer/paper-tabs/paper-tab.js';
import '@polymer/paper-tabs/paper-tabs.js';
import '@polymer/app-layout/app-grid/app-grid-style.js';

import '@unicef-polymer/etools-loading/etools-loading.js';

import '../../../components/report-status.js';
import './disaggregations/disaggregation-table.js';
import {isEmptyObject} from '../../../../../utils/utils.js';
import {PolymerElement, html} from '@polymer/polymer';
import EndpointsMixin from '../../../../../endpoints/endpoints-mixin.js';
import UtilsMixin from '../../../../../mixins/utils-mixin.js';
import {parseRequestErrorsAndShowAsToastMsgs} from '../../../../../utils/ajax-errors-parser';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {property} from '@polymer/decorators';
import {GenericObject} from '../../../../../../typings/globals.types.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 * @appliesMixin UtilsMixin
 */
class IndicatorDetails extends EndpointsMixin(UtilsMixin(PolymerElement)) {

  static get is() {
    return 'indicator-details';
  }

  static get template() {
    return html`

      <style include="app-grid-style">
        :host {
          display: block;
          min-height: 150px;
          position: relative;

          --app-grid-columns: 2;
          --app-grid-gutter: 24px;
          --app-grid-item-height: auto;
          --paper-tab-ink: var(--primary-color);
          --paper-tabs-selection-bar-color: var(--primary-color);

          --paper-tabs: {
            padding-left: 13px;
            border-bottom: 1px solid var(--dark-divider-color);
          };
        }

        :host([is-cluster-indicator]) {
          --paper-tab-ink: var(--ternary-color);
          --paper-tabs-selection-bar-color: var(--ternary-color);
        }

        .tab-header {
          @apply --layout-horizontal;
          @apply --layout-justified;
          padding: 10px 24px;
          border-bottom: 1px solid var(--dark-divider-color);
          background-color: var(--light-theme-background-color);
        }

        .tab-header dl {
          margin: 0;
          font-size: 12px;
          color: var(--primary-text-color);
        }

        .tab-header dt,
        .tab-header dd {
          display: inline;
          margin: 0;
        }

        .tab-header dt:first-of-type,
        .tab-header dd:first-of-type {
          font-weight: bold;
          font-size: 13px;
        }

        .tab-header dt:last-of-type,
        .tab-header dd:last-of-type {
          color: var(--secondary-text-color);
        }

        .tab-header dd::after {
          content: '\\A';
          white-space: pre;
        }

        .table-container {
          max-height: 500px;
          overflow: auto;
        }

      </style>

      <etools-loading active="[[loading]]">Loading...</etools-loading>

      <!-- TODO: Check if this can be replaced using etools-tabs element (future task) -->
      <template is="dom-if" if="[[!loading]]">
        <paper-tabs selected="{{selected}}"
                    selectable="paper-tab"
                    scrollable>
          <template is="dom-repeat" items="[[locationData]]" as="topLevelLocation">
            <paper-tab>
              <report-status status="[[_computeLocationStatus(topLevelLocation)]]" no-label></report-status>
              [[topLevelLocation.title]]
            </paper-tab>
          </template>
        </paper-tabs>

        <iron-pages selected="{{selected}}">
          <template is="dom-repeat"
                    items="[[locationData]]"
                    as="topLevelLocation">
            <div>
              <paper-tabs selected="{{topLevelLocation.selected}}"
                          selectable="paper-tab"
                          scrollable>
                <template
                    is="dom-repeat"
                    items="[[topLevelLocation.byEntity]]"
                    as="location">
                  <paper-tab>[[location.reporting_entity.title]]</paper-tab>
                </template>
              </paper-tabs>

              <iron-pages selected="{{topLevelLocation.selected}}">
                <template
                    is="dom-repeat"
                    items="[[topLevelLocation.byEntity]]"
                    as="location">

                  <div>
                    <div class="tab-header">
                      <dl>
                        <template is="dom-if" if="[[_equals(location.display_type, 'number')]]" restamp="true">
                          <dt>Location progress against [[location.reporting_entity.title]] target:</dt>
                          <dd>[[_formatNumber(location.location_progress.v, '0', 0, '\,')]]</dd>
                          <dt>Previous location progress:</dt>
                          <dd>[[_formatNumber(location.previous_location_progress.v, '0', 0, '\,')]]</dd>
                        </template>
                        <template is="dom-if" if="[[!_equals(location.display_type, 'number')]]" restamp="true">
                          <dt>Location progress:</dt>
                          <dd>[[_formatIndicatorValue(location.display_type, location.location_progress.c, 1)]]</dd>
                          <dt>Previous location progress:</dt>
                          <dd>[[_formatIndicatorValue(location.display_type, location.previous_location_progress.c, 1)]]</dd>
                        </template>
                      </dl>
                    </div>

                    <div class="table-container app-grid">
                      <div class="item">
                        <disaggregation-table data="[[location]]"
                                              mapping="[[indicatorReport.disagg_lookup_map]]"
                                              labels="[[indicatorReport.labels]]">
                        </disaggregation-table>
                      </div>
                    </div>
                  </div>

                </template>
              </iron-pages>
            </div>

          </template>
        </iron-pages>
      </template>
    `;
  }

  @property({type: Number})
  indicatorReportId!: number;

  @property({type: Object})
  indicatorReport: GenericObject = {};

  @property({type: Boolean})
  loading: boolean = false;

  @property({type: Number})
  selected: number = 0;

  @property({type: Boolean, reflectToAttribute: true})
  isClusterIndicator: boolean = false;

  @property({type: Array, computed: '_computeLocationData(indicatorReport.indicator_location_data)'})
  locationData!: any[];

  _shouldRefreshIndicatorDetails() {
    return this.indicatorReportId &&
      (isEmptyObject(this.indicatorReport) ||
        (!isEmptyObject(this.indicatorReport) && this.indicatorReport.id !== parseInt(String(this.indicatorReportId), 10)));
  }

  getIndicatorDetails() {
    if (!this._shouldRefreshIndicatorDetails()) {
      // indicator details already loaded
      return;
    }

    const params = this._computeParams(String(this.indicatorReportId));
    this._showLoading();
    const self = this;
    this.fireRequest('reportIndicatorsDetails', {}, {params: params}).then(function(response: any) {
      self.set('indicatorReport', (response && response[0]) ? response[0] : {});
      self._hideLoading();
    }).catch(function(error: any) {
      logError('Indicator details data request failed!', 'reports-indicator-details', error);
      parseRequestErrorsAndShowAsToastMsgs(error, self);
      self._hideLoading();
    });
  }

  _showLoading() {
    this.set('loading', true);
  }

  _hideLoading() {
    this.set('loading', false);
  }

  _computeParams(indicatorReportId: string) {
    return {
      pks: indicatorReportId,
      limit: 1
    };
  }

  _computeLocationData(rawLocationData: any) {
    const byLocation = (rawLocationData || [])
      .reduce(function(acc: any, location: any) {
        const locationId = location.location.id;

        if (typeof acc[locationId] === 'undefined') {
          acc[locationId] = {
            title: location.location.title,
            byEntity: [],
            selected: 0
          };
        }

        acc[locationId].byEntity.push(location);
        if (acc[locationId].byEntity.length >= 2) {
          acc[locationId].selected = acc[locationId].byEntity.length - 1;
        }
        return acc;
      }, {});

    return Object.keys(byLocation)
      .map(function(key) {
        return byLocation[key];
      })
      .sort(function(a, b) {
        return b.is_master_location_data - a.is_master_location_data;
      });
  }

  _computeLocationStatus(location: any) {
    return location.byEntity[0].is_complete ? 1 : 2; //  'success' : 'error'
  }

}

window.customElements.define(IndicatorDetails.is, IndicatorDetails);
