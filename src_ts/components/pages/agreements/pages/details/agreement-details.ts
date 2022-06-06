/* eslint-disable max-len */
import {customElement, html, LitElement, property, PropertyValues} from 'lit-element';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-input/paper-input-container.js';

import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-upload/etools-upload.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-date-time/datepicker-lite';

import {
  DECREASE_UPLOADS_IN_PROGRESS,
  DECREASE_UNSAVED_UPLOADS,
  INCREASE_UNSAVED_UPLOADS
} from '../../../../../redux/actions/upload-status';
import {store, RootState} from '../../../../../redux/store';
import {connect} from 'pwa-helpers/connect-mixin';
import '../../../../common/components/etools-form-element-wrapper';
import '../../../../common/components/etools-cp-structure';
import '../../../../common/components/year-dropdown.js';
import pmpEndpoints from '../../../../endpoints/endpoints.js';
import CONSTANTS from '../../../../../config/app-constants';
import CommonMixinLit from '../../../../common/mixins/common-mixin-lit';
import UploadsMixin from '@unicef-polymer/etools-modules-common/dist/mixins/uploads-mixin';
import StaffMembersDataMixin from '../../../../common/mixins/staff-members-data-mixin-lit';

import '../../../../endpoints/endpoints.js';

import {requiredFieldStarredStyles} from '../../../../styles/required-field-styles-lit';
import {pageCommonStyles} from '../../../../styles/page-common-styles-lit';
import {buttonsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/button-styles';
import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import './components/amendments/agreement-amendments.js';
import './components/generate-PCA-dialog.js';
import {cloneDeep, isJsonStrMatch} from '@unicef-polymer/etools-modules-common/dist/utils/utils';
import {partnersDropdownDataSelector} from '../../../../../redux/reducers/partners';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {EtoolsCpStructure} from '../../../../common/components/etools-cp-structure';
import {MinimalStaffMember} from '../../../../../models/partners.models';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown';
import {Agreement, LabelAndValue, PartnerStaffMember} from '@unicef-polymer/etools-types';
import {openDialog} from '../../../../utils/dialog';
import {stopGlobalLoading} from '../../../../utils/utils';
import {translate, get as getTranslation} from 'lit-translate';
import {EtoolsDropdownMultiEl} from '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';
import {pageIsNotCurrentlyActive} from '@unicef-polymer/etools-modules-common/dist/utils/common-methods';
import {resetRequiredFields} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';
import get from 'lodash-es/get';
import debounce from 'lodash-es/debounce';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin StaffMembersDataMixin
 * @appliesMixin CommonMixin
 * @appliesMixin UploadsMixin
 */
@customElement('agreement-details')
export class AgreementDetails extends connect(store)(CommonMixinLit(UploadsMixin(StaffMembersDataMixin(LitElement)))) {
  static get styles() {
    return [gridLayoutStylesLit, buttonsStyles];
  }

  render() {
    if (!this.agreement) return;

    return html`
      ${sharedStyles} ${pageCommonStyles} ${requiredFieldStarredStyles}
      <style>
        :host {
          display: flex;
          flex-direction: column;
          width: 100%;
          --esmm-list-wrapper: {
            max-height: 400px;
          }
        }

        .type-warning {
          width: 100%;
          color: var(--warning-color);
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        paper-input,
        etools-cp-structure {
          width: 100%;
        }

        .generate-pca {
          /* TODO:change Generate PCA btn template-this should be applied on form-element-wrapper with width auto */
          border-right: 1px solid var(--dark-divider-color);
          margin-right: 24px;
          padding-right: 24px;
        }

        .generate-pca[hidden] + .col {
          padding-left: 0;
        }

        #generateMyPca {
          cursor: pointer;
        }

        paper-toggle-button {
          font-size: 16px;
        }

        #cancelAoEdit {
          color: var(--error-color);
        }
        .padd-right {
          padding-right: 16px;
        }
        .year-coll {
          width: 105px;
        }
        .ssfa-text {
          margin-top: 4px;
          display: block;
        }
        .ssfa-value {
          font-size: 16px;
          color: var(--primary-text-color);
          margin-top: -6px;
        }
        datepicker-lite[readonly],
        paper-input[readonly],
        etools-dropdown[readonly] {
          --paper-input-container-underline_-_display: none;
          --paper-input-container-underline-focus_-_display: none;
        }
      </style>

      <etools-content-panel class="content-section" panel-title="${translate('AGREEMENT_DETAILS')}">
        <div class="row-h flex-c b-border row-second-bg">
          <div class="col col-6">
            <div class="flex-c padd-right">
              <!-- Agreement Type -->
              <etools-dropdown
                id="agreementType"
                label="${translate('AGREEMENT_TYPE')}"
                placeholder="&#8212;"
                ?hidden="${this._typeMatches(this.agreement.agreement_type, 'SSFA')}"
                .options="${this.agreementTypes}"
                .selected="${this.agreement.agreement_type}"
                trigger-value-change-event
                @etools-selected-item-changed="${this.onAgreementTypeChanged}"
                hide-search
                ?readonly="${this._isAgreementTypeReadonly(this.agreement)}"
                ?auto-validate="${this.autoValidate}"
                error-message="${translate('PLEASE_SELECT_AGREEMENT_TYPE')}"
                required
              >
              </etools-dropdown>
              <div ?hidden="${!this._typeMatches(this.agreement.agreement_type, 'SSFA')}">
                <label class="paper-label ssfa-text">${translate('AGREEMENT_TYPE')}</label>
                <label class="paper-label ssfa-value">${this.ssfaTypeText}</label>
              </div>
            </div>
            <div class="year-col" ?hidden="${!this._showYearDropdown(this.agreement.status)}">
              <year-dropdown
                label="${translate('REF_YEAR')}"
                .selectedYear="${this.agreement.reference_number_year}"
                @selected-year-changed="${this.onReferenceNumberChanged}"
              >
              </year-dropdown>
            </div>
          </div>

          <div class="col col-3">
            <!-- Reference Number -->
            <paper-input
              label="${translate('AGREEMENT_REFERENCE_NUMBER')}"
              .value="${this.agreement.agreement_number}"
              .title="${this.agreement.agreement_number}"
              ?hidden="${!this.agreement.id}"
              placeholder="&#8212;"
              readonly
            >
            </paper-input>
          </div>
          ${this._typeMatches(this.agreement.agreement_type, 'PCA')
            ? html` <div class="col col-3">
                <etools-form-element-wrapper2
                  label="${translate('DURATION')} (${translate('SIGNED_DATE')} - ${translate('CP_END_DATE')})"
                  ?hidden="${!this.agreement.id}"
                  .value="${this.getDateDisplayValue(this.agreement.start)} &#8212; ${this.getDateDisplayValue(
                    this.agreement.end
                  )}"
                >
                </etools-form-element-wrapper2>
              </div>`
            : ''}
        </div>

        <div class="row-h flex-c">
          <div class="col col-6">
            <!-- Partner name -->
            <etools-dropdown
              id="partner"
              label="${translate('PARTNER_NAME')}"
              placeholder="&#8212;"
              .options="${this.partnersDropdownData}"
              .selected="${this.agreement.partner}"
              trigger-value-change-event
              @etools-selected-item-changed="${this.onAgreementPartnerChanged}"
              ?hidden="${!this.agreement.permissions?.edit.partner}"
              ?auto-validate="${this.autoValidate}"
              error-message="${translate('PLEASE_SELECT_A_PARTNER')}"
              required
            >
            </etools-dropdown>
            <etools-form-element-wrapper2
              label="${translate('PARTNER_NAME')}"
              ?required="${this.agreement.permissions?.required.partner}"
              ?hidden="${this.agreement.permissions?.edit.partner}"
              .value="${this.agreement.partner_name}"
            >
            </etools-form-element-wrapper2>
          </div>

          ${this._typeMatches(this.agreement.agreement_type, 'MOU')
            ? html` <div class="col col-3">
                  <datepicker-lite
                    id="startDateField"
                    label="${translate('START_DATE')}"
                    .value="${this.agreement.start}"
                    ?readonly="${!this.agreement.permissions?.edit.start}"
                    ?required="${this.agreement.permissions?.required.start}"
                    selected-date-display-format="D MMM YYYY"
                    fire-date-has-changed
                    @date-has-changed="${(e: CustomEvent) => (this.agreement.start = e.detail.date)}"
                  >
                  </datepicker-lite>
                </div>
                <div class="col col-3">
                  <datepicker-lite
                    id="endDateField"
                    label="${translate('END_DATE')}"
                    .value="${this.agreement.end}"
                    ?readonly="${!this.agreement.permissions?.edit.end}"
                    ?required="${this.agreement.permissions?.required.end}"
                    selected-date-display-format="D MMM YYYY"
                    fire-date-has-changed
                    @date-has-changed="${(e: CustomEvent) => (this.agreement.end = e.detail.date)}"
                  >
                  </datepicker-lite>
                </div>`
            : ''}
          ${this._typeMatches(this.agreement.agreement_type, 'PCA')
            ? html`
                <div class="col col-6">
                  <etools-cp-structure
                    id="cpStructure"
                    module="agreements"
                    .appModuleItem="${this.agreement}"
                    .selectedCp="${this.agreement.country_programme}"
                    @selected-cp-changed="${this.onCountryProgrammeChanged}"
                    .editMode="${this.agreement.permissions?.edit.country_programme}"
                    ?required="${this.agreement.permissions?.required.country_programme}"
                  >
                  </etools-cp-structure>
                </div>
              `
            : ''}
        </div>

        <div ?hidden="${this._typeMatches(this.agreement.agreement_type, 'SSFA')}">
          <div class="row-h flex-c">
            <div class="col col-6">
              <!-- Signed By Partner -->
              <etools-dropdown
                id="signedByPartner"
                label="${translate('SIGNED_BY_PARTNER')}"
                placeholder="&#8212;"
                .options="${this.staffMembers}"
                option-value="id"
                option-label="name"
                .selected="${this.agreement.partner_manager}"
                trigger-value-change-event
                @etools-selected-item-changed="${this.onAgreementPartnerManagerChanged}"
                ?hidden="${!this.agreement.permissions?.edit.partner_manager}"
              >
              </etools-dropdown>
              <etools-form-element-wrapper2
                label="${translate('SIGNED_BY_PARTNER')}"
                ?hidden="${this.agreement.permissions?.edit.partner_manager}"
                .value="${this._getReadonlySignedByPartner(this.staffMembers, this.agreement.partner_manager)}"
              >
              </etools-form-element-wrapper2>
            </div>
            <div class="col col-3">
              <!-- Signed By Partner Date -->
              <datepicker-lite
                id="signedByPartnerDateField"
                label="${translate('SIGNED_BY_PARTNER_DATE')}"
                .value="${this.agreement.signed_by_partner_date}"
                ?readonly="${!this.agreement.permissions?.edit.signed_by_partner_date}"
                .maxDate="${this.getCurrentDate()}"
                selected-date-display-format="D MMM YYYY"
                fire-date-has-changed
                @date-has-changed="${(e: CustomEvent) => (this.agreement.signed_by_partner_date = e.detail.date)}"
              >
              </datepicker-lite>
            </div>
          </div>
          <div class="row-h flex-c">
            <div class="col col-6">
              <!-- Signed By UNICEF -->
              <etools-form-element-wrapper2 .value="${translate('SIGNED_BY_UNICEF_AUTHORIZED_OFFICER')}">
              </etools-form-element-wrapper2>
            </div>

            <div class="col col-3">
              <!-- Signed By UNICEF Date -->
              <datepicker-lite
                id="signedByUnicefDateField"
                label="${translate('SIGNED_BY_UNICEF_DATE')}"
                .value="${this.agreement.signed_by_unicef_date}"
                ?readonly="${!this.agreement.permissions?.edit.signed_by_unicef_date}"
                .maxDate="${this.getCurrentDate()}"
                selected-date-display-format="D MMM YYYY"
                fire-date-has-changed
                @date-has-changed="${(e: CustomEvent) => (this.agreement.signed_by_unicef_date = e.detail.date)}"
              >
              </datepicker-lite>
            </div>
          </div>
        </div>

        <div class="row-h flex-c" ?hidden="${this._typeMatches(this.agreement.agreement_type, 'MOU')}">
          <!-- Partner Authorized Officers (partner staff members) -->
          <etools-dropdown-multi
            id="officers"
            label="${translate('PARTNER_AUTHORIZED_OFFICERS')}"
            placeholder="&#8212;"
            .options="${this._getAvailableAuthOfficers(this.staffMembers, this.agreement.authorized_officers)}"
            option-value="id"
            option-label="name"
            .selectedValues="${this.getSelectedAuthOfficers(this.authorizedOfficers)}"
            trigger-value-change-event
            @etools-selected-items-changed="${this.onAuthorizedOfficersChanged}"
            ?hidden="${!this._allowAuthorizedOfficersEditing(
              this.agreement.status,
              this.editMode,
              this.allowAoEditForSSFA
            )}"
            error-message="${translate('PLEASE_ENTER_PARTNER_AUTH_OFFICERS')}"
            ?required="${this.agreement.permissions?.required.authorized_officers}"
            ?auto-validate="${this.enableEditForAuthorizedOfficers}"
          >
          </etools-dropdown-multi>
          <etools-form-element-wrapper2
            label="${translate('PARTNER_AUTHORIZED_OFFICERS')}"
            ?required="${this.agreement.permissions?.required.authorized_officers}"
            ?hidden="${this._allowAuthorizedOfficersEditing(
              this.agreement.status,
              this.editMode,
              this.allowAoEditForSSFA
            )}"
            .value="${this._getReadonlyAuthorizedOfficers(this.agreement, this.authorizedOfficers, this.staffMembers)}"
          >
          </etools-form-element-wrapper2>
        </div>

        <div
          class="layout-horizontal row-padding-h"
          ?hidden="${!this._showAoEditBtn(
            this.agreement.status,
            this.editMode,
            this.agreement.permissions?.edit.authorized_officers
          )}"
        >
          <paper-button
            id="editAo"
            class="secondary-btn"
            @click="${this._enableAoEdit}"
            ?hidden="${this.allowAoEditForSSFA}"
          >
            <iron-icon icon="create"></iron-icon>
            <span>${translate('AMEND_PARTNER_AUTHORIZED_OFFICERS')}</span>
          </paper-button>
          <paper-button
            id="cancelAoEdit"
            class="secondary-btn"
            @click="${this._cancelAoEdit}"
            ?hidden="${!this.allowAoEditForSSFA}"
          >
            <iron-icon icon="cancel"></iron-icon>
            <span>${translate('CANCEL_PARTNER_ATUHOTIZED_OFFICERS_AMENDMENT')}</span>
          </paper-button>
        </div>

        <div class="row-h flex-c">
          <paper-toggle-button
            ?checked="${this.agreement.special_conditions_pca}"
            @checked-changed="${this.onSpecialConditionsPCAChanged}"
            ?hidden="${!this._typeMatches(this.agreement.agreement_type, 'PCA')}"
            ?disabled="${!this.agreement.permissions?.edit.special_conditions_pca}"
          >
            ${translate('SPECIAL_CONDITIONS_PCA')}
          </paper-toggle-button>
        </div>
        <div class="row-h flex-c ${this._getTBorderClassIfApplicable(this.agreement.agreement_type)}">
          <div
            class="generate-pca col col-3"
            ?hidden="${!this._showGeneratePcaBtn(
              this.agreement.agreement_type,
              this.isNewAgreement,
              this.agreement.special_conditions_pca,
              this.agreement.status
            )}"
          >
            <paper-input-container class="form-field-wrapper secondary-btn-wrapper" always-float-label>
              <!-- Generate PCA -->
              <label slot="label" aria-hidden="true">${translate('PCA_AGREEMENT_TO_SIGN')}</label>
              <paper-button
                slot="input"
                class="paper-input-input secondary-btn"
                id="generateMyPca"
                @click="${this._openGeneratePCADialog}"
              >
                <iron-icon icon="refresh"></iron-icon>
                ${translate('GENERATE')}
              </paper-button>
            </paper-input-container>
          </div>
          <div
            class="generate-pca col col-3"
            ?hidden="${!this._showGeneratePcaWarning(
              this.agreement.agreement_type,
              this.isNewAgreement,
              this.agreement.special_conditions_pca
            )}"
          >
            <span class="type-warning">${this.generatePCAMessage}</span>
          </div>
          <div class="col col-6" ?hidden="${this._typeMatches(this.agreement.agreement_type, 'SSFA')}">
            <etools-upload
              label=" ${translate('SIGNED_AGREEMENT')}"
              .fileUrl="${this.agreement.attachment}"
              .uploadEndpoint="${this.uploadEndpoint}"
              @upload-finished="${this._signedAgreementUploadFinished}"
              .showDeleteBtn="${this.showSignedAgDeleteBtn(
                this.agreement.status,
                this.isNewAgreement,
                this.agreement.permissions?.edit.attachment,
                this.originalAgreementData?.attachment
              )}"
              @delete-file="${this._signedAgFileDelete}"
              accept=".doc,.docx,.pdf,.jpg,.png"
              ?readonly="${!this.agreement.permissions?.edit.attachment}"
              ?required="${this.agreement.permissions?.required.attachment}"
              @upload-started="${this._onUploadStarted}"
              @change-unsaved-file="${this._onChangeUnsavedFile}"
            >
            </etools-upload>
          </div>
          <div
            class="col col-6"
            ?hidden="${this._hideTerminationDoc(this.agreement.termination_doc, this.agreement.status)}"
          >
            <etools-upload
              label=" ${translate('TERMINATION_NOTICE')}"
              .fileUrl="${this.agreement.termination_doc}"
              readonly="true"
            >
            </etools-upload>
          </div>
        </div>
      </etools-content-panel>

      ${this._showAmendments(this.agreement.agreement_type, this.agreement.status)
        ? html` <agreement-amendments
            id="agreementAmendments"
            class="content-section"
            .dataItems="${cloneDeep(this.amendments)}"
            .agreementType="${this.agreement.agreement_type}"
            .editMode="${this.agreement.permissions?.edit.amendments}"
            .showAuthorizedOfficers="${!this._typeMatches(this.agreement.agreement_type, 'MOU')}"
            .authorizedOfficers="${this._getAvailableAuthOfficers(
              this.staffMembers,
              this.agreement.authorized_officers
            )}"
          >
          </agreement-amendments>`
        : ''}
    `;
  }

  private _agreement!: Agreement;
  @property({type: Object})
  get agreement() {
    return this._agreement;
  }

  set agreement(newAgr: Agreement) {
    const agrIdChanged = newAgr?.id !== this._agreement?.id;
    const agrChanged = !isJsonStrMatch(newAgr, this._agreement);
    if (agrIdChanged || agrChanged) {
      this._agreement = newAgr;
      if (agrIdChanged) {
        setTimeout(() => {
          // Timeout needed because this code might execute before connectedCallback otherwise
          this._agreementChanged(newAgr);
          this.debouncedPartnerChanged(this.agreement.partner);
        });
      }
    }
  }

  @property({type: Boolean})
  editMode = false;

  private _isNewAgreement = false;
  set isNewAgreement(val: boolean) {
    if (this._isNewAgreement !== val) {
      this._isNewAgreement = val;
      this._isNewAgreementChanged(val);
    }
  }
  @property({type: Boolean})
  get isNewAgreement() {
    return this._isNewAgreement;
  }

  @property({type: Array})
  partnersDropdownData!: any[];

  @property({type: Array})
  agreementTypes!: LabelAndValue[];

  @property({type: Array})
  staffMembers: [] = [];

  @property({type: Array})
  authorizedOfficers!: string[];

  @property({type: Object})
  originalAgreementData: Agreement | null = null;

  // Redundant prop, but doesn't re-render when using directly agreement.amendments
  @property({type: Array})
  amendments: [] = [];

  @property({type: Number})
  oldSelectedPartnerId: number | null = null;

  @property({type: Boolean})
  enableEditForAuthorizedOfficers = false;

  @property({type: Boolean})
  autoValidate = false;

  @property({type: String})
  generatePCAMessage = getTranslation('SAVE_BEFORE_GENERATING_PCA_TEMPLATE');

  @property({type: String})
  ssfaTypeText = 'Small Scale Funding Agreement';

  @property({type: Boolean})
  allowAoEditForSSFA = false;

  @property({type: String})
  uploadEndpoint: string = pmpEndpoints.attachmentsUpload.url;

  private debouncedPartnerChanged!: any;

  connectedCallback() {
    super.connectedCallback();
    this.debouncedPartnerChanged = debounce(this._partnerChanged.bind(this), 50) as any;

    fireEvent(this, 'tab-content-attached');
  }

  stateChanged(state: RootState) {
    if (pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'agreements', 'details')) {
      this.resetOnLeave();
      return;
    }

    if (!state.partners) {
      return;
    }

    this.isNewAgreement = state.app?.routeDetails?.params?.agreementId === 'new';
    if (!isJsonStrMatch(this.partnersDropdownData, partnersDropdownDataSelector(state))) {
      this.partnersDropdownData = [...partnersDropdownDataSelector(state)];
    }

    const agreementTypes = (state.commonData!.agreementTypes || []).filter((ag: LabelAndValue) => ag.value !== 'SSFA');
    if (!isJsonStrMatch(this.agreementTypes, agreementTypes)) {
      this.agreementTypes = agreementTypes;
    }

    const ssfaOption = (state.commonData!.agreementTypes || []).find((x) => x.value === 'SSFA');
    if (ssfaOption) {
      this.ssfaTypeText = ssfaOption.label;
    }

    this.uploadsStateChanged(state);
  }

  updated(changedProperties: PropertyValues) {
    // @ts-ignore
    if (changedProperties.has('editMode') && changedProperties['editMode'] != undefined) {
      this._editModeChanged(this.editMode);
    }
  }

  firstUpdated(changedProperties: PropertyValues): void {
    super.firstUpdated(changedProperties);

    // Disable loading message for details tab elements load,
    // triggered by parent element on stamp
    setTimeout(() => {
      stopGlobalLoading(this, 'ag-page');
    }, 200);
    this.autoValidate = true;
  }

  resetOnLeave() {
    this.staffMembers = [];
    this.agreement = new Agreement();
    this.resetControlsValidation();
  }

  resetControlsValidation() {
    if (this.autoValidate) {
      this.autoValidate = false;
      resetRequiredFields(this);
    }
  }

  authorizedOfficersChanged() {
    fireEvent(this, 'authorized-officers-changed', this.authorizedOfficers);
  }

  _handleSpecialConditionsPca(isSpecialConditionsPCA: boolean, agreementType: string) {
    if (agreementType !== CONSTANTS.AGREEMENT_TYPES.PCA) {
      this.agreement.isSpecialConditionsPCA = false;
    }

    if (isSpecialConditionsPCA) {
      this.generatePCAMessage = 'Generate PCA template not available for Special Conditions PCA';
    } else {
      this.generatePCAMessage = 'Save before generating the PCA template';
    }
  }

  _getTBorderClassIfApplicable(agreementType: string) {
    // * agreement-details class is added for browsers that use shaddy dom
    return (agreementType !== CONSTANTS.AGREEMENT_TYPES.SSFA ? 't-border' : '') + ' agreement-details';
  }

  // Editing Agreement Type is allowed only if Agreement is new/unsaved
  _isAgreementTypeReadonly(agreement: Agreement) {
    return agreement && agreement.id;
  }

  _isNewAgreementChanged(isNew: boolean) {
    this.authorizedOfficers = [];
    this._setDraftStatus(this.editMode, isNew);
  }

  _editModeChanged(editMode: boolean) {
    if (typeof editMode !== 'undefined') {
      this._setDraftStatus(editMode, this.isNewAgreement);
    }
  }

  _setDraftStatus(editMode: boolean, isNewAgreement: boolean) {
    if (editMode && isNewAgreement && this.agreement && !this._isDraft()) {
      this.agreement.status = '';
    }
  }

  _showAmendments(type: string, _status: string) {
    return type === CONSTANTS.AGREEMENT_TYPES.PCA && !this._isDraft();
  }

  // When agreement data is changed we need to check and prepare attached agreement file and
  // display amendments if needed
  _agreementChanged(agreement: Agreement) {
    this.allowAoEditForSSFA = false;

    if (typeof agreement === 'object' && agreement !== null && agreement.id) {
      // prevent wrong new agreement value
      this.isNewAgreement = false;

      this.oldSelectedPartnerId = agreement.partner;

      // keep a copy of the agreement before changes are made and use it later to save only the changes
      this.originalAgreementData = JSON.parse(JSON.stringify(agreement));

      const cpField = this.shadowRoot!.querySelector('#cpStructure') as EtoolsCpStructure;
      if (cpField) {
        cpField.resetCpDropdownInvalidState();
      }
      this.enableEditForAuthorizedOfficers = false;
      this.resetAttachedAgreementElem(agreement);
      this._initAuthorizedOfficers(agreement.authorized_officers!);
    } else {
      // new agreement, update status to draft and reset fields
      this._setDraftStatus(this.editMode, this.isNewAgreement);
      this._resetDropdown('#partner');
      this._resetDropdown('#agreementType');
      this.authorizedOfficers = [];
    }
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'ag-data'
    });
  }

  resetAttachedAgreementElem(agreement: Agreement) {
    // forces etools-upload to redraw the element
    if (!agreement.attachment) {
      this.agreement.attachment = undefined;
    }
  }

  _resetDropdown(selector: string) {
    const field = this.fieldValidationReset(selector, false);
    if (field) {
      field.set('selected', null);
    }
  }

  // Verify if agreement status is 'draft'
  _isDraft() {
    return this.isNewAgreement || (this.agreement && this.agreement.status === 'draft');
  }

  _showYearDropdown(status: string) {
    return status === CONSTANTS.STATUSES.Draft.toLowerCase() || status === '' || status === undefined;
  }

  _allowEdit(agreementStatus: string, editMode?: boolean) {
    editMode = editMode || this.editMode;
    if (!editMode) {
      return false;
    }
    return !(this.agreement && this.agreement!.id! > 0) || (agreementStatus && this._isDraft());
  }

  _showGeneratePcaBtn(type: string, isNewAgreement: boolean, isSpecialConditionsPCA: boolean, status: string) {
    if (isSpecialConditionsPCA) {
      return false;
    }
    return type === CONSTANTS.AGREEMENT_TYPES.PCA && ((this._isDraft() && !isNewAgreement) || status === 'signed');
  }

  _showGeneratePcaWarning(type: string, isNewAgreement: boolean, isSpecialConditionsPCA: boolean) {
    if (type !== CONSTANTS.AGREEMENT_TYPES.PCA) {
      return false;
    }

    return isSpecialConditionsPCA || isNewAgreement;
  }

  _partnerChanged(currentPartnerId: number | null | undefined) {
    if (!currentPartnerId || isNaN(currentPartnerId)) {
      return;
    }

    const showLoading = currentPartnerId !== this.oldSelectedPartnerId;
    this.staffMembers = [];
    if (this.agreement && currentPartnerId !== this.oldSelectedPartnerId) {
      // partner not set or changed, reset related fields
      this.agreement.partner_manager = null;
      this.authorizedOfficers = [];
      this.agreement.authorized_officers = [];
      this.oldSelectedPartnerId = currentPartnerId;
    }
    this.getPartnerStaffMembers(currentPartnerId, showLoading);
  }

  _getAvailableAuthOfficers(staffMembers: MinimalStaffMember[], agreementAuthorizedOfficers: PartnerStaffMember[]) {
    if (staffMembers instanceof Array && staffMembers.length) {
      return staffMembers;
    }
    if (agreementAuthorizedOfficers instanceof Array && agreementAuthorizedOfficers.length) {
      return agreementAuthorizedOfficers.map((s: PartnerStaffMember) => new MinimalStaffMember(s));
    }
    return [];
  }

  _getReadonlySignedByPartner(staffMembers: MinimalStaffMember[], selectedId?: number | null) {
    if (!this.agreement) {
      return '';
    }
    if (this.agreement.partner_signatory) {
      return this.agreement.partner_signatory.first_name + ' ' + this.agreement.partner_signatory.last_name;
    } else if (staffMembers && staffMembers.length) {
      const selectedPartner = staffMembers.filter(function (s: any) {
        return parseInt(s.id) === selectedId || -1;
      });
      if (selectedPartner && selectedPartner.length) {
        return selectedPartner[0];
      }
    }
    return '';
  }

  _getReadonlyAuthorizedOfficers(agreement: Agreement, selection: any[], staffMembers: MinimalStaffMember[]) {
    let ao: (MinimalStaffMember | PartnerStaffMember)[] = [];
    const aoSelected = selection instanceof Array && selection.length > 0;
    if (aoSelected) {
      const selectedIds = selection.map((s) => parseInt(s, 10));
      ao = this._getAvailableAuthOfficers(staffMembers, agreement.authorized_officers!).filter(
        (a: any) => selectedIds.indexOf(parseInt(a.id, 10)) > -1
      );
    } else {
      ao = agreement && agreement.authorized_officers instanceof Array ? agreement.authorized_officers : [];
    }
    if (!ao || !ao.length) {
      return '';
    }
    const names = ao.map((officer: MinimalStaffMember | PartnerStaffMember) =>
      aoSelected ? officer.name : officer.first_name + ' ' + officer.last_name
    );
    return names.join(' | ');
  }

  // Check if agreement type is expected type
  _typeMatches(agreementType: string, expectedType: string) {
    return agreementType === expectedType;
  }

  _openGeneratePCADialog() {
    const agreementId = this.agreement && this.agreement.id ? this.agreement.id : null;
    openDialog({
      dialog: 'generate-pca-dialog',
      dialogData: {
        agreementId: agreementId
      }
    });
  }

  _initAuthorizedOfficers(authOfficers: PartnerStaffMember[]) {
    if (authOfficers instanceof Array && authOfficers.length) {
      this.authorizedOfficers = authOfficers.map(function (authOfficer) {
        return String(authOfficer.id);
      });
      return;
    }
    this.authorizedOfficers = [];
  }

  // set authorized officers field readonly mode
  _allowAuthorizedOfficersEditing(agreementStatus: string, editMode: boolean, allowAoEditForSSFA: boolean) {
    if (!this.agreement || !editMode) {
      return false;
    }
    if (
      this.agreement.agreement_type === CONSTANTS.AGREEMENT_TYPES.SSFA &&
      agreementStatus === CONSTANTS.STATUSES.Signed.toLowerCase()
    ) {
      return !this.agreement.permissions!.edit.authorized_officers ? false : allowAoEditForSSFA;
    } else {
      return this.agreement.permissions!.edit.authorized_officers;
    }
  }

  _showAoEditBtn(status: string, editMode: boolean, permissionsEditAO: boolean | undefined) {
    return (
      this.agreement &&
      this.agreement.agreement_type === CONSTANTS.AGREEMENT_TYPES.SSFA &&
      editMode &&
      permissionsEditAO &&
      status === CONSTANTS.STATUSES.Signed.toLowerCase()
    );
  }

  _enableAoEdit() {
    this.allowAoEditForSSFA = true;
  }

  _cancelAoEdit() {
    this._initAuthorizedOfficers(this.agreement.authorized_officers);
    (this.shadowRoot?.querySelector('#officers') as EtoolsDropdownMultiEl).resetInvalidState();
    this.allowAoEditForSSFA = false;
  }

  // Validate agreement fields
  _validateAgreement() {
    let valid = true;
    const reqFieldsSelectors = ['#partner', '#agreementType', '#officers'];
    if (this.agreement.agreement_type === CONSTANTS.AGREEMENT_TYPES.PCA) {
      reqFieldsSelectors.push('#cpStructure');
    }
    reqFieldsSelectors.forEach((fSelector: string) => {
      const field = this.shadowRoot!.querySelector(fSelector) as EtoolsDropdownEl;
      if (field && !field.validate()) {
        valid = false;
      }
    });
    return valid;
  }

  _signedAgreementUploadFinished(e: CustomEvent) {
    store.dispatch({type: DECREASE_UPLOADS_IN_PROGRESS});
    if (e.detail.success) {
      const response = e.detail.success;
      this.agreement.attachment = response.id;
      store.dispatch({type: INCREASE_UNSAVED_UPLOADS});
    }
  }

  /**
   * Refer to unicef/etools-issues#232
   * For Draft Status, only Change option is available. No delete option is available in Draft.
   */
  showSignedAgDeleteBtn(
    _status: string,
    _isNewAgreement: boolean,
    _editAttPermission?: boolean,
    _originalAtt?: string | null
  ) {
    return _isNewAgreement
      ? true
      : this._isDraft() && !!this.originalAgreementData && !this.originalAgreementData.attachment;
  }

  _signedAgFileDelete() {
    this.agreement.attachment = undefined;
    store.dispatch({type: DECREASE_UNSAVED_UPLOADS});
  }

  getCurrentDate() {
    return new Date();
  }

  _hideTerminationDoc(file: string, status: string) {
    return !file || status !== CONSTANTS.STATUSES.Terminated.toLowerCase();
  }

  onAuthorizedOfficersChanged(e: CustomEvent) {
    if (!e.detail || e.detail.selectedItems == undefined) {
      return;
    }
    this.setAuthorizedOfficers(e.detail.selectedItems.map((i: any) => String(i['id'])));
  }

  setAuthorizedOfficers(ao: string[]) {
    if (!isJsonStrMatch(this.authorizedOfficers, ao)) {
      this.authorizedOfficers = ao;
      this.authorizedOfficersChanged();
    }
  }

  onAgreementPartnerChanged(e: CustomEvent) {
    if (!e.detail || e.detail.selectedItem == undefined) {
      return;
    }
    const newPartner = e.detail.selectedItem ? e.detail.selectedItem.value : null;
    if (this.agreement.partner !== newPartner) {
      this.agreement.partner = newPartner;
      this._partnerChanged(this.agreement.partner);
      this.requestUpdate();
    }
  }

  onAgreementPartnerManagerChanged(e: CustomEvent) {
    if (!e.detail || e.detail.selectedItem == undefined) {
      return;
    }
    if (!this.staffMembers.length && this.agreement.partner_manager) {
      // data is not loaded yet and we already have a partner_manager
      return;
    }
    this.agreement.partner_manager = e.detail.selectedItem ? e.detail.selectedItem.id : null;
  }

  onAgreementTypeChanged(e: CustomEvent) {
    if (!e.detail || e.detail.selectedItem == undefined) {
      return;
    }
    if (this.agreement.agreement_type === 'SSFA') {
      // SSFAs are readonly (legacy agreements)
      return;
    }
    if (e.detail.selectedItem && e.detail.selectedItem.value == this.agreement.agreement_type) {
      return;
    }
    this.agreement.agreement_type = e.detail.selectedItem ? e.detail.selectedItem.value : null;
    this._handleSpecialConditionsPca(this.agreement.special_conditions_pca, this.agreement.agreement_type);
    this.afterAgreementTypeChanged();
    this.requestUpdate();
  }

  afterAgreementTypeChanged() {
    // check edit permissions and continue only if true; no validations in view mode
    if (this.agreement && !this._allowEdit(this.agreement!.status!)) {
      return;
    }

    if (this.agreement.agreement_type !== CONSTANTS.AGREEMENT_TYPES.PCA) {
      // reset country_programme as it's available only for PCA type
      this.agreement.country_programme = null;
    } else {
      const cpField = this.shadowRoot!.querySelector('#cpStructure') as EtoolsCpStructure;
      if (cpField) {
        cpField.setDefaultSelectedCpStructure();
      }
    }
  }

  onSpecialConditionsPCAChanged(e: CustomEvent) {
    this.agreement.special_conditions_pca = e.detail.value;
    this._handleSpecialConditionsPca(this.agreement.special_conditions_pca, this.agreement.agreement_type);
  }

  onCountryProgrammeChanged(e: CustomEvent) {
    this.agreement.country_programme = e.detail.value;
  }

  onReferenceNumberChanged(e: CustomEvent) {
    this.agreement.reference_number_year = e.detail.value;
  }

  getSelectedAuthOfficers(authOff: any) {
    if (authOff !== undefined) {
      return cloneDeep(authOff);
    }
    return undefined;
  }
}
