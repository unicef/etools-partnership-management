import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import 'etools-content-panel/etools-content-panel.js';
import 'etools-dropdown/etools-dropdown.js';
import 'etools-data-table/etools-data-table.js';
import 'etools-info-tooltip/etools-info-tooltip.js';
import 'etools-currency-amount-input/etools-currency-amount-input.js';
import FrNumbersConsistencyMixin from '../../../mixins/fr-numbers-consistency-mixin';
import '../../../../../layout/etools-form-element-wrapper.js';
import { isEmptyObject, isJsonStrMatch, copy } from '../../../../../utils/utils';
import { store, RootState } from '../../../../../../store';
import { connect } from 'pwa-helpers/connect-mixin';
import { SharedStyles } from '../../../../../styles/shared-styles';
import { gridLayoutStyles } from '../../../../../styles/grid-layout-styles';
import { frWarningsStyles } from '../../../styles/fr-warnings-styles';
import { Country, IPermission, GenericObject, LabelAndValue } from '../../../../../../typings/globals.types';
import {Fr, FrsDetails, InterventionPermissionsFields, Intervention } from '../../../../../../typings/intervention.types';
import { pmpCustomIcons } from '../../../../../styles/custom-iconsets/pmp-icons';
import {property, computed} from '@polymer/decorators';

/**
 * @polymer
 * @customElement
 * @appliesMixin EtoolsCurrency
 * @appliesMixin FrNumbersConsistencyMixin
 */
class PlannedBudget extends connect(store)(
  FrNumbersConsistencyMixin(
  PolymerElement)) {

  static get template() {
    return html`
      ${pmpCustomIcons}
      ${SharedStyles} ${gridLayoutStyles} ${frWarningsStyles}
      <style include="data-table-styles">
        [hidden] {
          display: none !important;
        }

        :host {
          --list-column-label: {
            margin-right: 0;
          };
          display: block;
          width: 100%;
          -webkit-box-sizing: border-box;
          -moz-box-sizing: border-box;
          box-sizing: border-box;
        }

        #edit-btns paper-icon-button {
          color: var(--light-icon-color);
        }

        .currency {
          width: 200px;
        }

        etools-currency-amount-input {
          max-width: 175px;
        }

        .total {
          width: 200px;
        }

        #currencyDd {
          width: 130px;
        }

        .totalLabel {
          font-size: 16px;
          margin-top: -3px;
        }

        .totalLabel,
        .totalLabelUsd {
          padding-right: 10px;
        }

        /* Fixes alignment issues on IE */
        *[slot="row-data"] .col-data {
          line-height: 1.5;
        }

        #unicef-cash-val {
          overflow: hidden;
        }
      </style>
      <etools-content-panel panel-title="Planned Budget">
        <div slot="panel-btns" id="edit-btns">
          <paper-icon-button icon="cancel"
                              hidden$="[[!_showCancelBtn(_showCancelButton)]]"
                              title="Cancel"
                              on-click="_cancelEdit">
          </paper-icon-button>
          <paper-icon-button icon="create"
                              hidden$="[[!_visibleEditBtn]]"
                              title="Edit"
                              on-click="_editPlannedBudget">
          </paper-icon-button>
        </div>

        <div class="list-container form-fields">
          <etools-data-table-header id="listHeader"
                                    no-collapse
                                    no-title>
            <etools-data-table-column class="col-3 currency"> Currency</etools-data-table-column>
            <etools-data-table-column class="col-3 right-align"> CSO Contribution</etools-data-table-column>
            <etools-data-table-column class="col-2 right-align"> UNICEF Cash</etools-data-table-column>
            <etools-data-table-column class="col-2 right-align"> UNICEF Supply</etools-data-table-column>
            <etools-data-table-column class="col-2 right-align"> TOTAL</etools-data-table-column>
          </etools-data-table-header>

          <etools-data-table-row no-collapse>
            <div slot="row-data">
              <span class="col-data col-3 currency">
                <etools-info-tooltip class="fr-nr-warn currency-mismatch"
                                      icon-first
                                      custom-icon
                                      hide-tooltip="[[_hideBudgetCurrencyMismatchTooltip(intervention.frs_details.currencies_match, intervention.frs_details.frs, plannedBudget.currency)]]">
                  <etools-dropdown id="currencyDd"
                                    slot="field"
                                    placeholder="&#8212;"
                                    options="[[currencies]]"
                                    selected="{{plannedBudget.currency}}"
                                    readonly$="[[_isCurrencyReadonly(intervention.in_amendment, editMode, editablePlannedBudget, interventionId)]]"
                                    no-label-float>
                  </etools-dropdown>
                  <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                  <span slot="message">[[frsConsistencyWarnings.currencyMismatch]]</span>
                </etools-info-tooltip>
              </span>

              <span class="col-data col-3 right-align">
                <template is="dom-if" if="[[!_isReadonly(editMode, editablePlannedBudget, interventionId)]]">
                  <etools-currency-amount-input id="csoCont"
                                                value="{{plannedBudget.partner_contribution_local}}"
                                                type="number"
                                                placeholder="&#8212;"
                                                no-label-float>
                  </etools-currency-amount-input>
                </template>

                <template is="dom-if" if="[[_isReadonly(editMode, editablePlannedBudget, interventionId)]]">
                  <etools-form-element-wrapper no-label-float
                                                id="cso-cont"
                                                value="[[displayCurrencyAmount(plannedBudget.partner_contribution_local, '0.00')]]">
                  </etools-form-element-wrapper>
                </template>

              </span>

              <span class="col-data col-2 right-align">
                <etools-info-tooltip class="fr-nr-warn"
                                      custom-icon
                                      icon-first
                                      form-field-align="[[!_isReadonly(unicefCashEditMode, editablePlannedBudget, interventionId)]]"
                                      hide-tooltip$="[[!frsConsistencyWarningIsActive(_frsConsistencyWarning)]]">
                  <div slot="field" id="unicef-cash-val" class="right-align">
                    <template is="dom-if" if="[[_isReadonly(unicefCashEditMode, editablePlannedBudget, interventionId)]]">
                      <!-- readonly unicef cash -->
                      <etools-form-element-wrapper no-label-float
                                                    id="unicef-cash"
                                                    value="[[displayCurrencyAmount(plannedBudget.unicef_cash_local, '0.00')]]">
                      </etools-form-element-wrapper>
                    </template>
                    <template is="dom-if"
                              if="[[!_isReadonly(unicefCashEditMode, editablePlannedBudget, interventionId)]]">
                      <!-- editable unicef cash -->
                      <etools-currency-amount-input id="unicefCash"
                                                    value="{{plannedBudget.unicef_cash_local}}"
                                                    placeholder="&#8212;"
                                                    required$="[[required]]"
                                                    auto-validate
                                                    error-message="UNICEF Cash required"
                                                    no-label-float>
                      </etools-currency-amount-input>
                    </template>
                  </div>
                  <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
                  <span slot="message">[[_frsConsistencyWarning]]</span>
                </etools-info-tooltip>
              </span>

              <span class="col-data col-2 right-align">
                <template is="dom-if" if="[[!_isReadonly(editMode, editablePlannedBudget, interventionId)]]">
                  <etools-currency-amount-input id="inKindAmount"
                                                value="{{plannedBudget.in_kind_amount_local}}"
                                                type="number"
                                                placeholder="&#8212;"
                                                no-label-float>
                  </etools-currency-amount-input>
                </template>

                <template is="dom-if" if="[[_isReadonly(editMode, editablePlannedBudget, interventionId)]]">
                  <etools-form-element-wrapper no-label-float
                                                id="in-kind-amount"
                                                value="[[displayCurrencyAmount(plannedBudget.in_kind_amount_local, '0.00')]]">
                  </etools-form-element-wrapper>
                </template>

              </span>

              <span class="col-data col-2">
                <etools-form-element-wrapper class="right-align" no-label-float
                    value="[[_getPlannedBudgetTotalFormatted(plannedBudget.partner_contribution_local,
                    plannedBudget.unicef_cash_local, plannedBudget.in_kind_amount_local)]]">
                </etools-form-element-wrapper>
              </span>
            </div>
          </etools-data-table-row>
        </div>
      </etools-content-panel>
    `;
  }

  @property({type: Object})
  intervention!: Intervention;

  @property({type: Object, notify: true, observer: PlannedBudget.prototype._plannedBudgetChanged})
  plannedBudget!: PlannedBudget;

  @property({type: Array})
  currencies!: LabelAndValue[];

  @property({type: Boolean, computed: '_getValue(permissions.required.planned_budget)', observer: PlannedBudget.prototype._editModeChanged})
  required!: boolean;

  @property({type: Boolean, computed: '_getValue(permissions.edit.planned_budget)', observer: PlannedBudget.prototype._editModeChanged})
  editMode!: boolean;

  @property({type: Boolean, computed: '_getValue(permissions.edit.planned_budget_unicef_cash)', observer: PlannedBudget.prototype._editModeChanged})
  unicefCashEditMode!: boolean;

  @property({type: Boolean})
  editablePlannedBudget: boolean = false;

  @property({type: Number, observer: PlannedBudget.prototype._interventionIdChanged})
  interventionId!: Number;

  @property({type: Object})
  initialPlannedBudget!: PlannedBudget;

  @property({type: String})
  _frsConsistencyWarning = '';

  @property({type: Boolean})
  _showCancelButton!: boolean;

  @property({type: Object})
  countryData!: Country;

  @computed('editMode', 'unicefCashEditMode', '_showCancelButton', 'interventionId')
  get _visibleEditBtn() {
    return this._showEditBtn();
  }

  @property({type: Object})
  permissions!: IPermission<InterventionPermissionsFields>;

  static get observers() {
    return [
      '_checkFrsAmountConsistency(intervention.frs_details.total_frs_amt, ' +
      'plannedBudget.unicef_cash_local, plannedBudget.currency, intervention.frs_details, intervention.status)',
      '_initLocalCurrency(plannedBudget, countryData)'
    ];
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.currencies, state.commonData!.currencies)) {
      this.currencies = [...state.commonData!.currencies];
    }
    if (!isJsonStrMatch(this.currencies, state.commonData!.countryData)) {
      this.countryData = copy(state.commonData!.countryData);
    }
    if (!isJsonStrMatch(this.permissions, state.pageData!.permissions)) {
      this.permissions = copy(state.pageData!.permissions);
    }
  }
  _getValue(value: any) {
    return value;
  }
  _initLocalCurrency(plannedBudget: any, countryData: Country) {
    if (!plannedBudget || typeof countryData === 'undefined') {
      return;
    }
    if (!plannedBudget.currency && countryData && countryData.local_currency_code) {
      this.set('plannedBudget.currency', countryData.local_currency_code);
    }
  }

  _plannedBudgetChanged(plannedBudget: any) {
    if (typeof plannedBudget === 'undefined') {
      return;
    }
    if (this.interventionId) {
      //* reset flags after Save
      this.set('editablePlannedBudget', false);
      this.set('_showCancelButton', false);
    }
  }

  _cancelEdit() {
    this.plannedBudget = JSON.parse(JSON.stringify(this.initialPlannedBudget));
    this.set('editablePlannedBudget', false);
    this.set('_showCancelButton', false);
  }

  _showCancelBtn(showCancelButton: boolean) {
    return showCancelButton && this.interventionId;
  }

  _showEditBtn(_editMode?: boolean, _unicefCashEditMode?: boolean,
     _showCancelButton?: boolean, _interventionId?: number) {
    return (this.editMode || this.unicefCashEditMode) && !this._showCancelButton && this.interventionId > 0;
  }

  _isReadonly(editMode: boolean, editablePlannedBudget: boolean, interventionId: number) {
    if (!editMode) {
      return true;
    }
    if (!interventionId) {
      return false;
    }
    return !editablePlannedBudget;
  }

  _isCurrencyReadonly(inAmendmentMode: boolean, editMode: boolean,
      editablePlannedBudget: boolean, interventionId: number) {
    return inAmendmentMode ? true : this._isReadonly(editMode, editablePlannedBudget, interventionId);
  }

  _editPlannedBudget() {
    this.set('editablePlannedBudget', true);
    this.set('_showCancelButton', true);
    this.initialPlannedBudget = Object.assign({}, this.plannedBudget);
  }

  // make sure we have the right currency selected when intervention is changed
  _interventionIdChanged(id: any, _old: any) {
    if (typeof id === 'undefined') {
      return;
    }
    this.initialPlannedBudget = Object.assign({}, this.plannedBudget);
    this.editablePlannedBudget = !this.interventionId;
    this.set('_showCancelButton', false);
  }

  _getPlannedBudgetTotal(val1: any, val2: any, val3: any, currency?: string) {
    let t = 0;
    val1 = parseFloat(val1);
    if (!isNaN(val1)) {
      t += val1;
    }
    val2 = parseFloat(val2);
    if (!isNaN(val2)) {
      t += val2;
    }
    val3 = parseFloat(val3);
    if (!isNaN(val3)) {
      t += val3;
    }
    if (typeof currency === 'string' && currency !== '') {
      return t + ' ' + currency;
    }
    return t;
  }

  _getPlannedBudgetTotalFormatted(val1: any, val2: any, val3: any) {
    return this.displayCurrencyAmount(this._getPlannedBudgetTotal(val1, val2, val3), '0', 0);
  }

  // validate fields
  validate() {
    let valid = true;
    let elementsSelectorsToValidate = [
      '#csoCont',
      '#unicefCash',
      '#inKindAmount'
    ];
    elementsSelectorsToValidate.forEach((selector: string) => {
      let el = this.shadowRoot!.querySelector(selector) as PolymerElement & { validate(): boolean};
      if (el && !el.validate()) {
        valid = false;
      }
    });
    return valid;
  }

  // reset validation errors
  resetValidations() {
    let elementsSelectorsToValidate = [
      '#csoCont',
      '#unicefCash',
      '#inKindAmount'
    ];
    elementsSelectorsToValidate.forEach((selector: string) => {
      let el = this.shadowRoot!.querySelector(selector) as PolymerElement;
      if (el) {
        el.set('invalid', false);
      }
    });
  }

  _editModeChanged(newValue: any, oldValue: any) {
    if (newValue !== oldValue) {
      this.updateStyles();
    }
  }

  _checkFrsAmountConsistency(frsTotalAmt: string, unicefCash: string, plannedBudgetCurrency: string,
                              frsDetails: FrsDetails, interventionStatus: string) {
    if (typeof frsTotalAmt === 'undefined' || typeof unicefCash === 'undefined' ||
        typeof plannedBudgetCurrency === 'undefined' || typeof frsDetails === 'undefined' ||
        typeof interventionStatus === 'undefined') {
      return;
    }
    // no frs added || status is closed ||
    // the currency of planned budget is different that frs currency => no warning
    if (this.emptyFrsList(this.intervention, 'interventionDetails') || interventionStatus === 'closed' ||
        !this._frsAndPlannedBudgetCurrenciesMatch(frsDetails.frs, plannedBudgetCurrency)) {
      this.set('_frsConsistencyWarning', '');
      return;
    }

    this.set('_frsConsistencyWarning',
        this.checkFrsAndUnicefCashAmountsConsistency(unicefCash, frsTotalAmt, this.intervention,
            'interventionDetails', true));
  }

  _hideBudgetCurrencyMismatchTooltip(frsCurrencyMatch: boolean, frs: Fr[], plannedBudgetCurrency: string) {
    if (!isEmptyObject(frs)) {
      return this.allCurrenciesMatch(frsCurrencyMatch, frs, plannedBudgetCurrency);
    }
    return true;
  }

}

window.customElements.define('planned-budget', PlannedBudget);
