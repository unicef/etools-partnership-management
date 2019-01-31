import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-input/paper-input.js';
import '@polymer/paper-input/paper-input-container.js';
import '@polymer/paper-button/paper-button.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import '@polymer/paper-toggle-button/paper-toggle-button.js';

import 'etools-content-panel/etools-content-panel.js';
import 'etools-dropdown/etools-dropdown-multi.js';
import 'etools-dropdown/etools-dropdown.js';
import 'etools-upload/etools-upload.js';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import { DECREASE_UPLOADS_IN_PROGRESS } from '../../../../../actions/upload-status';
import { store } from '../../../../../store';
import { connect } from 'pwa-helpers/connect-mixin';
import '../../../../layout/components/etools-form-element-wrapper.js';
import '../../../../layout/components/etools-date-input.js';
import '../../../../layout/components/etools-cp-structure.js';
import '../../../../layout/components/year-dropdown.js';
import pmpEndpoints from '../../../../endpoints/endpoints.js';
import CONSTANTS from '../../../../../config/app-constants';
import CommonMixin from '../../../../mixins/common-mixin';
import UploadMixin from '../../../../mixins/uploads-mixin';
import { Agreement } from '../../agreement.types.js';

import '../../../../config/app-constants.js';
import '../../../../../modules/mixins/missing-dropdown-options-mixin.js';
import '../../../../mixins/common-mixin.js';
import '../../../../endpoints/endpoints.js';
import '../../../../mixins/event-helper-mixin.js';
import '../../../../mixins/uploads-mixin.js';
import '../../../partners/mixins/staff-members-data-mixin.js';

import {requiredFieldStarredStyles} from '../../../../styles/required-field-styles.js';
import {pageCommonStyles} from '../../../../styles/page-common-styles.js';
import {buttonsStyles} from '../../../../styles/buttons-styles.js';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles.js';
import {SharedStyles} from '../../../../styles/shared-styles.js';

import 'components/amendments/agreement-amendments.js';
import 'components/generate-PCA-dialog.js';
import StaffMembersData from '../../../partners/mixins/staff-members-data-mixin.js';
import { StaffMember, MinimalStaffMember } from '../../../../../typings/partner.types';

/**
     * @polymer
     * @mixinFunction
     * @appliesMixin StaffMembersData
     * @appliesMixin CommonMixin
     * @appliesMixin UploadMixin
     */
    const AgreementDetailsRequiredMixins = EtoolsMixinFactory.combineMixins([
      StaffMembersData,
      CommonMixin,
      UploadMixin
    ], PolymerElement);

    /**
     * @polymer
     * @customElement
     * @appliesMixin AgreementDetailsRequiredMixins
     */
    class AgreementDetails extends connect(store)(AgreementDetailsRequiredMixins) {

      static get template() {
        return html`
          ${pageCommonStyles}  ${gridLayoutStyles} ${SharedStyles} ${requiredFieldStarredStyles} ${buttonsStyles}
          <style>
            :host {
              @apply --layout-vertical;
              width: 100%;
              --esmm-list-wrapper: {
                max-height: 400px;
              };
            }

            .type-warning {
              width: 100%;
              color: var(--warning-color);
              @apply --layout-self-center;
              @apply --layout-vertical;
            }

            paper-input,
            etools-date-input,
            etools-cp-structure {
              width: 100%;
            }

            .generate-pca {
              /* TODO: change Generate PCA btn template - this should be applied on etools-form-element-wrapper with width auto */
              border-right: 1px solid var(--dark-divider-color);
              margin-right: 24px;
              padding-right: 24px;
            }

            .generate-pca[hidden] + .col {
              padding-left: 0;
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

          </style>

          <etools-content-panel class="content-section" panel-title="Agreement Details">

            <div class="row-h flex-c b-border row-second-bg">
              <div class="col col-6">
                <div class="flex-c padd-right">
                  <!-- Agreement Type -->
                  <etools-dropdown
                      id="agreementType"
                      label="Agreement Type"
                      placeholder="&#8212;"
                      options="[[agreementTypes]]"
                      selected="{{agreement.agreement_type}}"
                      hide-search
                      readonly$="[[_isAgreementTypeReadonly(agreement)]]"
                      auto-validate
                      error-message="Please select agreement type"
                      required>
                  </etools-dropdown>
                </div>
                <div class="year-col" hidden$="[[!_showYearDropdown(agreement.status)]]">
                    <year-dropdown label="Ref. Year"
                                selected-year="{{agreement.reference_number_year}}">
                    </year-dropdown>
                </div>
            </div>

              <div class="col col-3">
                <!-- Reference Number -->
                <paper-input label="Reference Number"
                            value="[[agreement.agreement_number]]"
                            title$="[[agreement.agreement_number]]"
                            hidden$="[[!agreement.id]]"
                            placeholder="&#8212;"
                            readonly>
                </paper-input>
              </div>
              <template is="dom-if" if="[[_typeMatches(agreement.agreement_type, CONSTANTS.AGREEMENT_TYPES.PCA)]]">
                <div class="col col-3">
                  <etools-form-element-wrapper label="Duration (Signed Date - CP End Date)" hidden$="[[!agreement.id]]"
                                              value="[[prettyDate(agreement.start)]] &#8212; [[prettyDate(agreement.end)]]">
                  </etools-form-element-wrapper>
                </div>
              </template>
            </div>

            <div class="row-h flex-c">
              <div class="col col-6">
                <!-- Partner name -->
                <etools-dropdown
                    id="partner"
                    label="Partner Name"
                    placeholder="&#8212;"
                    options="[[partnersDropdownData]]"
                    selected="{{agreement.partner}}"
                    hidden$="[[!agreement.permissions.edit.partner]]"
                    auto-validate
                    error-message="Please select a partner"
                    required>
                </etools-dropdown>
                <etools-form-element-wrapper label="Partner Name" required$="[[agreement.permissions.required.partner]]"
                                            hidden$="[[agreement.permissions.edit.partner]]"
                                            value="[[agreement.partner_name]]">
                </etools-form-element-wrapper>
              </div>
              <template is="dom-if" if="[[_typeMatches(agreement.agreement_type, CONSTANTS.AGREEMENT_TYPES.MOU)]]" restamp>
                <div class="col col-3">
                  <etools-date-input id="startDateField"
                                    label="Start date"
                                    value="{{agreement.start}}"
                                    readonly$="[[!agreement.permissions.edit.start]]"
                                    no-init show-clear-btn
                                    required$="[[agreement.permissions.required.start]]">
                  </etools-date-input>
                </div>
                <div class="col col-3">
                  <etools-date-input id="endDateField"
                                    label="End date"
                                    value="{{agreement.end}}"
                                    readonly$="[[!agreement.permissions.edit.end]]"
                                    no-init show-clear-btn
                                    required$="[[agreement.permissions.required.end]]">
                  </etools-date-input>
                </div>
              </template>
              <template is="dom-if" if="[[_typeMatches(agreement.agreement_type, CONSTANTS.AGREEMENT_TYPES.PCA)]]" restamp>
                <div class="col col-6">
                  <etools-cp-structure
                      id="cpStructure"
                      module="agreements"
                      app-module-item="[[agreement]]"
                      selected-cp="{{agreement.country_programme}}"
                      edit-mode="[[agreement.permissions.edit.country_programme]]"
                      required$="[[agreement.permissions.required.country_programme]]">
                  </etools-cp-structure>
                </div>
              </template>
            </div>

            <div hidden$="[[_typeMatches(agreement.agreement_type, CONSTANTS.AGREEMENT_TYPES.SSFA)]]">
              <div class="row-h flex-c">
                <div class="col col-6">
                  <!-- Signed By Partner -->
                  <etools-dropdown
                      id="signedByPartner"
                      label="Signed By Partner"
                      placeholder="&#8212;"
                      options="[[staffMembers]]"
                      option-value="id"
                      option-label="name"
                      selected="{{agreement.partner_manager}}"
                      hidden$="[[!agreement.permissions.edit.partner_manager]]">
                  </etools-dropdown>
                  <etools-form-element-wrapper label="Signed By Partner"
                                              hidden$="[[agreement.permissions.edit.partner_manager]]"
                                              value="[[_getReadonlySignedByPartner(staffMembers, agreement.partner_manager)]]">
                  </etools-form-element-wrapper>
                </div>
                <div class="col col-3">
                  <!-- Signed By Partner Date -->
                  <etools-date-input id="signedByPartnerDateField"
                                    label="Signed By Partner Date"
                                    value="{{agreement.signed_by_partner_date}}"
                                    readonly$="[[!agreement.permissions.edit.signed_by_partner_date]]"
                                    no-init show-clear-btn disable-future-dates>
                  </etools-date-input>
                </div>
              </div>
              <div class="row-h flex-c">
                <div class="col col-6">
                  <!-- Signed By UNICEF -->
                  <etools-form-element-wrapper value="Signed by UNICEF Authorized Officer"></etools-form-element-wrapper>
                </div>

                <div class="col col-3">
                  <!-- Signed By UNICEF Date -->
                  <etools-date-input id="signedByUnicefDateField"
                                    label="Signed By UNICEF Date"
                                    value="{{agreement.signed_by_unicef_date}}"
                                    readonly$="[[!agreement.permissions.edit.signed_by_unicef_date]]"
                                    no-init show-clear-btn disable-future-dates>
                  </etools-date-input>
                </div>
              </div>
            </div>

            <div class="row-h flex-c" hidden$="[[_typeMatches(agreement.agreement_type, CONSTANTS.AGREEMENT_TYPES.MOU)]]">
              <!-- Partner Authorized Officers (partner staff members) -->
              <etools-dropdown-multi id="officers"
                                    label="Partner Authorized Officers"
                                    placeholder="&#8212;"
                                    options="[[_getAvailableAuthOfficers(staffMembers, agreement.authorized_officers)]]"
                                    option-value="id"
                                    option-label="name"
                                    selected-values="{{authorizedOfficers}}"
                                    hidden$="[[!_allowAuthorizedOfficersEditing(agreement.status, editMode, allowAoEditForSSFA)]]"
                                    error-message="Please enter Partner Authorized Officer(s)"
                                    required$="[[agreement.permissions.required.authorized_officers]]"
                                    auto-validate$="[[enableEditForAuthorizedOfficers]]">
              </etools-dropdown-multi>
              <etools-form-element-wrapper label="Partner Authorized Officers"
                                          required$="[[agreement.permissions.required.authorized_officers]]"
                                          hidden$="[[_allowAuthorizedOfficersEditing(agreement.status, editMode, allowAoEditForSSFA)]]"
                                          value="[[_getReadonlyAuthorizedOfficers(agreement, authorizedOfficers, staffMembers)]]">
              </etools-form-element-wrapper>
            </div>

            <div class="layout-horizontal row-padding-h"
                hidden$="[[!_showAoEditBtn(agreement.status, editMode, agreement.permissions.edit.authorized_officers)]]">
              <paper-button id="editAo"
                            class="secondary-btn"
                            on-tap="_enableAoEdit"
                            hidden$="[[allowAoEditForSSFA]]">
                <iron-icon icon="create"></iron-icon>
                <span>Amend Partner Authorized Officers</span>
              </paper-button>
              <paper-button id="cancelAoEdit"
                            class="secondary-btn"
                            on-tap="_cancelAoEdit"
                            hidden$="[[!allowAoEditForSSFA]]">
                <iron-icon icon="cancel"></iron-icon>
                <span>Cancel Partner Authorized Officers amendment</span>
              </paper-button>
            </div>

            <div class="row-h flex-c">
              <paper-toggle-button checked="{{agreement.special_conditions_pca}}"
                                  hidden$="[[!_typeMatches(agreement.agreement_type, CONSTANTS.AGREEMENT_TYPES.PCA)]]"
                                  disabled$="[[!agreement.permissions.edit.special_conditions_pca]]">
                Special Conditions PCA
              </paper-toggle-button>
            </div>
            <div class$="row-h flex-c [[_getTBorderClassIfApplicable(agreement.agreement_type)]]">
              <div class="generate-pca col col-3"
                  hidden$="[[!_showGeneratePcaBtn(agreement.agreement_type, isNewAgreement, agreement.special_conditions_pca)]]">
                <paper-input-container
                    class="form-field-wrapper secondary-btn-wrapper"
                    always-float-label>
                  <!-- Generate PCA -->
                  <label slot="label" aria-hidden="true">PCA Agreement to Sign</label>
                  <paper-button slot="input" class="paper-input-input secondary-btn" id="generateMyPca"
                                on-tap="_openGeneratePCADialog">
                    <iron-icon icon="refresh"></iron-icon>
                    GENERATE
                  </paper-button>
                </paper-input-container>
              </div>
              <div class="generate-pca col col-3"
                  hidden$="[[!_showGeneratePcaWarning(agreement.agreement_type, isNewAgreement, agreement.special_conditions_pca)]]">
                <span class="type-warning">[[generatePCAMessage]]</span>
              </div>
              <div class="col col-9" hidden$="[[_typeMatches(agreement.agreement_type, CONSTANTS.AGREEMENT_TYPES.SSFA)]]">
                <etools-upload
                    label="Signed Agreement"
                    file-url="{{agreement.attachment}}"
                    upload-endpoint="[[uploadEndpoint]]"
                    on-upload-finished="_signedAgreementUploadFinished"
                    show-delete-btn="[[showSignedAgDeleteBtn(agreement.status, agreement.permissions.edit.attachment, originalAgreementData.attachment, isNewAgreement)]]"
                    on-delete-file="_signedAgFileDelete"
                    accept=".doc,.docx,.pdf,.jpg,.png"
                    readonly$="[[!agreement.permissions.edit.attachment]]"
                    required$="[[agreement.permissions.required.attachment]]"
                    on-upload-started="_onUploadStarted"
                    on-change-unsaved-file="_onChangeUnsavedFile">
                </etools-upload>
              </div>
            </div>
          </etools-content-panel>

          <template is="dom-if" if="[[_showAmendments(agreement.agreement_type, agreement.status)]]">
            <agreement-amendments id="agreementAmendments"
                                  class="content-section"
                                  data-items="{{agreement.amendments}}"
                                  agreement-type="[[agreement.agreement_type]]"
                                  edit-mode="[[agreement.permissions.edit.amendments]]"
                                  show-authorized-officers="[[!_typeMatches(agreement.agreement_type, CONSTANTS.AGREEMENT_TYPES.MOU)]]"
                                  authorized-officers="[[_getAvailableAuthOfficers(staffMembers, agreement.authorized_officers)]]"
                                  selected-ao="{{authorizedOfficers}}">
            </agreement-amendments>
          </template>
        `;
      }

      static get properties() {
        return {
          agreement: {
            type: Object,
            notify: true,
            observer: '_agreementChanged'
          },
          editMode: {
            type: Boolean,
            value: false,
            observer: '_editModeChanged'
          },
          isNewAgreement: {
            type: Boolean,
            value: false,
            observer: '_isNewAgreementChanged'
          },
          partnersDropdownData: {
            type: Array,
            value: [],
            statePath: 'partnersDropdownData'
          },
          agreementTypes: {
            type: Array,
            value: [],
            statePath: 'agreementTypes'
          },
          staffMembers: {
            type: Array,
            value: []
          },
          authorizedOfficers: {
            type: Array,
            value: [],
            notify: true
          },
          originalAgreementData: {
            type: Object,
            value: null
          },
          amendments: {
            type: Array,
            value: []
          },
          oldSelectedPartnerId: {
            type: Number
          },
          enableEditForAuthorizedOfficers: {
            type: Boolean,
            value: false
          },
          generatePCAMessage: {
            type: String,
            value: 'Save before generating the PCA template'
          },
          allowAoEditForSSFA: {
            type: Boolean,
            value: false
          },
          uploadEndpoint: {
            type: String,
            value: function() {
              return pmpEndpoints.attachmentsUpload.url;
            }
          }
        };
      }

      static get observers() {
        return [
          '_agreementFieldChanged(agreement.*)',
          '_partnerChanged(agreement.partner)',
          '_handleSpecialConditionsPca(agreement.special_conditions_pca, agreement.agreement_type)'
        ];
      }

      ready() {
        super.ready();
        this.generatePCADialog = document.createElement('generate-pca-dialog');
        this.generatePCADialog.setAttribute('id', 'generatePCADialog');
        document.querySelector('body').appendChild(this.generatePCADialog);
      }

      connectedCallback() {
        super.connectedCallback();

        // Disable loading message for details tab elements load,
        // triggered by parent element on stamp
        this.fireEvent('global-loading', {active: false, loadingSource: 'ag-page'});
        this.fireEvent('tab-content-attached');
      }

      disconnectedCallback() {
        super.disconnectedCallback();
        if (this.generatePCADialog) {
          document.querySelector('body').removeChild(this.generatePCADialog);
        }
      }

      _handleSpecialConditionsPca(isSpecialConditionsPCA: boolean, agreementType: string) {
        if (agreementType !== CONSTANTS.AGREEMENT_TYPES.PCA) {
          this.set('agreement.isSpecialConditionsPCA', false);
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
      _isAgreementTypeReadonly() {
        return (this.agreement && this.agreement.id);
      }

      _isNewAgreementChanged(isNew: boolean) {
        this._setDraftStatus(this.editMode, isNew);
      }

      _editModeChanged(editMode: boolean) {
        if (typeof editMode !== 'undefined') {
          this._setDraftStatus(editMode, this.isNewAgreement);
        }
      }

      _setDraftStatus(editMode: boolean, isNewAgreement: boolean) {
        if (editMode && isNewAgreement && this.agreement && !this._isDraft()) {
          this.set('agreement.status', '');
        }
      }

      _showAmendments(type: string, _status: string) {
        return type === CONSTANTS.AGREEMENT_TYPES.PCA && !this._isDraft();
      }

      // When agreement data is changed we need to check and prepare attached agreement file and
      // display amendments if needed
      _agreementChanged(agreement: Agreement) {
        if (this.generatePCADialog) {
          this.generatePCADialog.agreementId = agreement.id;
        }

        this.set('allowAoEditForSSFA', false);

        if (typeof agreement === 'object' && agreement !== null && agreement.id) {
          // prevent wrong new agreement value
          this.set('isNewAgreement', false);

          this.set('oldSelectedPartnerId', agreement.partner);

          // keep a copy of the agreement before changes are made and use it later to save only the changes
          this.set('originalAgreementData', JSON.parse(JSON.stringify(agreement)));

          let cpField = this.shadowRoot.querySelector('#cpStructure');
          if (cpField) {
            cpField.resetCpDropdownInvalidState();
          }
          this.set('enableEditForAuthorizedOfficers', false);
          this.resetAttachedAgreementElem(agreement);
          this._initAuthorizedOfficers(agreement.authorized_officers);
        } else {
          this.set('agreement.attachment', null);
          // new agreement, update status to draft and reset fields
          this._setDraftStatus(this.editMode, this.isNewAgreement);
          this._resetDropdown('#partner');
          this._resetDropdown('#agreementType');
        }
        this.fireEvent('global-loading', {active: false, loadingSource: 'ag-data'});
      }

      resetAttachedAgreementElem(agreement: Agreement) {
        // forces etools-upload to redraw the element
        if (!agreement.attachment) {
          this.set('agreement.attachment', null);
        }
      }

      _resetDropdown(selector: string) {
        let field = this.fieldValidationReset(selector);
        if (field) {
          field.set('selected', null);
        }
      }

      // Verify if agreement status is 'draft'
      _isDraft() {
        return this.isNewAgreement || (this.agreement && this.agreement.status === 'draft');
      }

      _showYearDropdown(status: string) {
        return status === CONSTANTS.STATUSES.Draft.toLowerCase() ||
            status === '' || status === undefined;
      }

      _allowEdit(agreementStatus: string, editMode?: boolean) {
        editMode = editMode || this.editMode;
        if (!editMode) {
          return false;
        }
        return !(this.agreement && this.agreement.id > 0) || (agreementStatus && this._isDraft());
      }

      _showGeneratePcaBtn(type: string, isNewAgreement: boolean, isSpecialConditionsPCA: boolean) {
        if (isSpecialConditionsPCA) {
          return false;
        }
        return type === CONSTANTS.AGREEMENT_TYPES.PCA && this._isDraft() && !isNewAgreement;
      }

      _showGeneratePcaWarning(type: string, isNewAgreement: boolean, isSpecialConditionsPCA: boolean) {
        if (type !== CONSTANTS.AGREEMENT_TYPES.PCA) {
          return false;
        }

        return isSpecialConditionsPCA || isNewAgreement;
      }

      _partnerChanged(currentPartnerId: string) {
        if (typeof currentPartnerId === 'undefined') {
          return;
        }

        this.set('staffMembers', []);
        if (this.agreement && currentPartnerId !== this.oldSelectedPartnerId) {
          // partner not set or changed, reset related fields
          this.set('agreement.partner_manager', null);
          this.set('authorizedOfficers', []);
          this.set('agreement.authorized_officers', []);
          this.set('oldSelectedPartnerId', currentPartnerId);
        }
        this.getPartnerStaffMembers(currentPartnerId);
      }

      // Validate agreements fields on change
      _agreementFieldChanged(agreementProperty: any) {
        if (typeof agreementProperty === 'undefined') {
          return;
        }
        // check edit permissions and continue only if true; no validations in view mode
        if (this.agreement && !this._allowEdit(this.agreement.status)) {
          return;
        }

        if (agreementProperty && agreementProperty.path === 'agreement.agreement_type') {
          if (agreementProperty.value !== CONSTANTS.AGREEMENT_TYPES.PCA) {
            // reset country_programme as it's available only for PCA type
            this.set('agreement.country_programme', null);
            // reset start and end date
            // TODO: decide if we reset start and end dates when type is changed
            // this.set('agreement.start', null);
            // this.set('agreement.end', null);
          } else {
            let cpField = this.shadowRoot.querySelector('#cpStructure');
            if (cpField) {
              cpField.setDefaultSelectedCpStructure();
            }
          }
        }
      }

      _getAvailableAuthOfficers(staffMembers: Array<MinimalStaffMember>, agreementAuthorizedOfficers: Array<StaffMember>) {
        if (staffMembers instanceof Array && staffMembers.length) {
          return staffMembers;
        }
        if (agreementAuthorizedOfficers instanceof Array && agreementAuthorizedOfficers.length) {
          return agreementAuthorizedOfficers.map(function(s:StaffMember) {
            return new MinimalStaffMember(s.id, s.first_name, s.last_name, s.active);
          });
        }
        return [];
      }

      _getReadonlySignedByPartner(staffMembers: Array<MinimalStaffMember>, selectedId: string) {
        if (!this.agreement) {
          return '';
        }
        if (this.agreement.partner_signatory) {
          return this.agreement.partner_signatory.first_name + ' ' + this.agreement.partner_signatory.last_name;
        } else if (staffMembers && staffMembers.length) {
          let selectedPartner = staffMembers.filter(function(s) {
            return parseInt(s.id) === parseInt(selectedId);
          });
          if (selectedPartner && selectedPartner.length) {
            return selectedPartner[0];
          }
        }
        return '';
      }

      _getReadonlyAuthorizedOfficers(agreement: Agreement, selection: [], staffMembers: Array<MinimalStaffMember>) {
        let ao = [];
        const aoSelected = selection instanceof Array && selection.length > 0;
        if (aoSelected) {
          const selectedIds = selection.map(s => parseInt(s, 10));
          ao = this._getAvailableAuthOfficers(staffMembers, agreement.authorized_officers)
              .filter(a => selectedIds.indexOf(parseInt(a.id, 10)) > -1);
        } else {
          ao = (agreement && agreement.authorized_officers instanceof Array)
            ? agreement.authorized_officers
            : [];
        }
        if (!ao || !ao.length) {
          return '';
        }
        const names = ao.map(officer => aoSelected ? officer.name : (officer.first_name + ' ' + officer.last_name));
        return names.join(' | ');
      }

      // Check if agreement type is expected type
      _typeMatches(agreementType: string, expectedType: string) {
        return agreementType === expectedType;
      }

      _openGeneratePCADialog() {
        if (!this.generatePCADialog.agreementId) {
          this.generatePCADialog.set('agreementId', this.agreement.id);
        }
        this.generatePCADialog.open();
      }

      _initAuthorizedOfficers(authOfficers: Array<StaffMember>) {
        if (authOfficers instanceof Array && authOfficers.length) {
          this.set('authorizedOfficers', authOfficers.map(function(authOfficer) {
            return authOfficer.id + '';
          }));
          return;
        }
        this.set('authorizedOfficers', []);
      }

      // set authorized officers field readonly mode
      _allowAuthorizedOfficersEditing(agreementStatus: string, editMode: boolean, allowAoEditForSSFA: boolean) {
        if (!this.agreement || !editMode) {
          return false;
        }
        if (this.agreement.agreement_type === CONSTANTS.AGREEMENT_TYPES.SSFA &&
            agreementStatus === CONSTANTS.STATUSES.Signed.toLowerCase()) {
          return !this.agreement.permissions.edit.authorized_officers ? false : allowAoEditForSSFA;
        } else {
          return this.agreement.permissions.edit.authorized_officers;
        }
      }

      _showAoEditBtn(status: string, editMode: boolean, permissionsEditAO: boolean) {
        return this.agreement && this.agreement.agreement_type === CONSTANTS.AGREEMENT_TYPES.SSFA && editMode &&
            permissionsEditAO && status === CONSTANTS.STATUSES.Signed.toLowerCase();
      }

      _enableAoEdit() {
        this.set('allowAoEditForSSFA', true);
      }

      _cancelAoEdit() {
        this._initAuthorizedOfficers(this.agreement.authorized_officers);
        this.$.officers.resetInvalidState();
        this.set('allowAoEditForSSFA', false);
      }

      // Validate agreement fields
      _validateAgreement() {
        let valid = true;
        let reqFieldsSelectors = ['#partner', '#agreementType', '#officers'];
        if (this.agreement.agreement_type === CONSTANTS.AGREEMENT_TYPES.PCA) {
          reqFieldsSelectors.push('#cpStructure');
        }
        reqFieldsSelectors.forEach(function(fSelector: string) {
          let field = this.shadowRoot.querySelector(fSelector);
          if (field && !field.validate()) {
            valid = false;
          }
        }.bind(this));
        return valid;
      }

      _signedAgreementUploadFinished(e: CustomEvent) {
        store.dispatch({type: DECREASE_UPLOADS_IN_PROGRESS});
        if (e.detail.success) {
          const response = JSON.parse(e.detail.success);
          this.set('agreement.attachment', response.id);
          this.dispatch('increaseUnsavedUploads');
        }
      }

      /**
       * Refer to unicef/etools-issues#232
       * For Draft Status, only Change option is available. No delete option is available in Draft.
       */
      showSignedAgDeleteBtn() {
        return this.isNewAgreement ? true : (this._isDraft() && !!this.originalAgreementData
            && !this.originalAgreementData.attachment);
      }

      _signedAgFileDelete() {
        this.set('agreement.attachment', null);
        this.dispatch('decreaseUnsavedUploads');
      }
    }

    window.customElements.define('agreement-details', AgreementDetails);
