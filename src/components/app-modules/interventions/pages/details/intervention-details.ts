import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import 'etools-info-tooltip/etools-info-tooltip.js';
import 'etools-content-panel/etools-content-panel.js';
import 'etools-dropdown/etools-dropdown.js';
import 'etools-dropdown/etools-dropdown-multi.js';
import 'etools-upload/etools-upload.js';
import 'etools-date-time/datepicker-lite.js';

import '../../../../layout/etools-form-element-wrapper.js';
import '../../../../layout/etools-cp-structure.js';
import '../../../../layout/year-dropdown.js';

import UploadsMixin from '../../../../mixins/uploads-mixin';
import FrNumbersConsistencyMixin from '../../mixins/fr-numbers-consistency-mixin';
import CommonMixin from '../../../../mixins/common-mixin';
import StaffMembersData from '../../../partners/mixins/staff-members-data-mixin';
import EnvironmentFlags from '../../../../environment-flags/environment-flags-mixin';
import MissingDropdownOptionsMixin from '../../../../mixins/missing-dropdown-options-mixin';
import CONSTANTS from '../../../../../config/app-constants';
import { Agreement } from '../../../agreements/agreement.types';
import { Intervention } from '../../../../../typings/intervention.types';
import { fireEvent } from '../../../../utils/fire-custom-event';
import { PolymerElEvent } from '../../../../../typings/globals.types';
import { connect } from 'pwa-helpers/connect-mixin';
import { store, RootState } from '../../../../../store';
import { pageCommonStyles } from '../../../../styles/page-common-styles';
import { gridLayoutStyles } from '../../../../styles/grid-layout-styles';
import { SharedStyles } from '../../../../styles/shared-styles';
import { requiredFieldStarredStyles } from '../../../../styles/required-field-styles';
import { buttonsStyles } from '../../../../styles/buttons-styles';
import { frWarningsStyles } from '../../styles/fr-warnings-styles';
import { isEmptyObject, isJsonStrMatch, copy } from '../../../../utils/utils';

import './components/agreement-selector.js';
import './components/planned-budget.js';
import './components/results/expected-results.js';
import './components/planned-visits.js';
import { setPageDataPermissions } from '../../../../../actions/page-data.js';
import './components/reporting-requirements/partner-reporting-requirements.js';
import './components/grouped-locations-dialog.js';
import { DECREASE_UPLOADS_IN_PROGRESS, INCREASE_UNSAVED_UPLOADS, DECREASE_UNSAVED_UPLOADS } from '../../../../../actions/upload-status.js';
import { pmpCustomIcons } from '../../../../styles/custom-iconsets/pmp-icons.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin CommonMixin
 * @appliesMixin StaffMembersData
 * @appliesMixin EnvironmentFlags
 * @appliesMixin MissingDropdownOptions
 * @appliesMixin FrNumbersConsistencyMixin
 * @appliesMixin UploadsMixin
 */
class InterventionDetails extends connect(store)(EtoolsMixinFactory.combineMixins([
  CommonMixin,
  StaffMembersData,
  EnvironmentFlags,
  MissingDropdownOptionsMixin,
  FrNumbersConsistencyMixin,
  UploadsMixin
], PolymerElement)) {
  [x: string]: any;

  static get template() {
    return html`
      ${pmpCustomIcons}
      ${pageCommonStyles} ${gridLayoutStyles} ${SharedStyles} ${requiredFieldStarredStyles}
      ${buttonsStyles} ${frWarningsStyles}
      <style>
      :host {
        @apply --layout-vertical;
        width: 100%;
      }

      paper-input,
      agreement-selector,
      etools-cp-structure,
      #ref-year {
        width: 100%;
      }

      .expiry-warning {
        @apply --layout-vertical;
        @apply --layout-flex;
        @apply --layout-end-justified;
        padding-bottom: 12px;
        color: var(--error-color);
      }

      paper-toggle-button {
        font-size: 16px;
      }

      div[no-left-padding] {
        padding-left: 0px !important;
      }

      .names-padding {
        padding-right: 15px;
      }

      .see-locations {
        padding-right: 0;
        min-width: 100px;
        @apply --layout-end;
        padding-bottom: 12px;
      }

      .see-locations iron-icon {
        margin-right: 0;
        margin-bottom: 2px;
        --iron-icon-height: 18px;
        --iron-icon-width: 18px;
      }

      .see-locations[disabled] {
        background-color: transparent;
      }

      paper-toggle-button#showInactive {
        --paper-toggle-button-label-color: white;
        --paper-toggle-button-checked-bar-color: white;
        padding-right: 10px;
      }

      div[slot="panel-btns"]#add-show-inactive-btns {
        @apply --layout-horizontal;
      }

      datepicker-lite {
        min-width: 100px; /*IE fix*/
      }

    </style>

    <etools-content-panel class="content-section" panel-title="Partnership Information">
      <div class="row-h">
        <agreement-selector id="agreementSelector"
                            agreement-id="{{intervention.agreement}}"
                            partner-id="{{selectedPartnerId}}"
                            selected-agreement="{{agreement}}"
                            intervention="[[intervention]]"></agreement-selector>
      </div>
      <div class="row-h">
        <div class="col col-6">
          <etools-dropdown id="documentType"
                          label="Document Type"
                          placeholder="&#8212;"
                          options="[[_getCurrentDocTypes(agreement, documentTypes)]]"
                          selected="{{intervention.document_type}}"
                          hide-search
                          readonly$="[[!permissions.edit.document_type]]"
                          required$="[[permissions.required.document_type]]"
                          auto-validate
                          error-message="Document type is required">
          </etools-dropdown>

        </div>

        <div class="col col-2" title$="[[intervention.number]]" hidden$="[[!_showRefYear(intervention.document_type, intervention.status)]]">
          <year-dropdown id="ref-year"
                        label="Ref. Year"
                        selected-year="{{intervention.reference_number_year}}">
          </year-dropdown>
        </div>
        <div class="col flex-c">
          <paper-input id="ref-nr"
                      label="Reference Number"
                      value="[[intervention.number]]"
                      placeholder="&#8212;"
                      readonly></paper-input>
        </div>
      </div>
      <div class="row-h flex-c">
        <!-- Title -->
        <paper-input id="title"
                    label="Title"
                    value="{{intervention.title}}"
                    placeholder="&#8212;"
                    char-counter
                    maxlength="256"
                    readonly$="[[!permissions.edit.title]]"
                    required$="[[permissions.required.title]]"
                    on-focus="_activateAutoValidation"
                    error-message="Please add a title"></paper-input>
      </div>
      <div class="row-h flex-c">
        <div class="col col-6">
          <etools-dropdown-multi id="unicefOffices"
                                label="UNICEF Office(s)"
                                placeholder="&#8212;"
                                options="[[offices]]"
                                option-label="name"
                                option-value="id"
                                selected-values="{{intervention.offices}}"
                                readonly$="[[!permissions.edit.offices]]"
                                required$="[[permissions.required.offices]]"
                                auto-validate
                                error-message="Please select intervention's office(s)">
          </etools-dropdown-multi>
        </div>
        <div class="col col-6">
          <etools-dropdown-multi id="unicefFocalPts"
                                label="UNICEF Focal Point(s)"
                                placeholder="&#8212;"
                                options="[[getCleanEsmmOptions(unicefUsersData, intervention)]]"
                                option-label="name"
                                option-value="id"
                                selected-values="{{intervention.unicef_focal_points}}"
                                readonly$="[[!permissions.edit.unicef_focal_points]]"
                                required$="[[permissions.required.unicef_focal_points]]"
                                auto-validate
                                error-message="Please select UNICEF focal points">
          </etools-dropdown-multi>
        </div>
      </div>
      <div class="row-h flex-c">
        <div class="col col-6">
          <etools-dropdown-multi id="partnerFocalPts"
                                label="Partner Focal Point(s)"
                                placeholder="&#8212;"
                                options="[[staffMembers]]"
                                option-value="id"
                                option-label="name"
                                selected-values="{{intervention.partner_focal_points}}"
                                readonly$="[[!permissions.edit.partner_focal_points]]"
                                required$="[[permissions.required.partner_focal_points]]"
                                auto-validate
                                error-message="Please select partner focal points">
          </etools-dropdown-multi>
        </div>

      </div>
    </etools-content-panel>

    <etools-content-panel class="content-section" panel-title="PD or SSFA Details">
      <div class="row-h flex-c row-second-bg"  hidden$="[[!_showContingencyPd(agreement)]]">
        <div class="col col-3">
          <paper-toggle-button checked="{{intervention.contingency_pd}}"
                              disabled="[[!permissions.edit.contingency_pd]]">Contingency PD
          </paper-toggle-button>
        </div>
        <div class="col col-9" hidden$="[[!intervention.contingency_pd]]">
          <etools-upload label="Activation Letter"
                        file-url="{{intervention.activation_letter_attachment}}"
                        upload-endpoint="[[uploadEndpoint]]"
                        on-upload-finished="_activationLetterUploadFinished"
                        on-upload-started="_onUploadStarted"
                        hidden$="[[_isDraft(intervention.status)]]"
                        show-delete-btn="[[showActivationLetterDeleteBtn(intervention.status, permissions.edit.activation_letter_attachment)]]"
                        on-delete-file="_activationLetterDelete"
                        on-change-unsaved-file="_onChangeUnsavedFile">
          </etools-upload>
        </div>
      </div>
      <div class="row-h row-second-bg" hidden$="[[_isContingencyAndDraft(intervention.contingency_pd, intervention.status)]]">
        <div class="col col-3">
          <!-- Start date -->
          <etools-info-tooltip class="fr-nr-warn"
                              icon-first
                              custom-icon
                              form-field-align
                              hide-tooltip$="[[!frsConsistencyWarningIsActive(_frsStartConsistencyWarning)]]">
            <datepicker-lite slot="field"
                              id="intStart"
                              label="Start date"
                              value="{{intervention.start}}"
                              readonly$="[[!permissions.edit.start]]"
                              required$="[[permissions.required.start]]"
                              error-message="Please select start date"
                              auto-validate>
            </datepicker-lite>
            <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
            <span slot="message">[[_frsStartConsistencyWarning]]</span>
          </etools-info-tooltip>

        </div>
        <div class="col col-3">
          <etools-info-tooltip class="fr-nr-warn"
                              custom-icon
                              icon-first
                              form-field-align
                              hide-tooltip$="[[!frsConsistencyWarningIsActive(_frsEndConsistencyWarning)]]">
            <datepicker-lite slot="field"
                              id="intEnd"
                              label="End date"
                              value="{{intervention.end}}"
                              readonly$="[[!permissions.edit.end]]"
                              required$="[[permissions.required.end]]"
                              error-message="Please select end date"
                              auto-validate>
            </datepicker-lite>
            <iron-icon icon="pmp-custom-icons:not-equal" slot="custom-icon"></iron-icon>
            <span slot="message">[[_frsEndConsistencyWarning]]</span>
          </etools-info-tooltip>
        </div>
        <div class="col col-3" hidden$="[[!intervention.termination_doc_attachment]]">
          <etools-upload label="Termination Notice"
                        file-url="[[intervention.termination_doc_attachment]]"
                        readonly>
          </etools-upload>
        </div>
        <div class="col col-3" hidden$="[[!_showDaysUntilExpiry(intervention.status, agreement, intervention)]]">
          <div class="expiry-warning">
            <span>[[_daysUntilExpiry(intervention.end)]]</span>
          </div>
        </div>
      </div>
      <div class="row-h flex-c">
        <etools-cp-structure id="cpStructure"
                            module="interventions"
                            app-module-item="[[intervention]]"
                            selected-cp="{{intervention.country_programme}}"
                            edit-mode="[[permissions.edit.country_programme]]"
                            required="[[permissions.required.country_programme]]">
        </etools-cp-structure>
      </div>

      <div class="row-h flex-c">
        <etools-dropdown-multi id="sections"
                              label="Section(s)"
                              placeholder="&#8212;"
                              selected-values="{{intervention.sections}}"
                              options="[[sections]]"
                              option-label="name"
                              option-value="id"
                              readonly$="[[!permissions.edit.sections]]"
                              required$="[[permissions.required.sections]]"
                              auto-validate
                              error-message="Please select a section">
        </etools-dropdown-multi>
      </div>

      <template is="dom-if" if="[[!environmentFlags.prp_mode_off]]" restamp>
        <div class="row-h flex-c">
          <etools-form-element-wrapper label="Clusters PD/SSFA Contributes To">
            <template is="dom-repeat" items="[[intervention.cluster_names]]">
              <span class="names-padding">[[item]]</span>
            </template>
          </etools-form-element-wrapper>
        </div>
      </template>

      <div class="row-h flex-c">
        <etools-dropdown-multi id="locations"
                              label="Location(s)"
                              placeholder="&#8212;"
                              selected-values="{{intervention.flat_locations}}"
                              options="[[locations]]"
                              option-label="name"
                              option-value="id"
                              readonly$="[[!permissions.edit.flat_locations]]"
                              required$="[[permissions.required.flat_locations]]"
                              error-message="Please select locations"
                              disable-on-focus-handling>
        </etools-dropdown-multi>
        <paper-button class="secondary-btn see-locations"
                      on-click="_openLocationsDialog"
                      title="See all locations"
                      disabled$="[[_isEmpty(intervention.flat_locations.length)]]">
          <iron-icon icon="add"></iron-icon>
          See all
        </paper-button>
      </div>

    </etools-content-panel>

    <template is="dom-if" if="[[!environmentFlags.prp_mode_off]]" restamp>
      <etools-content-panel class="content-section"
                            panel-title="PD Output or SSFA Expected Results ([[noOfPdOutputs]])">
        <template is="dom-if" if="[[!newIntervention]]">
          <div slot="panel-btns" id="add-show-inactive-btns">
            <paper-toggle-button id="showInactive"
                                hidden$="[[!thereAreInactiveIndicators]]"
                                checked="{{showInactiveIndicators}}">
              Show Inactive
            </paper-toggle-button>
            <template is="dom-if" if="[[permissions.edit.result_links]]">
              <paper-icon-button icon="add-box"
                                title="Add"
                                on-click="openCpOutputAndRamIndicatorsDialog">
              </paper-icon-button>
            </template>
          </div>
          <expected-results id="expectedResults"
                            data-items="{{intervention.result_links}}"
                            selected-cp-structure="[[intervention.country_programme]]"
                            intervention-id="[[intervention.id]]"
                            intervention-status="[[intervention.status]]"
                            indicator-location-options="[[originalIntervention.flat_locations]]"
                            indicator-section-options="[[originalIntervention.sections]]"
                            show-inactive-indicators="[[showInactiveIndicators]]"
                            edit-mode="[[permissions.edit.result_links]]"
                            editable-cpo-ram-indicators="[[_canEditCpoRamIndicators(userEditPermission, intervention.status)]]"
                            on-indicators-changed="_onIndicatorsChanged">
          </expected-results>
        </template>
        <template is="dom-if" if="[[newIntervention]]">
          <div class="row-h">
            <p>You must save this PD/SSFA before you can add expected results.</p>
          </div>
        </template>
      </etools-content-panel>
    </template>

    <planned-budget id="plannedBudget"
                    class="content-section"
                    planned-budget="{{intervention.planned_budget}}"
                    intervention-id="[[intervention.id]]"
                    intervention="[[intervention]]">
    </planned-budget>

    <etools-content-panel class="content-section" panel-title="Planned Programmatic Visits">
      <planned-visits id="plannedVisits"
                      data-items="{{intervention.planned_visits}}"
                      edit-mode="[[permissions.edit.planned_visits]]"
                      years="[[years]]">
      </planned-visits>
    </etools-content-panel>

    <template is="dom-if"
              if="[[_showReportingRequirements(environmentFlags.prp_mode_off, permissions.view.reporting_requirements)]]"
              restamp>

      <partner-reporting-requirements class="content-section"
                                      intervention-id="[[intervention.id]]"
                                      intervention-start="[[intervention.start]]"
                                      intervention-end="[[intervention.end]]"
                                      expected-results="[[intervention.result_links]]">
      </partner-reporting-requirements>
    </template>
    `;
  }

  static get properties() {
    return {
      intervention: {
        type: Object,
        observer: '_interventionChanged',
        notify: true
      },
      userEditPermission: Boolean,
      permissions: {
        type: Object,
        statePath: 'pageData.permissions'
      },
      selectedPartnerId: {
        type: Number,
        notify: true,
        observer: '_selectedPartnerIdChanged'
      },
      documentTypes: {
        type: Array,
        statePath: 'interventionDocTypes'
      },
      pcaDocTypes: {
        type: Array,
        value: []
      },
      ssfaDocTypes: {
        type: Array,
        value: []
      },
      sections: {
        type: Array,
        statePath: 'sections'
      },
      offices: {
        type: Array,
        statePath: 'offices'
      },
      unicefUsersData: {
        type: Array,
        statePath: 'unicefUsersData'
      },
      years: {
        type: Array,
        value: []
      },
      agreement: {
        type: Object
      },
      originalIntervention: {
        type: Object
      },
      interventionRequiredField: {
        type: Boolean,
        value: false
      },
      newIntervention: {
        type: Boolean
      },
      fieldsResetted: {
        type: Boolean
      },
      _frsStartConsistencyWarning: {
        type: String,
        value: ''
      },
      _frsEndConsistencyWarning: {
        type: String,
        value: ''
      },
      locations: {
        type: Array,
        statePath: 'locations'
      },
      noOfPdOutputs: {
        type: String,
        value: '0'
      },
      thereAreInactiveIndicators: {
        type: Boolean,
        value: false
      },
      showInactiveIndicators: {
        type: Boolean,
        value: false
      }
    };
  }

  static get observers() {
    return [
      '_newInterventionFlagChanged(newIntervention)',
        '_setYears(intervention.start, intervention.end)',
      '_checkFrsStartConsistency(intervention.frs_details.earliest_start_date, ' +
      'intervention.start, intervention.status)',
      '_checkFrsEndConsistency(intervention.frs_details.latest_end_date, intervention.end, intervention.status)',
      '_contingencyPDChanged(intervention.contingency_pd)',
      '_updateNoOfPdOutputs(intervention.result_links.*)',
      '_updateActivationLetterRequiredFields(intervention.activation_letter_attachment)'
    ];
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.permissions, state.pageData!.permissions)) {
      this.permissions = copy(state.pageData!.permissions);
    }
    if (!isJsonStrMatch(this.documentTypes, state.commonData!.interventionDocTypes)) {
      this.documentTypes = [...state.commonData!.interventionDocTypes];
    }
    if (!isJsonStrMatch(this.sections, state.commonData!.sections)) {
      this.sections = [...state.commonData!.sections];
    }

    if (!isJsonStrMatch(this.offices, state.commonData!.offices)) {
      this.offices = [...state.commonData!.offices];
    }
    if (!isJsonStrMatch(this.unicefUsersData, state.commonData!.unicefUsersData)) {
      this.unicefUsersData = [...state.commonData!.unicefUsersData];
    }
    if (!isJsonStrMatch(this.locations, state.commonData!.locations)) {
      this.locations = [...state.commonData!.locations];
    }
    this.uploadsStateChanged(state);
  }

  ready() {
    super.ready();
    this.locationsDialog = document.createElement('grouped-locations-dialog');
    document.querySelector('body')!.appendChild(this.locationsDialog);
  }

  connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for details tab elements load,
     * triggered by parent element on stamp or by click event on tabs
     */
    fireEvent(this, 'global-loading', {active: false, loadingSource: 'interv-page'});
    this.setDropdownMissingOptionsAjaxDetails(this.$.unicefFocalPts, 'unicefUsers', {dropdown: true});
    fireEvent(this, 'tab-content-attached');
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this.locationsDialog) {
      document.querySelector('body')!.removeChild(this.locationsDialog);
    }
  }
  _showRefYear(pdType: string, status: string) {
    if (this.intervention) {
      if (pdType === 'SSFA') {
        this.set('intervention.reference_number_year', null);
        return false; // no ref year for SSFA
      } else if (!this.intervention.reference_number_year) {
        this.set('intervention.reference_number_year', new Date().getFullYear());
      }
    }
    return ['', 'draft'].indexOf(status) >= 0;
  }

  _updateNoOfPdOutputs() {
    if (!this.intervention.result_links) {
      this.noOfPdOutputs = 0;
      this.thereAreInactiveIndicators = false;
      return;
    }
    this.noOfPdOutputs = this.intervention.result_links.map((rl) => {
      return rl.ll_results.length;
    }).reduce((a: number, b: number) => a + b, 0);

    if (!this.noOfPdOutputs) {
      this.thereAreInactiveIndicators = false;
    } else {
      this.thereAreInactiveIndicators = !!this._getNoOfInactiveIndicators();
    }
  }

  _getNoOfInactiveIndicators() {
    return this.intervention.result_links.map((rl) => {
      return rl.ll_results.map((llr) => {
        return llr.applied_indicators.filter(i => !i.is_active).length;
      }).reduce((a: number, b: number) => a + b, 0);
    }).reduce((a: number, b: number) => a + b, 0);
  }

  openCpOutputAndRamIndicatorsDialog() {
    let expectedResultsElem = this.shadowRoot.querySelector('#expectedResults');
    if (!expectedResultsElem) {
      return;
    }
    expectedResultsElem._addNewCpOutputAndRamIndicators();
  }

  _updateActivationLetterRequiredFields(activationLetterAtt: any) {
    if (activationLetterAtt) {
      this.set('permissions.required.start', true);
      this.set('permissions.required.end', true);
    } else {
      if (this.originalIntervention && this.originalIntervention.permissions) {
        this.set('permissions.required.start', this.originalIntervention.permissions.required.start);
        this.set('permissions.required.end', this.originalIntervention.permissions.required.end);
      }
    }
  }

  _showDaysUntilExpiry(status: string, _agreement: Agreement, _intervention: Intervention) {
    return !this._isTerminated(status);
  }

  _isDraft(status: string) {
    return status === CONSTANTS.STATUSES.Draft.toLowerCase() ||
        status === '';
  }

  _isTerminated(status: string) {
    return status === CONSTANTS.STATUSES.Terminated.toLowerCase();
  }

  _openLocationsDialog() {
    this.locationsDialog.adminLevel = null;
    this.locationsDialog.interventionLocationIds = this.intervention.flat_locations;
    this.locationsDialog.open();
  }

  _contingencyPDChanged(newValue: boolean) {
    if (newValue &&
        this.intervention.status === CONSTANTS.STATUSES.Signed.toLowerCase()) {
      this._updateDatesRequiredState(false);
    } else {
      if ([CONSTANTS.STATUSES.Signed.toLowerCase(),
        CONSTANTS.STATUSES.Active.toLowerCase()].indexOf(this.intervention.status) > -1) {
        this._updateDatesRequiredState(true);
      }
    }
    this.$.intStart.updateStyles();
    this.$.intEnd.updateStyles();
  }

  _updateDatesRequiredState(isRequired: boolean) {
    this.set('intervention.permissions.required.start', isRequired);
    this.set('intervention.permissions.required.end', isRequired);
    store.dispatch(setPageDataPermissions(this.intervention.permissions));
  }

  _showContingencyPd(agreement: Agreement) {
    return agreement && CONSTANTS.AGREEMENT_TYPES.PCA === agreement.agreement_type;
  }

  _initDocTypes(documentTypes: []) {
    if (!(documentTypes instanceof Array && documentTypes.length)) {
      return;
    }
    let pcaTypes = [];
    let ssfaTypes = [];
    documentTypes.forEach((type) => {
      if (type.value !== CONSTANTS.DOCUMENT_TYPES.SSFA) {
        pcaTypes.push(type);
      }
      if (type.value === CONSTANTS.DOCUMENT_TYPES.SSFA) {
        ssfaTypes.push(type);
      }
    });
    this.set('pcaDocTypes', pcaTypes);
    this.set('ssfaDocTypes', ssfaTypes);
  }

  _interventionChanged(intervention: Intervention) {
    if (intervention && typeof intervention === 'object' && Object.keys(intervention).length > 0) {
      if (!intervention.id) {
        this.set('selectedPartnerId', undefined);
      }

      this.set('fieldsResetted', false);
      this._newInterventionFlagChanged();
    }
  }

  _newInterventionFlagChanged() {
    if (this.intervention && !this.fieldsResetted) {
      this._resetValidations();
    }
  }

  _resetValidations() {
    this.$.agreementSelector.resetValidations();
    this.$.documentType.resetInvalidState();
    this.$.plannedBudget.resetValidations();
    this.$.cpStructure.resetCpDropdownInvalidState();

    let fields = ['documentType', 'unicefOffices', 'unicefFocalPts',
      'partnerFocalPts', 'intStart', 'intEnd'];
    if (!this._isIE()) {
      fields.push('title');
    }
    fields.forEach((field) => {
      this.fieldValidationReset('#' + field);
    });

    this._resetIETitleFieldValidation();

    let plannedVisitsEl = this.shadowRoot.querySelector('#plannedVisits');
    if (plannedVisitsEl && typeof plannedVisitsEl.resetValidations === 'function') {
      plannedVisitsEl.resetValidations();
    }
    this.set('fieldsResetted', true);
  }

  _isIE() {
    let appShell = document.querySelector('app-shell');
    return appShell!.classList.contains('ie');
  }

  _resetIETitleFieldValidation() {
    let isIE = this._isIE();
    let title = this.shadowRoot.querySelector('#title');
    if (title && isIE) {
      // IE11 #title style force update
      setTimeout(() => {
        title.set('invalid', false);
        title.updateStyles();
      }, 0);
    }
  }

  _activateAutoValidation(e: PolymerElEvent) {
    e.target.set('autoValidate', true);
  }

  _setYears(interventionStart: string, interventionEnd: string) {
    if (typeof interventionStart === 'string' && interventionStart !== ''
        && typeof interventionEnd === 'string' && interventionEnd !== '') {

      let start = parseInt(interventionStart.substr(0, 4), 10);
      let end = parseInt(interventionEnd.substr(0, 4), 10);
      let years = [];
      while (start <= end) {
        years.push({
          value: start,
          label: start
        });
        start++;
      }
      this.set('years', years);
    } else {
      this.set('years', []);
    }
  }

  _selectedPartnerIdChanged(id: any, oldId: any) {
    if (typeof oldId === 'number'
        && id !== oldId
        && !this.agreement) {
      // Prevent reset on changes caused by initialization of the fields
      this._resetDropdowns();
    }
    this.getPartnerStaffMembers(id);
  }

  _resetDropdowns() {
    // Test case - go to existing intervention , then go to New intervention

    // reset partner focal points options and value
    this.set('intervention.partner_focal_points', []);
    this.set('staffMembers', []);
    let partnerFpDropDown = this.$.partnerFocalPts;
    if (partnerFpDropDown && (!partnerFpDropDown.options || !partnerFpDropDown.options.length)) {
      partnerFpDropDown.value = null;
      partnerFpDropDown.selected = null;
    }
  }

  /**
   * When an agreement is selected then check it's type and update document types dropdown
   */
  _getCurrentDocTypes(agreement: Agreement, documentTypes: string[]) {
    this._initDocTypes(documentTypes);
    let options = documentTypes;
    if (agreement && agreement.agreement_type) {
      switch (agreement.agreement_type) {
        case CONSTANTS.AGREEMENT_TYPES.PCA:
          options = this.pcaDocTypes;
          break;
        case CONSTANTS.AGREEMENT_TYPES.SSFA:
          options = this.ssfaDocTypes;
          break;
        default:
          options = this.documentTypes;
          break;
      }

      this._resetSelectedDocType(options);
    }

    return options;
  }

  _resetSelectedDocType(options: any) {
    if (!this.intervention || !this.intervention.document_type || options === undefined) {
      return;
    }
    if (!options || !options.length) {
      this.set('intervention.document_type', null);
      return;
    }
    let selIsInOptions = options.find(o => o.value === this.intervention.document_type);
    if (!selIsInOptions) {
      this.set('intervention.document_type', null);
    }
  }

  validate() {
    let valid = true;
    let fieldSelectors = ['#agreementSelector', '#documentType', '#title', '#unicefOffices',
      '#unicefFocalPts', '#partnerFocalPts', '#cpStructure', '#sections', '#plannedBudget', '#plannedVisits'];

    if (this._isContingencyAndHasActivationLetter() || this.intervention.status === 'active') {
      fieldSelectors.push('#intStart', '#intEnd');
    }

    if (this.intervention.document_type !== 'SSFA' && this._isDraft(this.intervention.status)) {
      fieldSelectors.push('#ref-year');
    }
    fieldSelectors.forEach(function(selector: string) {
      let field = this.shadowRoot.querySelector(selector);
      if (field && !field.validate()) {
        valid = false;
      }
    }.bind(this));
    return valid;
  }

  _isContingencyAndHasActivationLetter() {
    return this.intervention.contingency_pd &&
      this.intervention.activation_letter_attachment;
  }

  _isContingencyAndDraft(contingency: boolean, status: string) {
    return contingency && this._isDraft(status);
  }

  _daysUntilExpiry(end: string) {
    if (this.isFutureDate(end)) {
      let today = new Date().toString();
      let diff = this.dateDiff(today, end);
      if (diff) {
        return diff + ' days until expiry';
      }
    }
    return '';
  }

  _checkFrsStartConsistency(frsEarliestStartDate: string, interventionStart: string, interventionStatus: string) {
    if (this.newIntervention || this.emptyFrsList(this.intervention)
        || interventionStatus === 'closed') {
      this.set('_frsStartConsistencyWarning', null);
      this.$.intStart.updateStyles();
      return;
    }
    this.set('_frsStartConsistencyWarning', this.checkFrsAndIntervDateConsistency(interventionStart,
        frsEarliestStartDate, this.frsValidationFields.start_date, true));
    this.$.intStart.updateStyles();
  }

  _checkFrsEndConsistency(frsLatestEndDate: string, interventionEnd: string, interventionStatus: string) {
    if (this.newIntervention || this.emptyFrsList(this.intervention)
        || interventionStatus === 'closed') {
      this.set('_frsEndConsistencyWarning', '');
      this.$.intEnd.updateStyles();
      return;
    }
    this.set('_frsEndConsistencyWarning', this.checkFrsAndIntervDateConsistency(interventionEnd,
        frsLatestEndDate, this.frsValidationFields.end_date, true));
    this.$.intEnd.updateStyles();
  }

  _onIndicatorsChanged() {
    if (!this.intervention) {
      return;
    }
    // Override intervention cluster names to cover delete and edit indicators also, besides create
    this.set('intervention.cluster_names', this._extractClusterNamesFromIndicators());

    // Reset intervention, to trigger observers in other components
    // TODO: find a way to get rid of next line
    this.set('intervention', JSON.parse(JSON.stringify(this.intervention)));
  }

  _extractClusterNamesFromIndicators() {
    let clusterNames = new Set();

    this.intervention.result_links.forEach((rl) => {
      if (isEmptyObject(rl.ll_results)) {
        return;
      }
      rl.ll_results.forEach((llResult) => {
        if (isEmptyObject(llResult.applied_indicators)) {
          return;
        }
        llResult.applied_indicators.forEach((indicator) => {
          if (indicator.cluster_name) {
            clusterNames.add(indicator.cluster_name);
          }
        });

      });
    });

    return Array.from(clusterNames);
  }

  _isEmpty(length: number) {
    return !length;
  }

  // permission is true if prp_server_on is true
  _showReportingRequirements(prpModeOff: boolean, permission: boolean) {
    return !prpModeOff && permission;
  }

  _canEditCpoRamIndicators(userEditPermission: boolean, status: string) {
    return userEditPermission &&
        [CONSTANTS.STATUSES.Draft.toLowerCase(),
          CONSTANTS.STATUSES.Signed.toLowerCase(),
          CONSTANTS.STATUSES.Active.toLowerCase()].indexOf(status) > -1;
  }

  _activationLetterUploadFinished(e: CustomEvent) {
    store.dispatch({type: DECREASE_UPLOADS_IN_PROGRESS});
    if (e.detail.success) {
      const response = JSON.parse(e.detail.success);
      this.set('intervention.activation_letter_attachment', response.id);
      store.dispatch({type: INCREASE_UNSAVED_UPLOADS});
    }
  }

  _activationLetterDelete(e: CustomEvent) {
    this.set('intervention.activation_letter_attachment', null);
    store.dispatch({type: DECREASE_UNSAVED_UPLOADS});
  }

  showActivationLetterDeleteBtn(status: string) {
    return this._isDraft(status) && !!this.originalIntervention
            && !this.originalIntervention.activation_letter_attachment;
  }

}

window.customElements.define('intervention-details', InterventionDetails);
