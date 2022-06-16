import {LitElement, html, customElement, property} from 'lit-element';
import {EtoolsCurrency} from '@unicef-polymer/etools-currency-amount-input/mixins/etools-currency-mixin';
import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-info-tooltip/etools-info-tooltip.js';
import '@unicef-polymer/etools-data-table/etools-data-table';
import PaginationMixin from '@unicef-polymer/etools-modules-common/dist/mixins/pagination-mixin';
import CommonMixinLit from '../../../../common/mixins/common-mixin-lit';
import RiskRatingMixin from '../../../../common/mixins/risk-rating-mixin-lit';

import {pageCommonStyles} from '../../../../styles/page-common-styles-lit';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '../../../../styles/shared-styles-lit';
import {pmpCustomIcons} from '../../../../styles/custom-iconsets/pmp-icons-lit';
import {frWarningsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/fr-warnings-styles';
import {riskRatingStyles} from '../../../../styles/risk-rating-styles-lit';
import {fireEvent} from '../../../../utils/fire-custom-event';
import {Partner, PartnerIntervention} from '../../../../../models/partners.models';
import {translate} from 'lit-translate';
import FrNumbersConsistencyMixin from '@unicef-polymer/etools-modules-common/dist/mixins/fr-numbers-consistency-mixin';

/**
 * @polymer
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
    return [gridLayoutStylesLit, frWarningsStyles];
  }
  render() {
    if (!this.partner) return;

    return html`
      ${pmpCustomIcons} ${pageCommonStyles} ${sharedStyles} ${riskRatingStyles}
      <style>
        :host {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        paper-input,
        paper-dropdown-menu {
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

        .hact-heading .row-h .col {
          justify-content: center;
          align-items: center;
        }

        .hact-heading .row-h .right-align {
          justify-content: flex-end;
          align-items: center;
        }

        .hact-heading .row-h .left-align {
          justify-content: flex-start;
          align-items: center;
        }

        .hact-body {
          display: flex;
          flex-direction: column;
        }

        .row-h + .row-h {
          margin-top: 0;
          border-top: 1px solid var(--light-divider-color);
        }

        .full-width {
          width: 100%;
        }

        .green {
          color: var(--paper-green-500);
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
      </style>

      <etools-content-panel class="content-section" panel-title="Partner Overview">
        <div class="hact-heading">
          <div class="row-h">
            <div class="col col-5"><strong> ${translate('TOTAL_CASH_TRANSFERS')} </strong></div>
            <div class="col col-2"><strong> ${translate('PROG_VISIT')} </strong></div>
            <div class="col col-2"><strong> ${translate('SPOT_CHECK')} </strong></div>
            <div class="col col-2"><strong> ${translate('AUDIT')} </strong></div>
          </div>
          <div class="row-h">
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
          <div class="row-h">
            <div class="col col-1">
              <div class="${this.getRiskRatingClass(this.partner.rating)}">
                ${this.getRiskRatingValue(this.partner.rating)}
              </div>
            </div>
            <div class="col col-2 center-align">$${this.displayCurrencyAmount(this.partner?.total_ct_cp, '0', 2)}</div>
            <div class="col col-2 center-align block">
              $${this.displayCurrencyAmount(this.partner?.total_ct_ytd, '0', 2)}
            </div>
            <div class="col col-2 center-align">
              <strong>
                ${this.partner.hact_values?.programmatic_visits?.planned?.total} /
                <span class="green">${this.partner.hact_min_requirements?.programmatic_visits}</span>
                / ${this.partner.hact_values?.programmatic_visits?.completed?.total}
              </strong>
            </div>
            <div class="col col-2 center-align">
              <strong>
                <span class="green">${this.partner.hact_min_requirements?.spot_checks} </span>
                / ${this.partner.hact_values?.spot_checks?.completed?.total}
              </strong>
            </div>
            <div class="col col-2 center-align">
              <strong>
                <span class="green">${this._getMinReqAudits(this.partner.planned_engagement)} </span>
                / ${this.partner.hact_values?.audits?.completed}
              </strong>
            </div>
            <div class="col col-1 center-align">
              <div class="${this.getRiskRatingClass(this.partner.sea_risk_rating_name)}">
                ${this.getRiskRatingValue(this.partner.sea_risk_rating_name, 1)}
              </div>
            </div>
          </div>
        </div>
        ${this.paginatedInterventions.length
          ? html`
              <div class="hact-heading">
                <div class="row-h">
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
                    <div class="row-h">
                      <div class="col col-3 block word-break">
                        <a class="primary" href="interventions/${partnership.id}/metadata">
                          <strong>${partnership.number}</strong> </a
                        ><br />
                        <span> ${partnership.title} </span>
                      </div>
                      <div class="col col-2 center-align timeline-col">
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
                          <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
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
                          <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                          <span slot="message">${this.getFrsEndDateValidationMsg()}</span>
                        </etools-info-tooltip>
                      </div>
                      <div class="col col-2 right-align">
                        <span class="amount-currency">${partnership.budget_currency}</span>
                        <span>${this.displayCurrencyAmount(partnership.unicef_cash, '0', 0)}</span>
                      </div>
                      <div class="col col-2 right-align">
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
                          <iron-icon
                            icon="${this.getFrsCurrencyTooltipIcon(partnership.fr_currencies_are_consistent)}"
                            slot="custom-icon"
                          ></iron-icon>
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
                      <div class="col col-2 right-align">
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
                          <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                          <span slot="message">
                            <span>${this.getFrsMultiCurrFlagErrTooltipMsg()}</span>
                          </span>
                        </etools-info-tooltip>
                      </div>
                      <div class="col center-align overflow-hidden">
                        <span class="partnership-status">${partnership.status}</span>
                      </div>
                    </div>
                  `
                )}
              </div>
              <etools-data-table-footer
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
