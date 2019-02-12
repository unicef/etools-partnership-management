import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/iron-icons/iron-icons.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/paper-checkbox/paper-checkbox';
import '@polymer/paper-input/paper-input.js';

// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
// @ts-ignore
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import 'etools-content-panel/etools-content-panel.js';
import 'etools-dropdown/etools-dropdown.js';
import 'etools-upload/etools-upload.js';

import 'etools-date-time/datepicker-lite.js';

import '../../../../layout/etools-form-element-wrapper.js';

import './components/amendments/pd-amendments.js';
import './components/fund-reservations/fund-reservations.js';
import DateMixin from '../../../../mixins/date-mixin.js';
import CommonMixin from '../../../../mixins/common-mixin.js';
import MissingDropdownOptionsMixin from '../../../../mixins/missing-dropdown-options-mixin.js';
import UploadsMixin from '../../../../mixins/uploads-mixin.js';
import { fireEvent } from '../../../../utils/fire-custom-event.js';
import { Intervention } from '../../../../../typings/intervention.types.js';
import { Agreement } from '../../../agreements/agreement.types.js';
import CONSTANTS from '../../../../../config/app-constants.js';
import { pageCommonStyles } from '../../../../styles/page-common-styles.js';
import { gridLayoutStyles } from '../../../../styles/grid-layout-styles.js';
import { SharedStyles } from '../../../../styles/shared-styles.js';
import { requiredFieldStarredStyles } from '../../../../styles/required-field-styles.js';
import { connect } from 'pwa-helpers/connect-mixin';
import { store, RootState } from '../../../../../store.js';
import { isJsonStrMatch, copy } from '../../../../utils/utils.js';


/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin DateMixin
 * @appliesMixin CommonMixin
 * @appliesMixin MissingDropdownOptionsMixin
 * @appliesMixin UploadsMixin
 */
const InterventionReviewAndSignMixin = EtoolsMixinFactory.combineMixins([
  EtoolsLogsMixin,
  DateMixin,
  CommonMixin,
  MissingDropdownOptionsMixin,
  UploadsMixin
], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin InterventionReviewAndSignMixin
 */
class InterventionReviewAndSign extends connect(store)(InterventionReviewAndSignMixin) {
  [x: string]: any;

  static get template() {
    return html`
      ${pageCommonStyles} ${gridLayoutStyles} ${SharedStyles} ${requiredFieldStarredStyles}
      <style>
        :host {
          @apply --layout-vertical;
          width: 100%;
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
                              readonly$="[[!permissions.edit.submission_date]]">
            </datepicker-lite>
          </div>
          <div class="col col-3">
            <!-- Submitted to PRC? -->
            <etools-form-element-wrapper no-placeholder>
              <paper-checkbox checked="{{intervention.submitted_to_prc}}"
                              disabled$="[[_isSubmittedToPrcCheckReadonly(permissions.edit.prc_review_attachment, _lockSubmitToPrc)]]"
                              hidden$="[[!_submittedToPrcAvailable(intervention.document_type)]]">
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
                                no-init show-clear-btn>
              </datepicker-lite>
            </div>
            <div class="col col-3">
              <!-- Review Date by PRC -->
              <datepicker-lite id="reviewDatePrcField"
                                label="Review Date by PRC"
                                value="{{intervention.review_date_prc}}"
                                readonly$="[[!permissions.edit.review_date_prc]]"
                                no-init show-clear-btn>
              </datepicker-lite>
            </div>
            <div class="col col-6">
              <!-- PRC Review Document -->
              <etools-upload
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
                              no-init show-clear-btn disable-future-dates>
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
                              no-init show-clear-btn disable-future-dates>
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

  static get properties() {
    return {
      originalIntervention: Object,
      intervention: {
        type: Object,
        notify: true,
        observer: '_interventionChanged'
      },
      permissions: {
        type: Object,
        statePath: 'pageData.permissions'
      },
      signedByUnicefUsers: {
        type: Array,
        statePath: 'unicefUsersData'
      },
      agreement: {
        type: Object,
        value: null,
        observer: '_agreementChanged'
      },
      agreementAuthorizedOfficers: {
        type: Array,
        value: []
      },
      _lockSubmitToPrc: {
        type: Boolean,
        value: false
      },
      partnerDateValidatorErrorMessage: {
        type: String,
        value: ''
      },
      unicefDateValidatorErrorMessage: {
        type: String,
        value: ''
      }
    };
  }

  static get observers() {
    return [
      '_interventionDocTypeChanged(intervention.document_type)',
      '_signedPdDocHasChanged(intervention.signed_pd_attachment)',
      '_updateStyles(permissions.edit.prc_review_attachment, _lockSubmitToPrc)'
    ];
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.permissions, state.pageData!.permissions)) {
      this.permissions = copy(state.pageData!.permissions);
    }

    if (!isJsonStrMatch(this.signedByUnicefUsers, state.commonData!.unicefUsersData)) {
      this.signedByUnicefUsers = copy(state.commonData!.unicefUsersData);
    }
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
      let authorizedOfficerData = agreement.authorized_officers!.map((officer) => {
        return {
          value: parseInt(officer.id, 10),
          label: officer.first_name + ' ' + officer.last_name
        };
      });

      this.set('agreementAuthorizedOfficers', authorizedOfficerData);
    }
  }

  validate() {
    let valid = true;
    let fieldSelectors = ['#signedByAuthorizedOfficer', '#signedByPartnerDateField',
      '#signedByUnicefDateField', '#signedIntervFile'];

    fieldSelectors.forEach(function(selector: string) {
      let field = this.shadowRoot.querySelector(selector);
      if (field && !field.validate()) {
        valid = false;
      }
    }.bind(this));
    return valid;
  }

  _showSubmittedToPrcFields(submittedToPrc: boolean) {
    return this._submittedToPrcAvailable(this.intervention.documentType) && submittedToPrc;
  }

  _submittedToPrcAvailable(documentType: string) {
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

    let submittedToPrc = this._submittedToPrcAvailable(interventionDocumentType);
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
      let frIds = e.detail.frsDetails.frs.map(fr => fr.id);
      this.set('intervention.frs', frIds);
    } catch (err) {
      this.logError('[_handleFrsUpdate] An error occurred during FR Numbers update', null, err);
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
    this.dispatch('decreaseUploadsInProgress');
    if (e.detail.success) {
      const response = JSON.parse(e.detail.success);
      this.set('intervention.signed_pd_attachment', response.id);
      this.dispatch('increaseUnsavedUploads');
    }
  }

  _signedPDDocDelete(e: CustomEvent) {
    this.set('intervention.signed_pd_attachment', null);
    this.dispatch('decreaseUnsavedUploads');
  }

  _prcRevDocUploadFinished(e: CustomEvent) {
    this.dispatch('decreaseUploadsInProgress');
    if (e.detail.success) {
      const response = JSON.parse(e.detail.success);
      this.set('intervention.prc_review_attachment', response.id);
      this.dispatch('increaseUnsavedUploads');
    }
  }

  _prcRevDocDelete(e) {
    this.set('intervention.prc_review_attachment', null);
    this.dispatch('decreaseUnsavedUploads');
  }

  showPrcReviewDeleteBtn(status: string) {
    return this._isDraft(status) && !!this.originalIntervention && !this.originalIntervention.prc_review_attachment;
  }

  showSignedPDDeleteBtn(status: string) {
    return this._isDraft(status) && !!this.originalIntervention && !this.originalIntervention.signed_pd_attachment;
  }

}

window.customElements.define('intervention-review-and-sign', InterventionReviewAndSign);
