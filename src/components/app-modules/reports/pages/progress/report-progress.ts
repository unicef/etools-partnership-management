import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-styles/element-styles/paper-material-styles.js';
import 'etools-content-panel/etools-content-panel.js';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';

import '../../../../layout/etools-ram-indicators.js';

import '../../components/report-status.js';
import 'components/report-overall.js';
import 'components/indicator-report-target.js';
import 'components/indicator-details.js';
import 'components/sr-details.js';
import { PolymerElement, html } from '@polymer/polymer';
import UtilsMixin from '../../../../mixins/utils-mixin.js';
import CommonMixin from '../../../../mixins/common-mixin.js';
import { pageCommonStyles } from '../../../../styles/page-common-styles.js';
import { gridLayoutStyles } from '../../../../styles/grid-layout-styles.js';
import { PolymerElEvent } from '../../../../../typings/globals.types.js';
import { isEmptyObject } from '../../../../utils/utils.js';
import { CpOutput } from '../../../../../typings/intervention.types.js';
import { fireEvent } from '../../../../utils/fire-custom-event.js';


/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin UtilsMixin
 */
class ReportProgress extends EtoolsMixinFactory.combineMixins([
  CommonMixin,
  UtilsMixin
], PolymerElement) {
  [x: string]: any;

  static get is() {
    return 'report-progress';
  }

  static get template() {
    return html`
     ${pageCommonStyles} ${gridLayoutStyles}
      <style include="paper-material-styles">
        *[hidden] {
          display: none !important;
        }

        .indicator + .indicator {
          border-top: 1px solid var(--primary-background-color);
        }

        .indicator-toggle,
        .indicator-header-title,
        .indicator-header-target {
          @apply --layout-vertical;
          @apply --layout-center-justified;
        }

        .indicator-toggle {
          position: relative;
          z-index: 1;
          color: white;
          padding: 0 4px;
          border-right: 1px solid var(--primary-background-color);
        }

        .indicator-toggle paper-icon-button {
          width: 24px;
          height: 24px;
          padding: 0;
        }

        .indicator-toggle {
          background-color: var(--primary-color);
        }

        .indicator-toggle.cluster-indicator {
          background-color: var(--ternary-color);
        }

        .indicator-header {
          padding: 8px 24px 8px 16px;
          background: var(--medium-theme-background-color);
        }

        .indicator-header-title h3 {
          margin: 0;
        }

        #no-report-data {
          background-color: var(--primary-background-color);
        }

        .calculation-formula {
          color: var(--secondary-text-color);
        }

        .calculation-formula-delimiter {
          margin: 0 16px;
        }
      </style>

      <!-- TODO: split this element and create separate elements for displaying SR vs QPR/HR req -->
      <template is="dom-if" if="[[_equals(report.report_type, 'SR')]]">
        <sr-details report="[[report]]" report-attachment="[[reportAttachment]]"></sr-details>
      </template>

      <template is="dom-if" if="[[!_equals(report.report_type, 'SR')]]">
        <div id="no-report-data"
            class="paper-material"
            elevation="1"
            hidden$="[[!_noReportDataToShow(report.programme_document.cp_outputs)]]">
          <div class="row-h">
            <p>There is no report data to display.</p>
          </div>
        </div>

        <template is="dom-repeat"
                  items="[[report.programme_document.cp_outputs]]"
                  as="result"
                  index-as="resultIndex">
          <etools-content-panel class="content-section" panel-title="CP Output: [[result.title]]">

            <!-- RAM indicators display -->
            <etools-ram-indicators class="row-h"
                                  intervention-id="[[report.programme_document.external_id]]"
                                  cp-id="[[result.external_cp_output_id]]"></etools-ram-indicators>

            <template is="dom-repeat"
                      items="[[result.ll_outputs]]"
                      as="lowerResult"
                      index-as="lowerResultIndex">

              <report-overall lower-result-title="[[lowerResult.title]]"
                              latest-indicator="[[_getLowerResultLatestIndicator(lowerResult.id)]]"></report-overall>

              <template is="dom-repeat"
                        items="[[_getLowerResultIndicatorReports(lowerResult.id)]]"
                        as="indicatorReport"
                        index-as="indicatorReportIndex">

                <div class="indicator">
                  <div class="layout-horizontal">
                    <div class$="indicator-toggle [[_getClusterIndicatorClass(indicatorReport)]]">
                      <paper-icon-button on-click="_toggle"
                                        toggles-ind-details$="[[resultIndex]]-[[lowerResultIndex]]-[[indicatorReportIndex]]"
                                        icon$="[[_computeIcon(indicatorReport.expanded)]]">
                      </paper-icon-button>
                    </div>

                    <div class="indicator-header layout-horizontal flex-c">
                      <div class="col col-8 indicator-header-title">
                        <h3>
                          [[_ternary(indicatorReport.reportable.blueprint.unit, 'number', '#', '%')]]
                          [[indicatorReport.reportable.blueprint.title]]
                        </h3>
                        <div class="layout-horizontal calculation-formula">
                          <span>
                            calculation method accross locations:
                            <strong>[[getDisplayValue(indicatorReport.reportable.blueprint.calculation_formula_across_locations)]]</strong>
                          </span>
                            <span class="calculation-formula-delimiter">|</span>
                            <span>
                            calculation across reporting periods:
                              <strong>[[_calculationFormulaAcrossPeriods(indicatorReport)]]</strong>
                          </span>
                        </div>
                      </div>
                      <div class="col col-4 indicator-header-target">
                        <indicator-report-target
                            display-type="[[indicatorReport.reportable.blueprint.display_type]]"
                            target="[[indicatorReport.reportable.target]]"
                            cumulative-progress="[[_ternary(indicatorReport.reportable.blueprint.display_type, 'number',
                                indicatorReport.reportable.achieved.v, indicatorReport.reportable.achieved.c)]]"
                            achievement="[[_ternary(indicatorReport.reportable.blueprint.display_type, 'number',
                                indicatorReport.total.v, indicatorReport.total.c)]]"
                            bold></indicator-report-target>
                      </div>
                    </div>
                  </div>

                  <iron-collapse id="collapse-[[resultIndex]]-[[lowerResultIndex]]-[[indicatorReportIndex]]"
                                opened="{{indicatorReport.expanded}}"
                                on-transitioning-changed="_indicatorDetailsTransitioningComplete">
                    <indicator-details
                        id$="indicator-details-[[resultIndex]]-[[lowerResultIndex]]-[[indicatorReportIndex]]"
                        indicator-report-id="[[indicatorReport.id]]"
                        is-cluster-indicator$="[[indicatorReport.is_cluster_indicator]]">
                    </indicator-details>
                  </iron-collapse>
                </div>
              </template>

            </template>
          </etools-content-panel>
        </template>

      </template>
    `;
  }

  static get properties() {
    return {
      report: Object,
      reportAttachment: Object
    };
  }

  connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for report progress tab elements load,
     * triggered by parent element on stamp or by tap event on tabs
     */
    fireEvent(this, 'global-loading', {active: false, loadingSource: 'reports-page'});
  }

  _computeIcon(opened: boolean) {
    return opened ? 'icons:expand-less' : 'icons:expand-more';
  }

  _toggle(e: PolymerElEvent) {
    let toggles = e.target.getAttribute('toggles-ind-details');
    let indicatorCollapsibleContent = this.shadowRoot.querySelector('#collapse-' + toggles);
    if (indicatorCollapsibleContent) {
      indicatorCollapsibleContent.toggle();
    }
  }

  _indicatorDetailsTransitioningComplete(e: CustomEvent) {
    let indicatorCollapsibleContent = e.target;
    let indicatorDetails = indicatorCollapsibleContent!.querySelector('indicator-details');
    if (indicatorDetails && !e.detail.value && indicatorCollapsibleContent!.opened) {
      // trigger indicator details request
      indicatorDetails.getIndicatorDetails();
    }
  }

  _getClusterIndicatorClass(indicatorReport: any) {
    return ((indicatorReport && indicatorReport.is_cluster_indicator) ? 'cluster-indicator' : '') + ' report-progress';
  }

  _noReportDataToShow(cpOutputs: CpOutput[]) {
    return isEmptyObject(cpOutputs);
  }

  _getLowerResultLatestIndicator(lowerResultId: any) {
    if (!lowerResultId || isEmptyObject(this.report.indicator_reports)) {
      return {};
    }
    let latestIndicatorReport = this.report.indicator_reports.find((rep: any) => {
      return rep.reportable_object_id === lowerResultId;
    });
    return latestIndicatorReport ? latestIndicatorReport : {};
  }

  _getLowerResultIndicatorReports(lowerResultId: any) {
    if (!lowerResultId || isEmptyObject(this.report.indicator_reports)) {
      return [];
    }
    return this.report.indicator_reports.filter((rep: any) => {
      return rep.reportable_object_id === lowerResultId;
    });
  }

    _calculationFormulaAcrossPeriods(indicator: any) {
    return indicator.reportable.blueprint.display_type === 'ratio'
      ? 'latest' : indicator.reportable.blueprint.calculation_formula_across_periods;
  }

}

window.customElements.define(ReportProgress.is, ReportProgress);
