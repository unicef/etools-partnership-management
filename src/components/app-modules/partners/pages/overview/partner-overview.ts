import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import {EtoolsCurrency} from 'etools-currency-amount-input/mixins/etools-currency-mixin.js';
import 'etools-content-panel/etools-content-panel.js';
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import 'etools-info-tooltip/etools-info-tooltip.js';

import CommonMixin from '../../../../mixins/common-mixin.js';
import RiskRatingMixin from '../../../../mixins/risk-rating-mixin.js';
import EventHelperMixin from '../../../../mixins/event-helper-mixin.js';

import {pageCommonStyles} from '../../../../styles/page-common-styles.js';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles.js';
import { SharedStyles } from '../../../../styles/shared-styles.js';

import FrNumbersConsistencyMixin from '../../../interventions/mixins/fr-numbers-consistency-mixin.js';
import { pmpIcons } from '../../../../styles/custom-iconsets/pmp-icons.js';
// <link rel="import" href="../../../interventions/styles/fr-warnings-styles.html">

/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsCurrency
 * @appliesMixin EventHelperMixin
 * @appliesMixin CommonMixin
 * @appliesMixin RiskRatingMixin
 * @appliesMixin FrNumbersConsistencyixin
 */
const PartnerOverviewRequiredMixins = EtoolsMixinFactory.combineMixins([
  EtoolsCurrency,
  EventHelperMixin,
  CommonMixin,
  RiskRatingMixin,
  FrNumbersConsistencyMixin
], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin PartnerOverviewRequiredMixins
 */
class PartnerOverview extends PartnerOverviewRequiredMixins{

  static get template() {
    // language=HTML
    return html`
        ${SharedStyles} ${pageCommonStyles} ${gridLayoutStyles}
      <style>
        :host {
          @apply --layout-vertical;
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
          @apply --layout-vertical;
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
          @apply --layout-vertical;
        }

        .row-h + .row-h {
          margin-top: 0;
          border-top: 1px solid var(--dark-divider-color);
        }

        .full-width {
          width: 100%
        }

        .green {
          color: var(--paper-green-500);
        }

        .partnership-status {
          text-transform: capitalize;
        }

        .block {
          display: block;
        }

        .word-break {
          word-break: break-all;
        }

        .overflow-hidden {
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .timeline-col {
          @apply --layout-vertical;
          @apply --layout-start;
        }

      </style>
        ${pmpIcons}
      <etools-content-panel class="content-section" panel-title="Partner Overview">
        <div class="hact-heading">
          <div class="row-h">
            <div class="col col-6"><strong> TOTAL CASH TRANSFERS </strong></div>
            <div class="col col-2"><strong> PROG.VISIT </strong></div>
            <div class="col col-2"><strong> SPOT CHECK </strong></div>
            <div class="col col-2"><strong> AUDIT </strong></div>
          </div>
          <div class="row-h">
            <div class="col col-2"> Risk Rating</div>
            <div class="col col-2"> Current CP Cycle</div>
            <div class="col col-2"> Current Year (Jan - Dec)</div>
            <div class="col col-2"> Planned / M.R. / Completed</div>
            <div class="col col-2"> Planned / Completed</div>
            <div class="col col-2"> Required / Completed</div>
          </div>
        </div>
        <div class="hact-body">
          <div class="row-h">
            <div class="col col-2 center-align">
              <div class$="[[getRiskRatingClass(partner.rating)]]"> [[getRiskRatingValue(partner.rating)]] </div>
            </div>
            <div class="col col-2 center-align"> $[[displayCurrencyAmount(partner.total_ct_cp, '0', 0)]]</div>
            <div class="col col-2 center-align block"> $[[displayCurrencyAmount(partner.total_ct_ytd, '0', 0)]]</div>
            <div class="col col-2 center-align">
              <strong>
                [[partner.hact_values.programmatic_visits.planned.total]] /
                <span class="green">[[partner.hact_min_requirements.programme_visits]]</span> /
                [[partner.hact_values.programmatic_visits.completed.total]]
              </strong>
            </div>
            <div class="col col-2 center-align">
              <strong>
                <span class="green">[[partner.hact_min_requirements.spot_checks]] </span>
                / [[partner.hact_values.spot_checks.completed.total]]
              </strong>
            </div>
            <div class="col col-2 center-align">
              <strong>
                <span class="green">[[_getMinReqAudits(partner.planned_engagement)]] </span>
                / [[partner.hact_values.audits.completed]]
              </strong>
            </div>
          </div>
        </div>
        <template is="dom-if" if="[[partner.interventions.length]]">
          <div class="hact-heading">
            <div class="row-h">
              <div class="col col-3 word-break left-align">Partnership</div>
              <div class="col col-2 left-align">Start Date - End Date</div>
              <div class="col col-2 right-align">UNICEF Cash</div>
              <div class="col col-2 right-align">FR Amount</div>
              <div class="col col-2 right-align">Actual Disbursement</div>
              <div class="col">Status</div>
            </div>
          </div>
          <div class="hact-body">
            <template is="dom-repeat" items="[[partner.interventions]]" as="partnership">
              <div class="row-h">
                <div class="col col-3 block word-break">
                  <a href="interventions/[[partnership.id]]/details"><strong>[[partnership.number]]</strong></a><br>
                  <span>
                    [[partnership.title]]
                    </span>
                </div>
                <div class="col col-2 center-align timeline-col">
                  <etools-info-tooltip class="fr-nr-warn"
                                       custom-icon
                                       icon-first
                                       hide-tooltip$="[[validateFrsVsInterventionDates(partnership.start, partnership.frs_earliest_start_date)]]">
                    <span slot="field">[[getDateDisplayValue(partnership.start)]]</span>
                    <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                    <span slot="message">[[getFrsStartDateValidationMsg()]]</span>
                  </etools-info-tooltip>
                  <etools-info-tooltip class="fr-nr-warn"
                                       custom-icon
                                       icon-first
                                       hide-tooltip$="[[validateFrsVsInterventionDates(partnership.end, partnership.frs_latest_end_date)]]">
                    <span slot="field">[[getDateDisplayValue(partnership.end)]]</span>
                    <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                    <span slot="message">[[getFrsEndDateValidationMsg()]]</span>
                  </etools-info-tooltip>
                </div>
                <div class="col col-2 right-align">
                  <span class="amount-currency">[[partnership.budget_currency]]</span>
                  <span>[[displayCurrencyAmount(partnership.unicef_cash, '0', 0)]]</span>
                </div>
                <div class="col col-2 right-align">
                  <etools-info-tooltip
                      class$="fr-nr-warn [[getCurrencyMismatchClass(partnership.all_currencies_are_consistent)]] partner-overview"
                      icon-first
                      custom-icon
                      hide-tooltip="[[hideIntListUnicefCashAmountTooltip(partnership.all_currencies_are_consistent, partnership.unicef_cash, partnership.frs_total_frs_amt, partnership, 'interventionsList')]]">
                    <span slot="field"
                          class$="[[getFrsValueNAClass(partnership.fr_currencies_are_consistent)]]">
                      <span class="amount-currency">[[partnership.fr_currency]]</span>
                      <span>[[getFrsTotal(partnership.fr_currencies_are_consistent, partnership.frs_total_frs_amt)]]</span>
                    </span>
                    <iron-icon
                        icon="[[getFrsCurrencyTooltipIcon(partnership.fr_currencies_are_consistent, partnership.fr_currencies_are_consistent)]]"
                        slot="custom-icon"></iron-icon>
                    <span slot="message">
                      <span>[[getIntListUnicefCashAmountTooltipMsg(partnership.all_currencies_are_consistent, partnership.fr_currencies_are_consistent)]]</span>
                    </span>
                  </etools-info-tooltip>
                </div>
                <div class="col col-2 right-align">
                  <etools-info-tooltip class="fr-nr-warn currency-mismatch"
                                       icon-first
                                       custom-icon
                                       hide-tooltip="[[!frsConsistencyWarningIsActive(partnership.multi_curr_flag)]]">
                    <span slot="field" class$="[[getFrsValueNAClass(partnership.multi_curr_flag, 'true')]] partner-overview">
                      <span class="amount-currency">[[partnership.fr_currency]]</span>
                      <span>[[getFrsTotal(partnership.multi_curr_flag, partnership.actual_amount, 'true')]]</span>
                    </span>
                    <iron-icon
                        icon="pmp-custom-icons:not-equal"
                        slot="custom-icon"></iron-icon>
                    <span slot="message">
                      <span>[[getFrsMultiCurrFlagErrTooltipMsg()]]</span>
                    </span>
                  </etools-info-tooltip>
                </div>
                <div class="col center-align overflow-hidden">
                  <span class="partnership-status">[[partnership.status]]</span>
                </div>

              </div>
            </template>
          </div>
        </template>
      </etools-content-panel>

    `;
  }

  static get properties() {
    return {
      partner: Object
    };
  }

  public connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for overview tab elements load,
     * triggered by parent element on stamp or by tap event on tabs
     */
    this.fireEvent('global-loading', {active: false, loadingSource: 'partners-page'});
    this.fireEvent('tab-content-attached');
  }

  public _getMinReqAudits(plannedEngagement: any) {
    return !plannedEngagement ? 0
        : Number(plannedEngagement.scheduled_audit) + Number(plannedEngagement.special_audit);
  }

}

window.customElements.define('partner-overview', PartnerOverview);
