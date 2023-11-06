import {html, LitElement} from 'lit';
import {property, customElement} from 'lit/decorators.js';

import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';

import '../../../../common/components/etools-ram-indicators';

import '../../components/report-status';
import './components/report-overall';
import './components/indicator-report-target';
import './components/indicator-details';
import './components/sr-details';

import UtilsMixin from '../../../../common/mixins/utils-mixin';
import CommonMixinLit from '../../../../common/mixins/common-mixin-lit';
import {pageCommonStyles} from '../../../../styles/page-common-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {isEmptyObject} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GenericObject, CpOutput} from '@unicef-polymer/etools-types';
import {translate} from 'lit-translate';
import {translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import '@unicef-polymer/etools-unicef/src/etools-collapse/etools-collapse';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import {EtoolsIconButton} from '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
/**
 * @LitElement
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin UtilsMixin
 */
@customElement('report-progress')
export class ReportProgress extends CommonMixinLit(UtilsMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit];
  }

  render() {
    return html`
      <style>
        ${pageCommonStyles} ${sharedStyles} *[hidden] {
          display: none !important;
        }

        .indicator + .indicator {
          border-top: 1px solid var(--primary-background-color);
        }

        .indicator-toggle,
        .indicator-header-title,
        .indicator-header-target {
          display: flex !important;
          flex-direction: column !important;
          justify-content: center !important;
        }

        .indicator-toggle {
          position: relative;
          z-index: 1;
          color: white;
          padding: 0 4px;
          border-inline-end: 1px solid var(--primary-background-color);
        }

        .indicator-toggle etools-icon-button {
          --etools-icon-font-size: 24px;
          padding: 0;
        }

        .indicator-toggle {
          background-color: var(--primary-color);
        }

        .indicator-toggle.cluster-indicator {
          background-color: var(--ternary-color);
        }

        .indicator-header {
          padding-block: 8px;
          padding-inline: 16px 24px;
          background: var(--medium-theme-background-color);
        }

        .indicator-header-title h3 {
          margin: 0;
          font-size: 16px;
        }

        #no-report-data {
          background-color: var(--primary-background-color);
        }
        etools-icon-button::part(base) {
          color: var(--primary-background-color);
        }

        .calculation-formula {
          color: var(--secondary-text-color);
        }

        .calculation-formula-delimiter {
          margin: 0 16px;
        }
      </style>

      <!-- TODO: split this element and create separate elements for displaying SR vs QPR/HR req -->
      ${this._equals(this.report.report_type, 'SR')
        ? html`<sr-details .report="${this.report}" .reportAttachments="${this.reportAttachments}"></sr-details>`
        : html`
            <div
              id="no-report-data"
              class="paper-material elevation"
              elevation="1"
              ?hidden="${!this._noReportDataToShow(this.report.programme_document?.cp_outputs)}"
            >
              <div class="row-h">
                <p>${translate('NO_REPORT_DATA')}</p>
              </div>
            </div>

            ${this.report.programme_document?.cp_outputs.map(
              (result: any, resultIndex: number) => html`
                <etools-content-panel class="content-section" panel-title="${translate('CP_OUTPUT')}: ${result.title}">
                  <!-- RAM indicators display -->
                  <etools-ram-indicators-common
                    .interventionId="${this.report.programme_document.external_id}"
                    .cpId="${result.external_cp_output_id}"
                  ></etools-ram-indicators-common>

                  ${result.ll_outputs.map(
                    (lowerResult: any, lowerResultIndex: number) => html`
                      <report-overall
                        .lowerResultTitle="${lowerResult.title}"
                        .latestIndicator="${this._getLowerResultLatestIndicator(lowerResult.id)}"
                      ></report-overall>

                      ${this._getLowerResultIndicatorReports(lowerResult.id).map(
                        (indicatorReport: any, indicatorReportIndex: number) => {
                          const uniqueKey = `${resultIndex}-${lowerResultIndex}-${indicatorReportIndex}`;
                          return html`
                            <div class="indicator">
                              <div class="layout-horizontal">
                                <div class="indicator-toggle ${this._getClusterIndicatorClass(indicatorReport)}">
                                  <etools-icon-button
                                    @click="${this._toggle}"
                                    toggles-ind-details="${uniqueKey}"
                                    .name="${this._computeIcon(this.toggleFlags[uniqueKey])}"
                                  >
                                  </etools-icon-button>
                                </div>

                                <div class="indicator-header layout-horizontal flex-c">
                                  <div class="col col-8 indicator-header-title">
                                    <h3>
                                      ${this.getIndicatorDisplayType(indicatorReport.reportable.blueprint)}
                                      ${indicatorReport.reportable.blueprint.title}
                                    </h3>
                                    <div class="layout-horizontal calculation-formula">
                                      <span>
                                        ${translate('CALCULATION_METHOD')}:
                                        <strong>${this._calculationAcrossLocations(indicatorReport)}</strong>
                                      </span>
                                      <span class="calculation-formula-delimiter">|</span>
                                      <span>
                                        ${translate('CALCULATION_ACROSS')}:
                                        <strong>${this._calculationFormulaAcrossPeriods(indicatorReport)}</strong>
                                      </span>
                                    </div>
                                  </div>
                                  <div class="col col-4 indicator-header-target">
                                    <indicator-report-target2
                                      .displayType="${indicatorReport.reportable.blueprint.display_type}"
                                      .target="${indicatorReport.reportable.target}"
                                      .cumulativeProgress="${this._ternary(
                                        indicatorReport.reportable.blueprint.display_type,
                                        'number',
                                        indicatorReport.reportable.achieved.v,
                                        indicatorReport.reportable.achieved.c
                                      )}"
                                      .achievement="${this._ternary(
                                        indicatorReport.reportable.blueprint.display_type,
                                        'number',
                                        indicatorReport.total.v,
                                        indicatorReport.total.c
                                      )}"
                                      bold
                                    ></indicator-report-target2>
                                  </div>
                                </div>
                              </div>

                              <etools-collapse
                                id="collapse-${resultIndex}-${lowerResultIndex}-${indicatorReportIndex}"
                                @transitionend="${this._indicatorDetailsTransitioningComplete}"
                              >
                                <indicator-details
                                  id="indicator-details-${resultIndex}-${lowerResultIndex}-${indicatorReportIndex}"
                                  .indicatorReportId="${indicatorReport.id}"
                                  ?isClusterIndicator="${indicatorReport.is_cluster_indicator}"
                                >
                                </indicator-details>
                              </etools-collapse>
                            </div>
                          `;
                        }
                      )}
                    `
                  )}
                </etools-content-panel>
              `
            )}
          `}
    `;
  }

  @property({type: Object})
  report!: GenericObject;

  @property({type: Object})
  reportAttachments!: GenericObject;

  @property({type: Object})
  toggleFlags: GenericObject = {};

  connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for report progress tab elements load,
     * triggered by parent element on stamp or by tap event on tabs
     */
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'reports-page'
    });
  }

  _computeIcon(opened: boolean) {
    return opened ? 'expand-less' : 'expand-more';
  }

  _toggle(e: CustomEvent) {
    const toggleInd = (e.target as EtoolsIconButton).getAttribute('toggles-ind-details');
    const indicatorCollapsibleContent = this.shadowRoot!.querySelector('#collapse-' + toggleInd) as any & {
      toggle(): void;
    };
    if (indicatorCollapsibleContent) {
      indicatorCollapsibleContent.toggle();
    }
    this.toggleFlags[toggleInd!] = !this.toggleFlags[toggleInd!];
    this.toggleFlags = {...this.toggleFlags};
  }

  _indicatorDetailsTransitioningComplete(e: CustomEvent) {
    const indicatorCollapsibleContent = e.target as Element;
    const indicatorDetails = indicatorCollapsibleContent!.querySelector('indicator-details');
    if (indicatorDetails && (indicatorCollapsibleContent as any)!.opened) {
      // trigger indicator details request
      // @ts-ignore
      indicatorDetails.getIndicatorDetails();
    }
  }

  _getClusterIndicatorClass(indicatorReport: any) {
    return (indicatorReport && indicatorReport.is_cluster_indicator ? 'cluster-indicator' : '') + ' report-progress';
  }

  _noReportDataToShow(cpOutputs: CpOutput[]) {
    return isEmptyObject(cpOutputs);
  }

  _getLowerResultLatestIndicator(lowerResultId: any) {
    if (!lowerResultId || isEmptyObject(this.report.indicator_reports)) {
      return {};
    }
    const latestIndicatorReport = this.report.indicator_reports.find((rep: any) => {
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
    return translateValue(
      indicator.reportable.blueprint.display_type === 'ratio'
        ? 'latest'
        : indicator.reportable.blueprint.calculation_formula_across_periods,
      'FOMRULA_CHOICES'
    );
  }

  _calculationAcrossLocations(indicatorReport: any) {
    return translateValue(
      this.getDisplayValue(indicatorReport.reportable.blueprint.calculation_formula_across_locations) as string,
      'FOMRULA_CHOICES'
    );
  }
}
