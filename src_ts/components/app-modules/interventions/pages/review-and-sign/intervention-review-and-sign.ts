import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-input/paper-input.js';

import '@unicef-polymer/etools-content-panel/etools-content-panel.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-upload/etools-upload.js';

import '@unicef-polymer/etools-date-time/datepicker-lite.js';

import '../../../../layout/etools-form-element-wrapper.js';

import './components/amendments/pd-amendments.js';
import './components/fund-reservations/fund-reservations.js';
import CommonMixin from '../../../../mixins/common-mixin.js';
import MissingDropdownOptionsMixin from '../../../../mixins/missing-dropdown-options-mixin.js';
import UploadsMixin from '../../../../mixins/uploads-mixin.js';
import {fireEvent} from '../../../../utils/fire-custom-event.js';
import {Intervention, Fr, InterventionPermissionsFields} from '../../../../../typings/intervention.types.js';
import {Agreement} from '../../../agreements/agreement.types.js';
import CONSTANTS from '../../../../../config/app-constants.js';
import {pageCommonStyles} from '../../../../styles/page-common-styles.js';
import {gridLayoutStyles} from '../../../../styles/grid-layout-styles.js';
import {SharedStyles} from '../../../../styles/shared-styles.js';
import {requiredFieldStarredStyles} from '../../../../styles/required-field-styles.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../../../store.js';
import {isJsonStrMatch, copy} from '../../../../utils/utils.js';
import {DECREASE_UPLOADS_IN_PROGRESS, INCREASE_UNSAVED_UPLOADS, DECREASE_UNSAVED_UPLOADS} from '../../../../../actions/upload-status.js';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {property} from '@polymer/decorators';
import {Permission, MinimalUser} from '../../../../../typings/globals.types.js';
import DatePickerLite from '@unicef-polymer/etools-date-time/datepicker-lite.js';


/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin CommonMixin
 * @appliesMixin MissingDropdownOptionsMixin
 * @appliesMixin UploadsMixin
 */
class InterventionReviewAndSign extends connect(store)(CommonMixin(
  UploadsMixin(
    MissingDropdownOptionsMixin(PolymerElement)))) {

  static get template() {
    return html`
      ${pageCommonStyles} ${gridLayoutStyles} ${SharedStyles} ${requiredFieldStarredStyles}
      <style>
        :host {
          @apply --layout-vertical;
          width: 100%;
        }

        datepicker-lite[required]{
          --paper-input-container-label-floating_-_max-width: 133%;
        }

        paper-input {
          width: 100%;
        }

        paper-checkbox {
          @apply --layout-horizontal;
          @apply --layout-center;
          min-height: 24px;
        }

        paper-checkbox[disabled] {
          cursor: not-allowed;
          --paper-checkbox-unchecked-color: black;
          --paper-checkbox-label: {
            color: var(--primary-text-color);
            opacity: 1;
          };
        }
      </style>

      <etools-content-panel class="content-section" panel-title="Signatures & Dates">
        <div class="row-h flex-c">
          <div class="col col-3">
            <!-- Document Submission Date -->
            <datepicker-lite id="submissionDateField"
                              label="Document Submission Date"
                              value="{{intervention.submission_date}}"
                              readonly$="[[!permissions.edit.submission_date]]"
                              selected-date-display-format="D MMM YYYY"
                              required$="[[permissions.required.submission_date]]"
                              max-date="[[getCurrentDate()]]"
                              max-date-error-msg="Date can not be in the future"
                              error-message="Document Submission Date is required"
                              auto-validate>
            </datepicker-lite>
          </div>
          <div class="col col-3">
            <!-- Submitted to PRC? -->
            <etools-form-element-wrapper no-placeholder>
              <paper-checkbox checked="{{intervention.submitted_to_prc}}"
                              disabled$="[[_isSubmittedToPrcCheckReadonly(permissions.edit.prc_review_attachment, _lockSubmitToPrc)]]"
                              hidden$="[[!_isNotSSFA(intervention.document_type)]]">
                Submitted to PRC?
              </paper-checkbox>
            </etools-form-element-wrapper>
          </div>
        </div>
        <template is="dom-if" if="[[_showSubmittedToPrcFields(intervention.submitted_to_prc)]]">
          <div class="row-h flex-c row-second-bg">
            <div class="col col-3">
              <!-- Submission Date to PRC -->
              <datepicker-lite id="submissionDatePrcField"
                                label="Submission Date to PRC"
                                value="{{intervention.submission_date_prc}}"
                                readonly$="[[!permissions.edit.submission_date_prc]]"
                                required$="[[intervention.submitted_to_prc]]"
                                selected-date-display-format="D MMM YYYY"
                                auto-validate>
              </datepicker-lite>
            </div>
            <div class="col col-3">
              <!-- Review Date by PRC -->
              <datepicker-lite id="reviewDatePrcField"
                                label="Review Date by PRC"
                                value="{{intervention.review_date_prc}}"
                                readonly$="[[!permissions.edit.review_date_prc]]"
                                required$="[[intervention.submitted_to_prc]]"
                                selected-date-display-format="D MMM YYYY"
                                auto-validate>
              </datepicker-lite>
            </div>
            <div class="col col-6">
              <!-- PRC Review Document -->
              <etools-upload
                  id="reviewDocUpload"
                  label="PRC Review Document"
                  accept=".doc,.docx,.pdf,.jpg,.png"
                  file-url="[[intervention.prc_review_attachment]]"
                  upload-endpoint="[[uploadEndpoint]]"
                  on-upload-finished="_prcRevDocUploadFinished"
                  readonly$="[[!permissions.edit.prc_review_attachment]]"
                  show-delete-btn="[[showPrcReviewDeleteBtn(intervention.status, permissions.edit.prc_review_attachment)]]"
                  on-delete-file="_prcRevDocDelete"
                  on-upload-started="_onUploadStarted"
                  on-change-unsaved-file="_onChangeUnsavedFile">
              </etools-upload>
            </div>
          </div>
        </template>
        <div class="row-h flex-c">
          <div class="col col-6">
            <!-- Signed By Partner Authorized Officer -->
            <etools-dropdown id="signedByAuthorizedOfficer"
                            label="Signed By Partner Authorized Officer"
                            placeholder="&#8212;"
                            options="[[agreementAuthorizedOfficers]]"
                            selected="{{intervention.partner_authorized_officer_signatory}}"
                            readonly$="[[!permissions.edit.partner_authorized_officer_signatory]]"
                            required$="[[permissions.required.partner_authorized_officer_signatory]]"
                            auto-validate
                            error-message="Please select Partner Authorized Officer">
            </etools-dropdown>
          </div>
          <div class="col col-3">
            <!-- Signed by Partner Date -->
            <datepicker-lite id="signedByPartnerDateField"
                              label="Signed by Partner Date"
                              value="{{intervention.signed_by_partner_date}}"
                              readonly="[[!permissions.edit.signed_by_partner_date]]"
                              required$="[[permissions.required.signed_by_partner_date]]"
                              auto-validate
                              error-message="Date is required"
                              max-date-error-msg="Date can not be in the future"
                              max-date="[[getCurrentDate()]]"
                              selected-date-display-format="D MMM YYYY">
            </datepicker-lite>
          </div>
        </div>
        <div class="row-h flex-c">
          <div class="col col-6">
            <!-- Signed by UNICEF Authorized Officer -->
            <etools-form-element-wrapper no-placeholder>
              Signed by UNICEF Authorized Officer
            </etools-form-element-wrapper>
          </div>
          <div class="col col-3">
            <!-- Signed by UNICEF Date -->
            <datepicker-lite id="signedByUnicefDateField"
                              label="Signed by UNICEF Date"
                              value="{{intervention.signed_by_unicef_date}}"
                              readonly="[[!permissions.edit.signed_by_unicef_date]]"
                              required$="[[permissions.required.signed_by_unicef_date]]"
                              auto-validate
                              error-message="Date is required"
                              max-date-error-msg="Date can not be in the future"
                              max-date="[[getCurrentDate()]]"
                              selected-date-display-format="D MMM YYYY">
            </datepicker-lite>
          </div>
        </div>
        <div class="row-h flex-c">
          <div class="col col-6">
            <!-- Signed by UNICEF -->
            <etools-dropdown id="signedByUnicef"
                            label="Signed by UNICEF"
                            placeholder="&#8212;"
                            options="[[getCleanEsmmOptions(signedByUnicefUsers, intervention)]]"
                            option-value="id"
                            option-label="name"
                            selected="{{intervention.unicef_signatory}}"
                            readonly$="[[!permissions.edit.unicef_signatory]]"
                            auto-validate
                            error-message="Please select UNICEF user">
            </etools-dropdown>
          </div>
        </div>
        <div class="row-h flex-c">
          <div class="col col-6">
            <!-- Signed PD/SSFA -->
            <etools-upload id="signedIntervFile"
                          label="Signed PD/SSFA"
                          accept=".doc,.docx,.pdf,.jpg,.png"
                          file-url="[[intervention.signed_pd_attachment]]"
                          upload-endpoint="[[uploadEndpoint]]"
                          on-upload-finished="_signedPDUploadFinished"
                          show-delete-btn="[[showSignedPDDeleteBtn(intervention.status, permissions.edit.signed_pd_attachment)]]"
                          on-delete-file="_signedPDDocDelete"
                          auto-validate
                          readonly$="[[!permissions.edit.signed_pd_attachment]]"
                          required$="[[permissions.required.signed_pd_attachment]]"
                          error-message="Please select Signed PD/SSFA document"
                          on-upload-started="_onUploadStarted"
                          on-change-unsaved-file="_onChangeUnsavedFile">
            </etools-upload>
          </div>
          <template is="dom-if" if="[[_showDaysToSignedFields(intervention.status)]]">
            <div class="col col-3">
              <paper-input label="Days from Submission to Signed"
                          value="[[intervention.days_from_submission_to_signed]]"
                          placeholder="&#8212;" readonly>
              </paper-input>
            </div>
            <div class="col col-3">
              <paper-input label="Days from Review to Signed"
                          value="[[intervention.days_from_review_to_signed]]"
                          placeholder="&#8212;" readonly>
              </paper-input>
            </div>
          </template>

        </div>
      </etools-content-panel>

      <template is="dom-if" if="[[!_isDraft(intervention.status)]]">
        <pd-amendments class="content-section"
                      intervention-document-type="[[intervention.document_type]]"
                      intervention-id="[[intervention.id]]"
                      amendments="{{intervention.amendments}}"
                      edit-mode="[[permissions.edit.amendments]]">
        </pd-amendments>
      </template>

      <fund-reservations class="content-section"
                        intervention="[[intervention]]"
                        edit-mode="[[permissions.edit.frs]]"
                        on-frs-update="_handleFrsUpdate">
      </fund-reservations>
    `;
  }

  @property({type: Object})
  originalIntervention!: Intervention;

  @property({type: Object, notify: true, observer: '_interventionChanged'})
  intervention!: Intervention;

  @property({type: Object})
  permissions!: Permission<InterventionPermissionsFields>;

  @property({type: Array})
  signedByUnicefUsers!: MinimalUser[];

  @property({type: Object, observer: '_agreementChanged'})
  agreement!: Agreement;

  @property({type: Array})
  agreementAuthorizedOfficers!: [];

  @property({type: Boolean})
  _lockSubmitToPrc: boolean = false;

  @property({type: String})
  partnerDateValidatorErrorMessage!: string;

  @property({type: String})
  unicefDateValidatorErrorMessage!: string;

  static get observers() {
    return [
      '_interventionDocTypeChanged(intervention.document_type)',
      '_signedPdDocHasChanged(intervention.signed_pd_attachment)',
      '_updateStyles(permissions.edit.prc_review_attachment, _lockSubmitToPrc)',
      '_resetEagerValidations(intervention.submitted_to_prc)'
    ];
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.permissions, state.pageData!.permissions)) {
      this.permissions = copy(state.pageData!.permissions);
    }

    if (!isJsonStrMatch(this.signedByUnicefUsers, state.commonData!.unicefUsersData)) {
      this.signedByUnicefUsers = copy(state.commonData!.unicefUsersData);
    }
    this.uploadsStateChanged(state);
  }

  connectedCallback() {
    super.connectedCallback();
    /**
     * Disable loading message for review and sign tab elements load,
     * triggered by parent element on stamp or by tap event on tabs
     */
    fireEvent(this, 'global-loading', {active: false, loadingSource: 'interv-page'});
    this.setDropdownMissingOptionsAjaxDetails(this.$.signedByUnicef, 'unicefUsers', {dropdown: true});
    fireEvent(this, 'tab-content-attached');
  }

  _resetEagerValidations(submittedToPrc: boolean) {
    if (submittedToPrc) {
      /** wait for components to be stamped */
      setTimeout(() => {
        (this.shadowRoot!.querySelector('#submissionDatePrcField')! as DatePickerLite).invalid = false;
        (this.shadowRoot!.querySelector('#reviewDatePrcField')! as DatePickerLite).invalid = false;
      });
    }
  }

  _updateStyles() {
    this.updateStyles();
  }

  _isDraft(status: string) {
    return status === CONSTANTS.STATUSES.Draft.toLowerCase() ||
      status === '';
  }

  _interventionChanged(intervention: Intervention) {
    // check if submitted to PRC was already saved
    if (intervention && intervention.id && intervention.submitted_to_prc) {
      this.set('_lockSubmitToPrc', true);
    } else {
      this.set('_lockSubmitToPrc', false);
    }
    if (!intervention.prc_review_attachment) {
      this.set('intervention.prc_review_attachment', null);
    }
  }

  _hideDeleteBtn(status: string, fileUrl: string) {
    return this._isDraft(status) && fileUrl;
  }

  _agreementChanged(agreement: Agreement) {
    if (agreement && typeof agreement === 'object' && Object.keys(agreement).length > 0) {
      const authorizedOfficerData = agreement.authorized_officers!.map((officer) => {
        return {
          value: typeof officer.id === 'string' ? parseInt(officer.id, 10) : officer.id,
          label: officer.first_name + ' ' + officer.last_name
        };
      });

      this.set('agreementAuthorizedOfficers', authorizedOfficerData);
    }
  }

  validate() {
    let valid = true;
    const fieldSelectors = ['#signedByAuthorizedOfficer', '#signedByPartnerDateField',
      '#signedByUnicefDateField', '#signedIntervFile', '#submissionDateField'];
    if (this.intervention.submitted_to_prc) {
      const dateFields = ['#submissionDatePrcField', '#reviewDatePrcField'];
      fieldSelectors.push(...dateFields);
    }
    fieldSelectors.forEach((selector: string) => {
      const field = this.shadowRoot!.querySelector(selector) as PolymerElement & {validate(): boolean};
      if (field && !field.validate()) {
        valid = false;
      }
    });
    return valid;
  }


  /**
   * intervention.submitted_to_prc is set only on bk if submission_date_prc, review_date_prc are filled in
   * For the submitted_to_prc field to be true when file is attached also,
   * we make the date fields required
   */
  _showSubmittedToPrcFields(submittedToPrc: boolean) {
    return this._isNotSSFA(this.intervention.documentType) && submittedToPrc;
  }

  _isNotSSFA(documentType: string) {
    return documentType !== CONSTANTS.DOCUMENT_TYPES.SSFA;
  }

  _showDaysToSignedFields(status: string) {
    return !this._isDraft(status);
  }

  _isSubmittedToPrcCheckReadonly(isPrcDocEditable: boolean, lockSubmitToPrc: boolean) {
    return !isPrcDocEditable || lockSubmitToPrc;
  }

  _interventionDocTypeChanged(interventionDocumentType: string) {
    if (typeof interventionDocumentType === 'undefined') {
      return;
    }

    const submittedToPrc = this._showSubmittedToPrcFields(this.intervention.submitted_to_prc);
    if (!submittedToPrc) {
      this.set('intervention.submitted_to_prc', false);
      this._resetPrcFields();
    }
  }

  _resetPrcFields() {
    this.set('intervention.intervention.submission_date_prc', null);
    this.set('intervention.review_date_prc', null);
    this.set('intervention.prc_review_attachment', null);
  }

  // update FR Number on intervention
  _handleFrsUpdate(e: CustomEvent) {
    e.stopImmediatePropagation();
    try {
      this.set('intervention.frs_details', e.detail.frsDetails);
      const frIds = e.detail.frsDetails.frs.map((fr: Fr) => fr.id);
      this.set('intervention.frs', frIds);
    } catch (err) {
      logError('[_handleFrsUpdate] An error occurred during FR Numbers update', null, err);
    }
  }

  /**
   * If a signed document is selected then all fields required
   * for the intervention to move in signed status are required; only for draft status.
   */
  _signedPdDocHasChanged(signedDocument: any) {
    if (typeof signedDocument === 'undefined') {
      return;
    }
    // this functionality is available only after pd is saved and in draft status
    if (this.intervention &&
      this.intervention.status === CONSTANTS.STATUSES.Draft.toLowerCase()) {
      setTimeout(() => {
        // delay micro task execution; set to make sure _signedDocChangedForDraft will run on page load
        if (signedDocument) {
          // new document uploaded or file url provided
          fireEvent(this, 'signed-doc-change-for-draft', {docSelected: true});
        } else {
          // there is no signedDocument
          fireEvent(this, 'signed-doc-change-for-draft', {docSelected: false});
        }
      }, 0);
    }
  }

  _signedPDUploadFinished(e: CustomEvent) {
    store.dispatch({type: DECREASE_UPLOADS_IN_PROGRESS});
    if (e.detail.success) {
      const response = JSON.parse(e.detail.success);
      this.set('intervention.signed_pd_attachment', response.id);
      store.dispatch({type: INCREASE_UNSAVED_UPLOADS});
    }
  }

  _signedPDDocDelete(_e: CustomEvent) {
    this.set('intervention.signed_pd_attachment', null);
    store.dispatch({type: DECREASE_UNSAVED_UPLOADS});
  }

  _prcRevDocUploadFinished(e: CustomEvent) {
    store.dispatch({type: DECREASE_UPLOADS_IN_PROGRESS});
    if (e.detail.success) {
      const response = JSON.parse(e.detail.success);
      this.set('intervention.prc_review_attachment', response.id);
      store.dispatch({type: INCREASE_UNSAVED_UPLOADS});
    }
  }

  _prcRevDocDelete(_e: CustomEvent) {
    this.set('intervention.prc_review_attachment', null);
    store.dispatch({type: DECREASE_UNSAVED_UPLOADS});
  }

  showPrcReviewDeleteBtn(status: string) {
    return this._isDraft(status) && !!this.originalIntervention && !this.originalIntervention.prc_review_attachment;
  }

  showSignedPDDeleteBtn(status: string) {
    return this._isDraft(status) && !!this.originalIntervention && !this.originalIntervention.signed_pd_attachment;
  }

  getCurrentDate() {
    return new Date();
  }

}

window.customElements.define('intervention-review-and-sign', InterventionReviewAndSign);

export default InterventionReviewAndSign;
