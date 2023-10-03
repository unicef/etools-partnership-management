import {LitElement, html, PropertyValues} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@polymer/iron-pages/iron-pages.js';
import '@polymer/app-layout/app-grid/app-grid-style.js';
import '@unicef-polymer/etools-unicef/src/etools-loading/etools-loading';

import '../../../components/report-status.js';
import './disaggregations/disaggregation-table.js';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import {appGridStyles} from './disaggregations/styles/app-grid-styles';
import UtilsMixin from '../../../../../common/mixins/utils-mixin.js';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {GenericObject} from '@unicef-polymer/etools-types';
import pmpEdpoints from '../../../../../endpoints/endpoints.js';
import {translate} from 'lit-translate';
import '@shoelace-style/shoelace/dist/components/tab-group/tab-group.js';
import '@shoelace-style/shoelace/dist/components/tab/tab.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 * @appliesMixin UtilsMixin
 */
@customElement('indicator-details')
export class IndicatorDetails extends EndpointsLitMixin(UtilsMixin(LitElement)) {
  render() {
    return html`
      ${appGridStyles}
      <style>
        :host {
          display: block;
          min-height: 150px;
          position: relative;
          padding-inline-start: 24px;
          padding-inline-end: 24px;

          --app-grid-columns: 2;
          --app-grid-gutter: 24px;
          --app-grid-item-height: auto;
          --paper-tab-ink: var(--primary-color);
          --paper-tabs-selection-bar-color: var(--primary-color);

          --paper-tabs: {
            padding-inline-start: 13px;
            border-bottom: 1px solid var(--dark-divider-color);
          }
        }

        :host([is-cluster-indicator]) {
          --paper-tab-ink: var(--ternary-color);
          --paper-tabs-selection-bar-color: var(--ternary-color);
        }

        .tab-header {
          display: flex;
          justify-content: space-between;
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
        sl-tab-group {
          --indicator-color: var(--primary-color);
        }
        sl-tab-group::part(tabs) {
          border-bottom: 0;
        }
        sl-tab-group::part(active-tab-indicator) {
          bottom: 0;
        }
      </style>

      <etools-loading ?active="${this.loading}"></etools-loading>

      ${!this.loading
        ? html`<sl-tab-group @sl-tab-show="${this.onSelectedTabChanged}">
            ${(this.locationData || []).map(
              (topLevelLocation: any, index: number) => html` <sl-tab
                slot="nav"
                panel="tab_${index}"
                ?active="${this.selectedTab === `tab_${index}`}"
              >
                <report-status .status="${this._computeLocationStatus(topLevelLocation)}" no-label></report-status>
                ${topLevelLocation.title}
              </sl-tab>`
            )}
          </sl-tab-group>`
        : ''}
      ${(this.locationData || []).map(
        (topLevelLocation: any, index: number) => html`
          <div name="tab_${index}" ?hidden="${!this.isActiveTab(this.selectedTab, `tab_${index}`)}">
            ${topLevelLocation.byEntity.map(
              (location: any) => html`
                <div>
                  <div class="tab-header">
                    <dl>
                      ${this._equals(location.display_type, 'number')
                        ? html`
                            <dt>
                              ${translate('LOCATION_PROGRESS_AGAINST')} ${location.reporting_entity.title}
                              ${translate('TARGET_LOWCASE')}:
                            </dt>
                            <dd>${this._formatNumber(location.location_progress.v, '0', 0, ',')}</dd>
                            <dt>${translate('PREVIOUS_LOCATION_PROGRESS')}:</dt>
                            <dd>${this._formatNumber(location.previous_location_progress?.v, '0', 0, ',')}</dd>
                          `
                        : html` <dt>${translate('LOCATION_PROGRESS')}:</dt>
                            <dd>
                              ${this._formatIndicatorValue(location.display_type, location.location_progress.c, true)}
                            </dd>
                            <dt>${translate('PREVIOUS_LOCATION_PROGRESS')}:</dt>
                            <dd>
                              ${this._formatIndicatorValue(
                                location.display_type,
                                location.previous_location_progress?.c,
                                true
                              )}
                            </dd>`}
                    </dl>
                  </div>

                  <div class="table-container app-grid">
                    <div class="item">
                      <disaggregation-table
                        .data="${location}"
                        .mapping="${this.indicatorReport.disagg_lookup_map}"
                        .labels="${this.indicatorReport.labels}"
                      >
                      </disaggregation-table>
                    </div>
                  </div>
                </div>
              `
            )}
          </div>
        `
      )}
    `;
  }

  @property({type: Number})
  indicatorReportId!: number;

  @property({type: Object})
  indicatorReport: GenericObject = {};

  @property({type: Boolean})
  loading = false;

  @property({type: String})
  selectedTab = 'tab_0';

  @property({type: Boolean, reflect: true})
  isClusterIndicator = false;

  @property({type: Array})
  locationData!: any[];

  onSelectedTabChanged(e: CustomEvent) {
    this.selectedTab = e.detail.name;
  }

  updated(changedProperties: PropertyValues) {
    if (changedProperties.has('indicatorReport')) {
      this.locationData = this._computeLocationData(this.indicatorReport.indicator_location_data);
    }
  }

  _shouldRefreshIndicatorDetails() {
    return (
      this.indicatorReportId &&
      (isEmptyObject(this.indicatorReport) ||
        (!isEmptyObject(this.indicatorReport) &&
          this.indicatorReport.id !== parseInt(String(this.indicatorReportId), 10)))
    );
  }

  getIndicatorDetails() {
    if (!this._shouldRefreshIndicatorDetails()) {
      // indicator details already loaded
      return;
    }

    const params = this._computeParams(String(this.indicatorReportId));
    this._showLoading();
    this.fireRequest(pmpEdpoints, 'reportIndicatorsDetails', {}, {params: params})
      .then((response: any) => {
        this.indicatorReport = response && response[0] ? response[0] : {};
        this._hideLoading();
      })
      .catch((error: any) => {
        EtoolsLogger.error('Indicator details data request failed!', 'reports-indicator-details', error);
        parseRequestErrorsAndShowAsToastMsgs(error, this);
        this._hideLoading();
      });
  }

  _showLoading() {
    this.loading = true;
  }

  _hideLoading() {
    this.loading = false;
  }

  isActiveTab(tab: string, expectedTab: string): boolean {
    return tab === expectedTab;
  }

  _computeParams(indicatorReportId: string) {
    return {
      pks: indicatorReportId,
      limit: 1
    };
  }

  _computeLocationData(rawLocationData: any) {
    const byLocation = (rawLocationData || []).reduce(function (acc: any, location: any) {
      const locationId = location.location.id;

      if (typeof acc[locationId] === 'undefined') {
        acc[locationId] = {
          title: location.location.name,
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
      .map(function (key) {
        return byLocation[key];
      })
      .sort(function (a, b) {
        return b.is_master_location_data - a.is_master_location_data;
      });
  }

  _computeLocationStatus(location: any) {
    return location.byEntity[0].is_complete ? 1 : 2; //  'success' : 'error'
  }
}
