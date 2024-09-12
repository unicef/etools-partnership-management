import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import {EtoolsCurrency} from '@unicef-polymer/etools-unicef/src/mixins/currency';
import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-info-tooltip/etools-info-tooltip.js';
import '@unicef-polymer/etools-unicef/src/etools-data-table/etools-data-table';
import '@unicef-polymer/etools-unicef/src/etools-media-query/etools-media-query';

import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import CommonMixinLit from '../../../../common/mixins/common-mixin-lit';
import RiskRatingMixin from '../../../../common/mixins/risk-rating-mixin-lit';

import {pageCommonStyles} from '../../../../styles/page-common-styles-lit';
import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '../../../../styles/shared-styles-lit';
import {frWarningsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/fr-warnings-styles';
import {riskRatingStyles} from '../../../../styles/risk-rating-styles-lit';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {Partner, PartnerIntervention} from '../../../../../models/partners.models';
import {translate} from 'lit-translate';
import FrNumbersConsistencyMixin from '@unicef-polymer/etools-modules-common/dist/mixins/fr-numbers-consistency-mixin';
import {translateValue} from '@unicef-polymer/etools-modules-common/dist/utils/language';
import {dataTableStylesLit} from '@unicef-polymer/etools-unicef/src/etools-data-table/styles/data-table-styles';

/**
 * @LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin EtoolsCurrency
 * @appliesMixin CommonMixin
 * @appliesMixin RiskRatingMixin
 * @appliesMixin FrNumbersConsistencyixin
 */
@customElement('partner-overview')
export class PartnerOverview extends PaginationMixin(
  EtoolsCurrency(CommonMixinLit(RiskRatingMixin(FrNumbersConsistencyMixin(LitElement))))
) {
  static get styles() {
    return [layoutStyles, frWarningsStyles];
  }
  render() {
    if (!this.partner) return;

    return html`
      ${pageCommonStyles} ${sharedStyles} ${riskRatingStyles}
      <style>
        ${dataTableStylesLit}:host {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .assessments {
          margin-top: 20px;
        }

        #core-values-assessment {
          width: 100%;
        }

        .hact-heading {
          display: flex;
          flex-direction: column;
          background-color: var(--medium-theme-background-color);
        }

        .hact-heading .row .col {
          justify-content: center;
          align-items: center;
        }

        .hact-heading .row .right-align {
          justify-content: flex-end;
          align-items: center;
        }

        .hact-heading .row .left-align {
          justify-content: flex-start;
          align-items: center;
        }

        .hact-body {
          display: flex;
          flex-direction: column;
        }

        .row + .row {
          margin-top: 0;
          border-top: 1px solid var(--light-divider-color);
        }

        .full-width {
          width: 100%;
        }

        .green {
          color: var(--sl-color-green-500);
        }

        .partnership-status {
          text-transform: capitalize;
        }

        .block {
          display: block !important;
        }

        .word-break {
          word-break: break-all;
        }

        .overflow-hidden {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .timeline-col {
          display: flex !important;
          flex-direction: column !important;
          align-items: flex-start !important;
        }

        etools-data-table-footer {
          border-top: 1px solid var(--light-divider-color);
        }
        .row {
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding: 16px 9px;
        }
        .col {
          display: flex;
          flex-direction: row;
          box-sizing: border-box;
        }
        etools-data-table-row {
          --etools-font-size-13: 16px;
          --list-row-wrapper-padding-inline: 0;
        }
        .fr-nr-warn {
          text-align: start;
        }
      </style>
      <etools-media-query
        query="(max-width: 1100px)"
        @query-matches-changed="${(e: CustomEvent) => {
          this.lowResolutionLayout = e.detail.value;
        }}"
      ></etools-media-query>
      <etools-content-panel class="content-section" panel-title="${translate('PARTNER_OVERVIEW')}">
        <div class="hact-heading" ?hidden="${this.lowResolutionLayout}">
          <div class="row">
            <div class="col col-5"><strong> ${translate('TOTAL_CASH_TRANSFERS')} </strong></div>
            <div class="col col-2"><strong> ${translate('PROG_VISIT')} </strong></div>
            <div class="col col-2"><strong> ${translate('SPOT_CHECK')} </strong></div>
            <div class="col col-2"><strong> ${translate('AUDIT')} </strong></div>
          </div>
          <div class="row">
            <div class="col col-1">${translate('HACT_RISK_RATING')}</div>
            <div class="col col-2">${translate('CURRENT_CP_CYCLE')}</div>
            <div class="col col-2">${translate('CURRENT_YEAR_JAN_DEC')}</div>
            <div class="col col-2">${translate('PLANNED_MR_COMPLETED')}</div>
            <div class="col col-2">${translate('REQUIRED_COMPLETED')}</div>
            <div class="col col-2">${translate('REQUIRED_COMPLETED')}</div>
            <div class="col col-1 center-align ">${translate('SEA_RISK_RATING')}</div>
          </div>
        </div>
        <div class="hact-body">
          <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
            <div slot="row-data" class="row">
              <div class="col-data col col-1" data-col-header-label="${translate('HACT_RISK_RATING')}">
                <div class="${this.getRiskRatingClass(this.partner.rating)}">
                  ${translateValue(this.getRiskRatingValue(this.partner.rating), 'COMMON_DATA.PARTNERRISKRATINGS')}
                </div>
              </div>
              <div
                class="col-data col col-2 ${!this.lowResolutionLayout ? 'center-align' : ''}"
                data-col-header-label="${translate('CURRENT_CP_CYCLE')}"
              >
                $${this.displayCurrencyAmount(this.partner?.total_ct_cp, '0', 2)}
              </div>
              <div
                class="col-data col col-2 ${!this.lowResolutionLayout ? 'center-align' : ''}"
                data-col-header-label="${translate('CURRENT_YEAR_JAN_DEC')}"
              >
                $${this.displayCurrencyAmount(this.partner?.total_ct_ytd, '0', 2)}
              </div>
              <div
                class="col-data col col-2 ${!this.lowResolutionLayout ? 'center-align' : ''}"
                data-col-header-label="${translate('PLANNED_MR_COMPLETED')}"
              >
                <strong>
                  ${this.partner.hact_values?.programmatic_visits?.planned?.total} /
                  <span class="green">${this.partner.hact_min_requirements?.programmatic_visits}</span>
                  / ${this.partner.hact_values?.programmatic_visits?.completed?.total}
                </strong>
              </div>
              <div
                class="col-data col col-2 ${!this.lowResolutionLayout ? 'center-align' : ''}"
                data-col-header-label="${translate('REQUIRED_COMPLETED')}"
              >
                <strong>
                  <span class="green">${this.partner.hact_min_requirements?.spot_checks} </span>
                  / ${this.partner.hact_values?.spot_checks?.completed?.total}
                </strong>
              </div>
              <div
                class="col-data col col-2 ${!this.lowResolutionLayout ? 'center-align' : ''}"
                data-col-header-label="${translate('REQUIRED_COMPLETED')}"
              >
                <strong>
                  <span class="green">${this._getMinReqAudits(this.partner.planned_engagement)} </span>
                  / ${this.partner.hact_values?.audits?.completed}
                </strong>
              </div>
              <div
                class="col-data col col-1 ${!this.lowResolutionLayout ? 'center-align' : ''}"
                data-col-header-label="${translate('SEA_RISK_RATING')}"
              >
                <div class="${this.getRiskRatingClass(this.partner.sea_risk_rating_name)}">
                  ${translateValue(
                    this.getRiskRatingValue(this.partner.sea_risk_rating_name, 1),
                    'COMMON_DATA.SEARISKRATINGS'
                  )}
                </div>
              </div>
            </div>
          </etools-data-table-row>
        </div>
        ${this.paginatedInterventions.length
          ? html`
              <div class="hact-heading" ?hidden="${this.lowResolutionLayout}">
                <div class="row">
                  <div class="col col-3 word-break left-align">${translate('PARTNERSHIP')}</div>
                  <div class="col col-2 left-align">${translate('START_DATE_END_DATE')}</div>
                  <div class="col col-2 right-align">${translate('UNICEF_CASH')}</div>
                  <div class="col col-2 right-align">${translate('FR_AMOUNT')}</div>
                  <div class="col col-2 right-align">${translate('ACTUAL_DISBURSEMENT')}</div>
                  <div class="col">${translate('GENERAL.STATUS')}</div>
                </div>
              </div>
              <div class="hact-body">
                ${this.paginatedInterventions.map(
                  (partnership) => html`
                    <etools-data-table-row no-collapse .lowResolutionLayout="${this.lowResolutionLayout}">
                      <div slot="row-data" class="row">
                        <div
                          class="col-data col col-3 block word-break"
                          data-col-header-label="${translate('PARTNERSHIP')}"
                        >
                          <a class="primary" href="interventions/${partnership.id}/metadata">
                            <strong>${partnership.number}</strong> </a
                          ><br />
                          <span> ${partnership.title} </span>
                        </div>
                        <div
                          class="col-data col col-2 center-align timeline-col"
                          data-col-header-label="${translate('START_DATE_END_DATE')}"
                        >
                          <etools-info-tooltip
                            class="fr-nr-warn"
                            custom-icon
                            icon-first
                            ?hide-tooltip="${this.validateFrsVsInterventionDates(
                              partnership.start,
                              partnership.frs_earliest_start_date
                            )}"
                          >
                            <span slot="field">${this.getDateDisplayValue(partnership.start)}</span>
                            <etools-icon name="not-equal" slot="custom-icon"></etools-icon>
                            <span slot="message">${this.getFrsStartDateValidationMsg()}</span>
                          </etools-info-tooltip>
                          <etools-info-tooltip
                            class="fr-nr-warn"
                            custom-icon
                            icon-first
                            ?hide-tooltip="${this.validateFrsVsInterventionDates(
                              partnership.end,
                              partnership.frs_latest_end_date
                            )}"
                          >
                            <span slot="field">${this.getDateDisplayValue(partnership.end)}</span>
                            <etools-icon name="not-equal" slot="custom-icon"></etools-icon>
                            <span slot="message">${this.getFrsEndDateValidationMsg()}</span>
                          </etools-info-tooltip>
                        </div>
                        <div
                          class="col-data col col-2 ${!this.lowResolutionLayout ? 'right-align' : ''}"
                          data-col-header-label="${translate('UNICEF_CASH')}"
                        >
                          <span class="amount-currency">${partnership.budget_currency}</span>
                          <span>${this.displayCurrencyAmount(partnership.unicef_cash, '0', 0)}</span>
                        </div>
                        <div
                          class="col-data col col-2 ${!this.lowResolutionLayout ? 'right-align' : ''}"
                          data-col-header-label="${translate('FR_AMOUNT')}"
                        >
                          <etools-info-tooltip
                            class="fr-nr-warn ${this.getCurrencyMismatchClass(
                              partnership.all_currencies_are_consistent
                            )} partner-overview"
                            icon-first
                            custom-icon
                            ?hide-tooltip="${this.hideIntListUnicefCashAmountTooltip(
                              partnership.all_currencies_are_consistent,
                              partnership.unicef_cash,
                              partnership.frs_total_frs_amt,
                              partnership as any
                            )}"
                          >
                            <span
                              slot="field"
                              class="${this.getFrsValueNAClass(partnership.fr_currencies_are_consistent)}"
                            >
                              <span class="amount-currency">${partnership.fr_currency}</span>
                              <span
                                >${this.getFrsTotal(
                                  partnership.fr_currencies_are_consistent,
                                  partnership.frs_total_frs_amt
                                )}</span
                              >
                            </span>
                            <etools-icon
                              name="${this.getFrsCurrencyTooltipIcon(partnership.fr_currencies_are_consistent)}"
                              slot="custom-icon"
                            ></etools-icon>
                            <span slot="message">
                              <span
                                >${this.getIntListUnicefCashAmountTooltipMsg(
                                  partnership.all_currencies_are_consistent,
                                  partnership.fr_currencies_are_consistent
                                )}</span
                              >
                            </span>
                          </etools-info-tooltip>
                        </div>
                        <div
                          class="col-data col col-2 ${!this.lowResolutionLayout ? 'right-align' : ''}"
                          data-col-header-label="${translate('ACTUAL_DISBURSEMENT')}"
                        >
                          <etools-info-tooltip
                            class="fr-nr-warn currency-mismatch"
                            icon-first
                            custom-icon
                            ?hide-tooltip="${!this.frsConsistencyWarningIsActive(partnership.multi_curr_flag)}"
                          >
                            <span
                              slot="field"
                              class="${this.getFrsValueNAClass(partnership.multi_curr_flag, true)} partner-overview"
                            >
                              <span class="amount-currency">${partnership.fr_currency}</span>
                              <span
                                >${this.getFrsTotal(partnership.multi_curr_flag, partnership.actual_amount, true)}</span
                              >
                            </span>
                            <etools-icon name="not-equal" slot="custom-icon"></etools-icon>
                            <span slot="message">
                              <span>${this.getFrsMultiCurrFlagErrTooltipMsg()}</span>
                            </span>
                          </etools-info-tooltip>
                        </div>
                        <div
                          class="col-data col ${!this.lowResolutionLayout ? 'center-align' : ''} overflow-hidden"
                          data-col-header-label="${translate('GENERAL.STATUS')}"
                        >
                          <span class="partnership-status">${translateValue(partnership.status, 'STATUSES')}</span>
                        </div>
                      </div>
                    </etools-data-table-row>
                  `
                )}
              </div>
              <etools-data-table-footer
                .lowResolutionLayout="${this.lowResolutionLayout}"
                .pageSize="${this.paginator.page_size}"
                .pageNumber="${this.paginator.page}"
                .totalResults="${this.paginator.count}"
                .visibleRange="${this.paginator.visible_range}"
                @page-size-changed="${this.pageSizeChanged}"
                @page-number-changed="${this.pageNumberChanged}"
              >
              </etools-data-table-footer>
            `
          : html``}
      </etools-content-panel>
    `;
  }

  _partner!: Partner;

  set partner(partner: Partner) {
    this._partner = partner;
    this._initPaginator(this.partner?.interventions);
  }

  @property({type: Object})
  get partner() {
    return this._partner;
  }

  @property({type: Array})
  allInterventions: PartnerIntervention[] = [];

  @property({type: Array})
  paginatedInterventions: PartnerIntervention[] = [];

  @property({type: Boolean})
  lowResolutionLayout = false;

  public connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for overview tab elements load,
     * triggered by parent element on stamp or by tap event on tabs
     */
    setTimeout(() => {
      fireEvent(this, 'global-loading', {
        active: false,
        loadingSource: 'partners-page'
      });
      fireEvent(this, 'tab-content-attached');
    }, 100);
  }

  public _initPaginator(interventions: PartnerIntervention[] = []) {
    this.allInterventions = interventions || [];
    this.paginatedInterventions = [];
    this.paginator = JSON.parse(
      JSON.stringify({
        count: interventions.length,
        page: 1,
        page_size: 5
      })
    );
  }

  public _paginate(pageNumber: number, pageSize: number) {
    if (!this.allInterventions) {
      return;
    }
    const interventions = this.allInterventions.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
    this.paginatedInterventions = interventions;
  }

  paginatorChanged() {
    this._paginate(this.paginator.page, this.paginator.page_size);
  }

  public _getMinReqAudits(plannedEngagement: any) {
    return !plannedEngagement ? 0 : Number(plannedEngagement.scheduled_audit) + Number(plannedEngagement.special_audit);
  }
}
