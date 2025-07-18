import {html, LitElement, PropertyValues} from 'lit';
import {property, customElement, state} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-icons/etools-icon';
import '@unicef-polymer/etools-unicef/src/etools-input/etools-input';

import '@unicef-polymer/etools-unicef/src/etools-content-panel/etools-content-panel';
import '@unicef-polymer/etools-unicef/src/etools-upload/etools-upload';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-unicef/src/etools-date-time/datepicker-lite';

import {store, RootState} from '../../../../../redux/store';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import '../../../../common/components/etools-cp-structure';
import '../../../../common/components/year-dropdown.js';
import pmpEndpoints from '../../../../endpoints/endpoints.js';
import CONSTANTS from '../../../../../config/app-constants';
import CommonMixin from '@unicef-polymer/etools-modules-common/dist/mixins/common-mixin';
import StaffMembersDataMixin from '../../../../common/mixins/staff-members-data-mixin-lit';

import '../../../../endpoints/endpoints.js';

import {requiredFieldStarredStyles} from '../../../../styles/required-field-styles-lit';
import {pageCommonStyles} from '../../../../styles/page-common-styles-lit';

import {layoutStyles} from '@unicef-polymer/etools-unicef/src/styles/layout-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';

import './components/amendments/agreement-amendments.js';
import './components/generate-PCA-dialog.js';
import './components/generate-GTC-dialog';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {partnersDropdownDataSelector} from '../../../../../redux/reducers/partners';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsCpStructure} from '../../../../common/components/etools-cp-structure';
import {MinimalStaffMember} from '../../../../../models/partners.models';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown.js';
import {Agreement, LabelAndValue, PartnerStaffMember} from '@unicef-polymer/etools-types';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {cloneDeep} from '@unicef-polymer/etools-utils/dist/general.util';
import {translate, get as getTranslation} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {EtoolsDropdownMultiEl} from '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi.js';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import get from 'lodash-es/get';
import debounce from 'lodash-es/debounce';
import '@shoelace-style/shoelace/dist/components/switch/switch.js';
import SlSwitch from '@shoelace-style/shoelace/dist/components/switch/switch.js';
import {UploadsMixin} from '@unicef-polymer/etools-unicef/src/etools-upload/uploads-mixin.js';

/**
 * @LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin StaffMembersDataMixin
 * @appliesMixin CommonMixin
 * @appliesMixin UploadsMixin
 */
@customElement('agreement-details')
export class AgreementDetails extends connect(store)(CommonMixin(StaffMembersDataMixin(UploadsMixin(LitElement)))) {
  static get styles() {
    return [layoutStyles];
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
          };
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
          border-inline-end: 1px solid var(--dark-divider-color);
          margin-inline-end: 24px;
          padding-inline-end: 24px;
        }

        .generate-pca[hidden] + .col {
          padding-inline-start: 0;
        }

        #generateMyPca::part(label) {
          font-size: var(--etools-font-size-14, 14px);
          font-weight: 600;
        }

        #generateMyPca::part(base) {
          justify-content: flex-start !important;
        }

        etools-button#cancelAoEdit {
          --sl-color-primary-600: var(--error-color);
        }
        .padd-right {
          padding-inline-end: 16px;
          flex: 1 1 0%;
        }
        .year-coll {
          width: 105px;
        }
        .ssfa-text {
          margin-top: 4px;
          display: block;
        }
        .ssfa-value {
          font-size: var(--etools-font-size-16, 16px);
          color: var(--primary-text-color);
          margin-top: -6px;
        }
        datepicker-lite[readonly],
        paper-input[readonly],
        etools-dropdown[readonly],
        .secondary-btn-wrapper {
          --paper-input-container-underline_-_display: none !important;
          --paper-input-container-underline-focus_-_display: none;
        }
        .row {
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding: 16px 9px;
        }
      </style>

      <etools-content-panel class="content-section" panel-title="${translate('AGREEMENT_DETAILS')}">
        <div class="row  b-border row-second-bg">
          <div class="col-12 col-lg-6 col-md-12 layout-horizontal">
            <div class="padd-right">
              <!-- Agreement Type -->
              <etools-dropdown
                id="agreementType"
                label="${translate('AGREEMENT_TYPE')}"
                placeholder="&#8212;"
                ?hidden="${this._typeMatches(this.agreement.agreement_type, ['SSFA'])}"
                .options="${this.agreementTypes}"
                .selected="${this.agreement.agreement_type}"
                trigger-value-change-event
                @etools-selected-item-changed="${this.onAgreementTypeChanged}"
                hide-search
                ?readonly="${this._isAgreementTypeReadonly(this.agreement)}"
                @focus="${this.resetError}"
                @click="${this.resetError}"
                error-message="${translate('PLEASE_SELECT_AGREEMENT_TYPE')}"
                required
              >
              </etools-dropdown>
              <div ?hidden="${!this._typeMatches(this.agreement.agreement_type, ['SSFA'])}">
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

          <div class="col-12 col-md-6 col-lg-3">
            <!-- Reference Number -->
            <etools-input
              label="${translate('AGREEMENT_REFERENCE_NUMBER')}"
              .value="${this.agreement.agreement_number}"
              .title="${this.agreement.agreement_number}"
              ?hidden="${!this.agreement.id}"
              placeholder="&#8212;"
              readonly
            >
            </etools-input>
          </div>
          ${this._typeMatches(this.agreement.agreement_type, ['PCA', 'GTC'])
            ? html` <div class="col-12 col-md-6 col-lg-3">
                <etools-input
                  placeholder="—"
                  label="${translate('DURATION')} (${translate('SIGNED_DATE')} - ${translate('CP_END_DATE')})"
                  ?hidden="${!this.agreement.id}"
                  readonly
                  .value="${this.getDateDisplayValue(this.agreement.start)} &#8212; ${this.getDateDisplayValue(
                    this.agreement.end
                  )}"
                >
                </etools-input>
              </div>`
            : ''}
        </div>

        <div class="row ">
          <div class="col-12 col-md-6">
            <!-- Partner name -->
            <etools-dropdown
              id="partner"
              label="${translate('PARTNER_NAME')}"
              placeholder="&#8212;"
              .options="${this.filteredPartnerDropdownData}"
              .selected="${this.agreement.partner}"
              trigger-value-change-event
              @etools-selected-item-changed="${this.onAgreementPartnerChanged}"
              ?hidden="${!this.agreement.permissions?.edit.partner}"
              @focus="${this.resetError}"
              @click="${this.resetError}"
              error-message="${translate('PLEASE_SELECT_A_PARTNER')}"
              required
            >
            </etools-dropdown>
            <etools-input
              readonly
              placeholder="—"
              label="${translate('PARTNER_NAME')}"
              ?required="${this.agreement.permissions?.required.partner}"
              ?hidden="${this.agreement.permissions?.edit.partner}"
              .value="${this.agreement.partner_name}"
            >
            </etools-input>
          </div>

          ${this._typeMatches(this.agreement.agreement_type, ['MOU'])
            ? html` <div class="col-12 col-md-6 col-lg-3">
                  <datepicker-lite
                    id="startDateField"
                    label="${translate('START_DATE')}"
                    .value="${this.agreement.start}"
                    max-date="${this.agreement.end}"
                    ?readonly="${!this.agreement.permissions?.edit.start}"
                    ?required="${this.agreement.permissions?.required.start}"
                    selected-date-display-format="D MMM YYYY"
                    fire-date-has-changed
                    @date-has-changed="${(e: CustomEvent) => {
                      this.agreement.start = e.detail.date;
                      this.requestUpdate();
                    }}"
                  >
                  </datepicker-lite>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                  <datepicker-lite
                    id="endDateField"
                    label="${translate('END_DATE')}"
                    .value="${this.agreement.end}"
                    min-date="${this.agreement.start}"
                    ?readonly="${!this.agreement.permissions?.edit.end}"
                    ?required="${this.agreement.permissions?.required.end}"
                    selected-date-display-format="D MMM YYYY"
                    fire-date-has-changed
                    @date-has-changed="${(e: CustomEvent) => {
                      this.agreement.end = e.detail.date;
                      this.requestUpdate();
                    }}"
                  >
                  </datepicker-lite>
                </div>`
            : ''}
          ${this._typeMatches(this.agreement.agreement_type, ['PCA', 'GTC'])
            ? html`
                <div class="col-12 col-md-6">
                  <etools-cp-structure
                    id="cpStructure"
                    module="agreements"
                    .appModuleItem="${this.agreement}"
                    .selectedCp="${this.agreement.country_programme}"
                    @selected-cp-changed="${this.onCountryProgrammeChanged}"
                    @selected-object-cp-changed="${this.onCountryProgrammeObjectChanged}"
                    .editMode="${this.agreement.permissions?.edit.country_programme}"
                    ?required="${this.agreement.permissions?.required.country_programme}"
                  >
                  </etools-cp-structure>
                </div>
              `
            : ''}
        </div>

        <div ?hidden="${this._typeMatches(this.agreement.agreement_type, ['SSFA'])}">
          <div class="row ">
            <div class="col-12 col-md-6">
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
              <etools-input
                readonly
                placeholder="—"
                label="${translate('SIGNED_BY_PARTNER')}"
                ?hidden="${this.agreement.permissions?.edit.partner_manager}"
                .value="${this._getReadonlySignedByPartner(this.staffMembers, this.agreement.partner_manager)}"
              >
              </etools-input>
            </div>
            <div class="col-12 col-md-6 col-lg-3">
              <!-- Signed By Partner Date -->
              <datepicker-lite
                class="w100"
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
          <div class="row ">
            <div class="col-12 col-md-6">
              <!-- Signed By UNICEF -->
              <etools-dropdown
                id="signedByUnicefRepresentative"
                label="${translate('SIGNED_BY_UNICEF_REPRESENTATIVE')}"
                placeholder="&#8212;"
                .options="${this.unicefRepresentatives}"
                option-value="id"
                option-label="name"
                .selected="${this.agreement.signed_by?.id}"
                trigger-value-change-event
                @etools-selected-item-changed="${({detail}: CustomEvent) =>
                  (this.agreement.signed_by = detail.selectedItem)}"
                ?hidden="${!this.agreement.permissions?.edit.signed_by}"
              >
              </etools-dropdown>
              <etools-input
                readonly
                placeholder="—"
                label="${translate('SIGNED_BY_UNICEF_REPRESENTATIVE')}"
                ?hidden="${this.agreement.permissions?.edit.signed_by}"
                .value="${this.agreement.signed_by?.name}"
              >
              </etools-input>
            </div>

            <div class="col-12 col-md-6 col-lg-3">
              <!-- Signed By UNICEF Date -->
              <datepicker-lite
                class="w100"
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

        <div class="row " ?hidden="${this._typeMatches(this.agreement.agreement_type, ['MOU'])}">
          <!-- Partner Authorized Officers (partner staff members) -->
          <etools-dropdown-multi
            class="col-12"
            id="officers"
            label="${translate('PARTNER_AUTHORIZED_OFFICERS')}"
            placeholder="&#8212;"
            .options="${this._getAvailableAuthOfficers(this.staffMembers, this.agreement.authorized_officers)}"
            option-value="id"
            option-label="name"
            .selectedValues="${this.getSelectedAuthOfficeIDs(this.agreement.authorized_officers)}"
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
          <etools-input
            class="col-12"
            readonly
            placeholder="—"
            label="${translate('PARTNER_AUTHORIZED_OFFICERS')}"
            ?required="${this.agreement.permissions?.required.authorized_officers}"
            ?hidden="${this._allowAuthorizedOfficersEditing(
              this.agreement.status,
              this.editMode,
              this.allowAoEditForSSFA
            )}"
            .value="${this.getNames(this.agreement.authorized_officers)}"
          >
          </etools-input>
        </div>

        <div
          class="layout-horizontal row-padding-h"
          ?hidden="${!this._showAoEditBtn(
            this.agreement.status,
            this.editMode,
            this.agreement.permissions?.edit.authorized_officers
          )}"
        >
          <etools-button
            id="editAo"
            variant="text"
            class="no-pad no-marg"
            @click="${this._enableAoEdit}"
            ?hidden="${this.allowAoEditForSSFA}"
          >
            <etools-icon name="create"></etools-icon>
            <span>${translate('AMEND_PARTNER_AUTHORIZED_OFFICERS')}</span>
          </etools-button>
          <etools-button
            id="cancelAoEdit"
            variant="text"
            class="no-pad no-marg"
            @click="${this._cancelAoEdit}"
            ?hidden="${!this.allowAoEditForSSFA}"
          >
            <etools-icon name="cancel"></etools-icon>
            <span>${translate('CANCEL_PARTNER_ATUHOTIZED_OFFICERS_AMENDMENT')}</span>
          </etools-button>
        </div>

        <div class="row ">
          <div class="col-12 col-md-6">
            <etools-input
              label="${translate('AGREEMENT_TERMS_ACKNOWLEDGE_BY')}"
              .value="${this.getAckowledgedBy()}"
              .title="${this.getAckowledgedBy()}"
              ?hidden="${!this.agreement.id}"
              placeholder="&#8212;"
              readonly
            >
            </etools-input>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <sl-switch
              ?checked="${this.agreement.special_conditions_pca}"
              @sl-change="${this.onSpecialConditionsPCAChanged}"
              ?hidden="${!this._typeMatches(this.agreement.agreement_type, ['PCA'])}"
              ?disabled="${!this.agreement.permissions?.edit.special_conditions_pca}"
            >
              ${translate('SPECIAL_CONDITIONS_PCA')}
            </sl-switch>
          </div>
        </div>
        <div class="row  ${this._getTBorderClassIfApplicable(this.agreement.agreement_type)}">
          <div
            class="generate-pca col-12 col-md-6 col-lg-3"
            ?hidden="${!this._showGeneratePcaBtn(
              this.agreement.agreement_type,
              this.isNewAgreement,
              this.agreement.special_conditions_pca,
              this.agreement.status
            )}"
          >
            <!-- Generate PCA -->
            <div style="display:flex;flex-direction:column;">
              <label class="paper-label" aria-hidden="true">${translate('PCA_AGREEMENT_TO_SIGN')}</label>
              <etools-button
                variant="text"
                class="no-pad no-marg"
                id="generateMyPca"
                @click="${this._openGeneratePCADialog}"
              >
                <etools-icon name="refresh"></etools-icon>
                ${translate('GENERATE')}
              </etools-button>
            </div>
          </div>
          <div
            class="generate-pca col-12 col-md-6 col-lg-3"
            ?hidden="${!this.showGenerateGTCBtn(
              this.agreement.agreement_type,
              this.isNewAgreement,
              this.agreement.status
            )}"
          >
            <!-- Generate GTC -->
            <div style="display:flex;flex-direction:column;">
              <label class="paper-label" aria-hidden="true">${translate('GTC_AGREEMENT_TO_SIGN')}</label>
              <etools-button
                variant="text"
                class="no-pad no-marg"
                id="generateMyPca"
                @click="${this._openGenerateGTCDialog}"
              >
                <etools-icon name="refresh"></etools-icon>
                ${translate('GENERATE')}
              </etools-button>
            </div>
          </div>
          <div
            class="generate-pca col-12 col-md-6 col-lg-3 align-items-center"
            ?hidden="${!this._showGeneratePcaWarning(
              this.agreement.agreement_type,
              this.isNewAgreement,
              this.agreement.special_conditions_pca
            )}"
          >
            <span class="type-warning">${this.generatePCAMessage}</span>
          </div>
          <div class="col-6" ?hidden="${this._typeMatches(this.agreement.agreement_type, ['SSFA'])}">
            <etools-upload
              track-upload-status
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
            >
            </etools-upload>
          </div>
          <div
            class="col-12 col-md-6"
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
            .dataItems="${cloneDeep(this.agreement.amendments)}"
            .agreementStart="${this.agreement.start}"
            .agreementType="${this.agreement.agreement_type}"
            .editMode="${this.agreement.permissions?.edit.amendments}"
            .showAuthorizedOfficers="${!this._typeMatches(this.agreement.agreement_type, ['MOU'])}"
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
      setTimeout(() => {
        // Timeout needed because this code might execute before connectedCallback otherwise
        this._agreementChanged(newAgr);
        this.debouncedPartnerChanged(this.agreement.partner);
      });
    }
  }

  @property({type: Boolean})
  editMode = false;

  private _isNewAgreement = false;
  set isNewAgreement(val: boolean) {
    if (this._isNewAgreement !== val) {
      this._isNewAgreement = val;
      this._setDraftStatus(this.editMode, val);
    }
  }
  @property({type: Boolean})
  get isNewAgreement() {
    return this._isNewAgreement;
  }

  @property({type: Array})
  partnersDropdownData!: any[];

  /** Include deleted partners already saved on the agreement */
  @property({type: Array})
  amendedPartnersDropdownData!: any[];

  @state() filteredPartnerDropdownData: any[] = [];

  @property({type: Array})
  agreementTypes!: LabelAndValue[];

  @property({type: Array})
  staffMembers: [] = [];

  @property({type: Array})
  unicefRepresentatives: UnicefRepresentative[] = [];

  @property({type: Object})
  originalAgreementData: Agreement | null = null;

  @property({type: Number})
  oldSelectedPartnerId: number | null = null;

  @property({type: Boolean})
  enableEditForAuthorizedOfficers = false;

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
    this.debouncedPartnerChanged = debounce(this._partnerChanged.bind(this), 70) as any;

    fireEvent(this, 'tab-content-attached');
  }

  stateChanged(state: RootState) {
    if (EtoolsRouter.pageIsNotCurrentlyActive(get(state, 'app.routeDetails'), 'agreements', 'details')) {
      return;
    }

    if (!state.partners) {
      return;
    }

    this.isNewAgreement = state.app?.routeDetails?.params?.agreementId === 'new';
    if (!isJsonStrMatch(this.partnersDropdownData, partnersDropdownDataSelector(state))) {
      this.partnersDropdownData = [...partnersDropdownDataSelector(state)];
      this.amendedPartnersDropdownData = [...this.partnersDropdownData];
    }

    const agreementTypes = (state.commonData!.agreementTypes || []).filter((ag: LabelAndValue) => ag.value !== 'SSFA');
    if (!isJsonStrMatch(this.agreementTypes, agreementTypes)) {
      this.agreementTypes = agreementTypes;
    }

    const ssfaOption = (state.commonData!.agreementTypes || []).find((x) => x.value === 'SSFA');
    if (ssfaOption) {
      this.ssfaTypeText = ssfaOption.label;
    }

    if (
      state.agreements?.unicefRepresentatives &&
      !isJsonStrMatch(state.agreements?.unicefRepresentatives, this.unicefRepresentatives)
    ) {
      this.unicefRepresentatives = cloneDeep(state.agreements?.unicefRepresentatives || []);
    }
  }

  updated(changedProperties: PropertyValues) {
    // @ts-ignore
    if (changedProperties.has('editMode') && changedProperties['editMode'] != undefined) {
      this._editModeChanged(this.editMode);
    }
  }

  resetError(event: any): void {
    event.target.invalid = false;
  }

  _handleSpecialConditionsPca(isSpecialConditionsPCA: boolean, agreementType: string) {
    if (agreementType !== CONSTANTS.AGREEMENT_TYPES.PCA) {
      this.agreement.isSpecialConditionsPCA = false;
    }

    if (isSpecialConditionsPCA) {
      this.generatePCAMessage = getTranslation('PCA_TEMPLATE_NOT_AVAILABLE');
    } else {
      this.generatePCAMessage = getTranslation('SAVE_BEFORE_PCA');
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
    } else {
      // new agreement, update status to draft and reset fields
      this._setDraftStatus(this.editMode, this.isNewAgreement);
    }
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'ag-data'
    });
    this.setPartnersDropdownData();
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

  showGenerateGTCBtn(type: string, isNewAgreement: boolean, status: string) {
    return type === CONSTANTS.AGREEMENT_TYPES.GTC && ((this._isDraft() && !isNewAgreement) || status === 'signed');
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
      this.agreement.authorized_officers = [];
      this.oldSelectedPartnerId = currentPartnerId;
    }
    this.getPartnerStaffMembers(currentPartnerId, showLoading);

    if (this.agreement.id) {
      this.handleUsersNoLongerAvailable(
        this.amendedPartnersDropdownData,
        [{value: this.agreement.partner, label: this.agreement.partner_name}],
        'value',
        'label'
      );
    }
  }

  _getAvailableAuthOfficers(staffMembers: MinimalStaffMember[], agreementAuthorizedOfficers: PartnerStaffMember[]) {
    if (staffMembers instanceof Array && staffMembers.length) {
      this.handleUsersNoLongerAvailable(staffMembers, agreementAuthorizedOfficers, 'id', 'name');
      return staffMembers;
    }

    if (agreementAuthorizedOfficers instanceof Array && agreementAuthorizedOfficers.length) {
      return agreementAuthorizedOfficers.map((s: PartnerStaffMember) => new MinimalStaffMember(s));
    }
    return [];
  }

  handleUsersNoLongerAvailable(availableUsers: any, savedUsers: any, idLabel: string, nameLabel: string) {
    if (!(savedUsers && savedUsers.length > 0 && availableUsers && availableUsers.length > 0)) {
      return false;
    }
    let changed = false;
    savedUsers.forEach((savedUsr: any) => {
      if (availableUsers.findIndex((x: any) => x[idLabel] === savedUsr[idLabel]) < 0) {
        availableUsers.push(savedUsr);
        changed = true;
      }
    });
    if (changed) {
      availableUsers.sort((a: any, b: any) => (a[nameLabel] < b[nameLabel] ? -1 : 1));
    }
    return changed;
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
        return selectedPartner[0].name;
      }
    }
    return '';
  }

  getNames(users: PartnerStaffMember[]) {
    if (!users || !users.length) {
      return '';
    }
    const names = users.map((officer) => officer.first_name + ' ' + officer.last_name);
    return names.join(' | ');
  }

  // Check if agreement type is expected type
  _typeMatches(agreementType: string, expectedType: string[]) {
    return (expectedType || []).includes(agreementType);
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

  _openGenerateGTCDialog() {
    const agreementId = this.agreement && this.agreement.id ? this.agreement.id : null;
    openDialog({
      dialog: 'generate-gtc-dialog',
      dialogData: {
        agreementId: agreementId
      }
    });
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
    (this.shadowRoot?.querySelector('#officers') as EtoolsDropdownMultiEl).resetInvalidState();
    this.allowAoEditForSSFA = false;
    this.agreement.authorized_officers = [...(this.originalAgreementData?.authorized_officers || [])];
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
    if (e.detail.success) {
      const response = e.detail.success;
      this.agreement.attachment = response.id;
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
    if (!this._allowAuthorizedOfficersEditing(this.agreement.status, this.editMode, this.allowAoEditForSSFA)) {
      return;
    }
    if (!isJsonStrMatch(this.agreement.authorized_officers, e.detail.selectedItems)) {
      this.agreement.authorized_officers = e.detail.selectedItems;
      this.requestUpdate();
    }
  }

  onAgreementPartnerChanged(e: CustomEvent) {
    if (!e.detail || !e.detail.selectedItem) {
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
    if (!e.detail || !e.detail.selectedItem) {
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
    this.setPartnersDropdownData();
    this.requestUpdate();
  }

  setPartnersDropdownData() {
    if (this.agreement.agreement_type === 'GTC') {
      this.filteredPartnerDropdownData = this.amendedPartnersDropdownData.filter(
        (partner) => partner.type === 'Government'
      );
    } else {
      this.filteredPartnerDropdownData = this.amendedPartnersDropdownData.filter(
        (partner) =>
          !partner.type ||
          !this._typeMatches(this.agreement.agreement_type, ['PCA']) ||
          partner.type === 'Civil Society Organization'
      );
    }
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
    this.agreement.special_conditions_pca = (e.target! as SlSwitch).checked;
    this._handleSpecialConditionsPca(this.agreement.special_conditions_pca, this.agreement.agreement_type);
  }

  onCountryProgrammeChanged(e: CustomEvent) {
    this.agreement.country_programme = e.detail.value;
  }

  onCountryProgrammeObjectChanged(e: CustomEvent) {
    this.agreement.end = e.detail.value?.to_date;
    this.requestUpdate();
  }

  onReferenceNumberChanged(e: CustomEvent) {
    this.agreement.reference_number_year = e.detail.value;
  }

  getSelectedAuthOfficeIDs(authOff: any) {
    return (authOff || []).map((item: any) => item.id);
  }

  getAckowledgedBy() {
    return this.agreement.terms_acknowledged_by
      ? `${this.agreement.terms_acknowledged_by.first_name} ${this.agreement.terms_acknowledged_by.last_name}`
      : null;
  }
}
