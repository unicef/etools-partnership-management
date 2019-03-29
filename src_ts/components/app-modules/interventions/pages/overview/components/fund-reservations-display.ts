import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-label/iron-label.js';
import {EtoolsCurrency} from 'etools-currency-amount-input/mixins/etools-currency-mixin.js';
import 'etools-info-tooltip/etools-info-tooltip.js';
import 'etools-data-table/etools-data-table.js';

import '../../../mixins/fr-numbers-consistency-mixin.js';
import { gridLayoutStyles } from '../../../../../styles/grid-layout-styles.js';
import { frWarningsStyles } from '../../../styles/fr-warnings-styles.js';
import FrNumbersConsistencyMixin from '../../../mixins/fr-numbers-consistency-mixin.js';
import { isEmptyObject } from '../../../../../utils/utils.js';
import { Intervention, FrsDetails } from '../../../../../../typings/intervention.types.js';
import { pmpCustomIcons } from '../../../../../styles/custom-iconsets/pmp-icons.js';
import CommonMixin from '../../../../../mixins/common-mixin.js';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EtoolsCurrency
 * @appliesMixin CommonMixin
 * @appliesMixin FrNumbersConsistencyMixin
 */
class FundReservationsDisplay extends (EtoolsCurrency(CommonMixin(FrNumbersConsistencyMixin(PolymerElement)))) {

  static get template() {
    return html`
    ${pmpCustomIcons}
    ${gridLayoutStyles} ${frWarningsStyles}
      <style include="data-table-styles">
        :host {
          --list-column-label: {
            margin-right: 0;
          };
        }

        [hidden] {
          display: none !important;
        }

        #totalsRow {
          --list-row-no-collapse: {
            background-color: var(--light-theme-background-color);
          };
          --list-row-wrapper-padding: 0 24px 0 56px;
        }

        #plannedUnicefCash {
          --list-row-wrapper-padding: 0 24px 0 56px;
        }

        #plannedUnicefCash .unicef-cash-col {
          background-color: var(--light-info-color);
          margin-top: -12px;
          margin-bottom: -12px;
          padding-top: 12px;
          padding-bottom: 12px;
          line-height: 16px;
          @apply --layout-vertical;
          @apply --layout-end;
        }

        .unicef-cash-col iron-label {
          font-size: 12px;
          color: var(--secondary-text-color);
          font-weight: bold;
        }

        div[simple-header] > span,
        div[simple-row] > span {
          padding-right: 24px;
        }

        div[simple-header] {
          color: var(--list-secondary-text-color, #757575);
        }

      </style>

      <template is="dom-if" if="[[!frsDetails.frs.length]]">
        <div class="row-h">
          <p>There are no fund reservations added for this intervention.</p>
        </div>
      </template>

      <div class="list-container" hidden$="[[_noFrs(frsDetails)]]">
        <etools-data-table-header id="listHeader"
                                  no-title
                                  hidden$="[[!frsDetails.frs.length]]">
          <etools-data-table-column class="col-2">
            FR#
          </etools-data-table-column>
          <etools-data-table-column class="col-2 right-align">
            FR Posting Date
          </etools-data-table-column>
          <etools-data-table-column class="col-2 right-align">
            FR Currency
          </etools-data-table-column>
          <etools-data-table-column class="col-2 right-align">
            FR Amount
          </etools-data-table-column>
          <etools-data-table-column class="col-2 right-align">
            Actual Disburs.
          </etools-data-table-column>
          <etools-data-table-column class="col-2 right-align">
            Outstanding DCT
          </etools-data-table-column>
        </etools-data-table-header>

        <template is="dom-repeat" items="[[frsDetails.frs]]" as="fr">
          <etools-data-table-row>
            <div slot="row-data">
              <span class="col-data col-2">[[fr.fr_number]]</span>
              <span class="col-data col-2 right-align">[[getDateDisplayValue(fr.start_date)]]</span>
              <span class="col-data col-2 right-align">
                <etools-info-tooltip class="fr-nr-warn currency-mismatch"
                                    icon-first
                                    custom-icon
                                    hide-tooltip="[[hideFrCurrencyTooltip(frsDetails.currencies_match, fr.currency, intervention.planned_budget.currency)]]">
                  <span slot="field">[[fr.currency]]</span>
                  <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                  <span slot="message">
                    <span>[[getFrCurrencyTooltipMsg()]]</span>
                  </span>
                </etools-info-tooltip>
              </span>
              <span class="col-data col-2 right-align">[[displayCurrencyAmount(fr.total_amt_local, '0.00')]] </span>
              <span class="col-data col-2 right-align">
                  <etools-info-tooltip class="fr-nr-warn currency-mismatch"
                                      icon-first
                                      custom-icon
                                      hide-tooltip="[[!frsConsistencyWarningIsActive(fr.multi_curr_flag)]]">
                    <span slot="field" class$="[[getFrsValueNAClass(fr.multi_curr_flag, 'true')]]">
                      [[getFrsTotal(fr.multi_curr_flag, fr.actual_amt_local, 'true')]]
                    </span>
                    <iron-icon icon="pmp-custom-icons:not-equal"
                              slot="custom-icon"></iron-icon>
                    <span slot="message">
                      <span>[[getFrsMultiCurrFlagErrTooltipMsg()]]</span>
                    </span>
                  </etools-info-tooltip>
              </span>
              <span class="col-data col-2 right-align">[[displayCurrencyAmount(fr.outstanding_amt_local, '0.00')]]</span>
            </div>
            <div slot="row-data-details">
              <div class="flex-c" hidden$="[[_isEmpty(fr.line_item_details)]]">
                <div simple-header class="layout-horizontal">
                  <span class="col-2">FR Line Item</span>
                  <span class="col-2">Donor</span>
                  <span class="col-2">Grant</span>
                </div>
                <template is="dom-repeat" items="[[fr.line_item_details]]" as="frInfo">
                  <div simple-row class="layout-horizontal">
                    <span class="col-2">
                      <span>[[fr.fr_number]]-[[frInfo.line_item]]</span>
                    </span>
                    <span class$="col-2 [[_getOtherStyleIfNA(frInfo.donor)]]">
                      <span>[[getValueOrNA(frInfo.donor)]]</span>
                    </span>
                    <span class$="col-2 [[_getOtherStyleIfNA(frInfo.grant_number)]]">
                      <span>[[getValueOrNA(frInfo.grant_number)]]</span>
                    </span>
                  </div>
                </template>
              </div>
              <div class="flex-c" hidden$="[[!_isEmpty(fr.line_item_details)]]">
                There are no details to display.
              </div>
            </div>
          </etools-data-table-row>
        </template>

        <etools-data-table-row no-collapse id="totalsRow">
          <div slot="row-data">
            <span class="col-data col-2"></span>
            <span class="col-data col-2 right-align"><strong>TOTAL of FRs</strong></span>
            <span class="col-data col-2 right-align">
              <etools-info-tooltip class="fr-nr-warn currency-mismatch"
                                  icon-first
                                  custom-icon
                                  hide-tooltip="[[allCurrenciesMatch(frsDetails.currencies_match, frsDetails.frs, intervention.planned_budget.currency)]]">
                <span slot="field" class$="[[getFrsValueNAClass(frsDetails.currencies_match)]]">
                  [[getFrsCurrency(frsDetails.currencies_match, frsDetails.frs)]]
                </span>
                <iron-icon icon="[[getFrsCurrencyTooltipIcon(frsDetails.currencies_match)]]"
                          slot="custom-icon"></iron-icon>
                <span slot="message">[[getFrsCurrencyTooltipMsg(frsDetails.currencies_match)]]</span>
              </etools-info-tooltip>
            </span>
            <span class="col-data col-2 right-align">
              <etools-info-tooltip class="fr-nr-warn"
                                  custom-icon
                                  icon-first
                                  hide-tooltip$="[[hideFrsAmountTooltip(frsDetails.currencies_match, frsDetails.frs, intervention.planned_budget.currency, _frsTotalAmountWarning)]]">
                <span slot="field" class$="[[getFrsValueNAClass(frsDetails.currencies_match)]]">
                  [[getFrsTotal(frsDetails.currencies_match, frsDetails.total_frs_amt)]]
                </span>
                <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                <span slot="message">[[_frsTotalAmountWarning]]</span>
              </etools-info-tooltip>
            </span>
            <span class="col-data col-2 right-align">
              <etools-info-tooltip class="fr-nr-warn currency-mismatch"
                                  icon-first
                                  custom-icon
                                  hide-tooltip="[[!frsConsistencyWarningIsActive(frsDetails.multi_curr_flag)]]">
                <span slot="field" class$="[[getFrsValueNAClass(frsDetails.multi_curr_flag, 'true')]]">
                  [[getFrsTotal(frsDetails.multi_curr_flag, frsDetails.total_actual_amt, 'true')]]
                </span>
                <iron-icon
                    icon="pmp-custom-icons:not-equal"
                    slot="custom-icon"></iron-icon>
                <span slot="message">
                    <span>[[getFrsMultiCurrFlagErrTooltipMsg()]]</span>
                </span>
              </etools-info-tooltip>
            </span>
            <span class$="col-data col-2 right-align [[getFrsValueNAClass(frsDetails.currencies_match)]]">
              [[getFrsTotal(frsDetails.currencies_match, frsDetails.total_outstanding_amt)]]
            </span>
          </div>
        </etools-data-table-row>

        <etools-data-table-row no-collapse id="plannedUnicefCash">
          <div slot="row-data">
            <span class="col-data col-2"></span>
            <span class="col-data col-2 right-align unicef-cash-col">
              <strong>PLANNED</strong><strong>UNICEF CASH</strong>
            </span>
            <span class="col-data col-2 right-align unicef-cash-col">
              <iron-label for="pd-currency">PD Currency</iron-label>
              <span id="pd-currency">[[intervention.planned_budget.currency]]</span>
            </span>
            <span class="col-data col-2 right-align unicef-cash-col">
              <iron-label for="unicef-cash">UNICEF Cash</iron-label>
              <span id="unicef-cash">[[displayCurrencyAmount(intervention.planned_budget.unicef_cash_local, 0.00)]]</span>
            </span>
            <span class="col-data col-4"></span>
          </div>
        </etools-data-table-row>
      </div>
    `;
  }

  static get properties() {
    return {
      intervention: {
        type: Object,
        value: null
      },
      frsDetails: {
        type: Object,
        value: null
      },
      _frsTotalAmountWarning: String
    };
  }

  static get observers() {
    return [
      '_checkFrsAmountConsistency(intervention, frsDetails, intervention.status)'
    ];
  }

  _noFrs(frsDetails: FrsDetails) {
    return (!frsDetails || !frsDetails.frs || !frsDetails.frs.length);
  }

  _checkFrsAmountConsistency(intervention: Intervention, frsDetails: FrsDetails) {
    if (this._noFrs(frsDetails) || !intervention || intervention.status === 'closed') {
      this.set('_frsTotalAmountWarning', '');
      return;
    }
    let warn = this.checkFrsAndUnicefCashAmountsConsistency(intervention.planned_budget!.unicef_cash_local,
        frsDetails.total_frs_amt, intervention, 'interventionDetails', true);
    this.set('_frsTotalAmountWarning', warn);
  }

  getValueOrNA(value: any) {
    return value ? value : 'N/A';
  }

  _getOtherStyleIfNA(value: any) {
    return (value ? '' : 'fr-val-not-available') + ' fund-reservations-display';
  }

  _isEmpty(value: any) {
    return isEmptyObject(value);
  }
}

window.customElements.define('fund-reservations-display', FundReservationsDisplay);
