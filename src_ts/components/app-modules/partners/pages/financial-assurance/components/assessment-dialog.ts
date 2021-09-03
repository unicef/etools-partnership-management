import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-checkbox/paper-checkbox';
import '@unicef-polymer/etools-date-time/datepicker-lite.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-upload/etools-upload.js';

import EndpointsMixin from '../../../../../endpoints/endpoints-mixin.js';

import {gridLayoutStyles} from '../../../../../styles/grid-layout-styles.js';
import {requiredFieldStarredStyles} from '../../../../../styles/required-field-styles.js';
import pmpEndpoints from '../../../../../endpoints/endpoints.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../../../../redux/store';
import {isJsonStrMatch, copy} from '../../../../../utils/utils';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {property} from '@polymer/decorators';
import {PartnerAssessment} from '../../../../../../models/partners.models.js';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import {PaperCheckboxElement} from '@polymer/paper-checkbox/paper-checkbox';
import {LabelAndValue} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */
class AssessmentDialog extends connect(store)(EndpointsMixin(PolymerElement)) {
  static get template() {
    return html`
      ${gridLayoutStyles} ${requiredFieldStarredStyles}
      <style>
        :host {
          display: block;
        }

        .padd-left {
          padding-left: 48px !important;
        }
      </style>

      <etools-dialog
        no-padding
        keep-dialog-open
        id="assessmentDialog"
        size="md"
        ok-btn-text="Save"
        dialog-title="Assessment"
        opened
        on-close="_onClose"
        on-confirm-btn-clicked="_validateAndSaveAssessment"
        disable-confirm-btn="[[uploadInProgress]]"
        disable-dismiss-btn="[[uploadInProgress]]"
      >
        <div class="row-h flex-c">
          <div class="col col-4">
            <etools-dropdown
              id="assessmentType"
              label="Assessment Type"
              placeholder="&#8212;"
              options="[[assessmentTypes]]"
              selected="{{assessment.type}}"
              error-message="Please select Assessment Type"
              hide-search
              required
              auto-validate
            ></etools-dropdown>
          </div>
          <div class="col col-5 padd-left">
            <datepicker-lite
              id="dateSubmitted"
              label="Date of Assessment"
              value="{{assessment.completed_date}}"
              auto-validate
              max-date-error-msg="Date can not be in the future"
              max-date="[[getCurrentDate()]]"
              required
              selected-date-display-format="D MMM YYYY"
            >
            </datepicker-lite>
          </div>
        </div>
        <div class="row-h">
          <etools-upload
            id="report"
            label="Report"
            accept=".doc,.docx,.pdf,.jpg,.png"
            file-url="[[assessment.report_attachment]]"
            upload-endpoint="[[uploadEndpoint]]"
            on-upload-finished="_uploadFinished"
            required
            readonly="[[_hasId(assessment.id)]]"
            show-change="[[!_hasId(assessment.id)]]"
            error-message="Please select the report file"
          >
          </etools-upload>
        </div>
        <div class="row-h">
          <paper-checkbox checked="[[!assessment.active]]" on-change="_archivedChanged">Archived</paper-checkbox>
        </div>
      </etools-dialog>
    `;
  }

  @property({type: Object})
  assessment!: PartnerAssessment;

  @property({type: String})
  uploadEndpoint: string = pmpEndpoints.attachmentsUpload.url;

  @property({type: Boolean})
  uploadInProgress = false;

  @property({type: Array})
  assessmentTypes!: LabelAndValue[];

  @property({type: Object})
  originalAssessment!: PartnerAssessment;

  private _validationSelectors: string[] = ['#assessmentType', '#dateSubmitted', '#report'];

  set dialogData(data: any) {
    let {assessment, partnerId}: any = data;
    if (!assessment) {
      assessment = new PartnerAssessment();
      assessment.partner = partnerId;
    }
    this.assessment = assessment;
    this.originalAssessment = copy(this.assessment);

    setTimeout(() => {
      this.resetValidations();
    }, 10);
  }

  public stateChanged(state: RootState) {
    if (!state.commonData) {
      return;
    }
    if (!isJsonStrMatch(state.commonData.assessmentTypes, this.assessmentTypes)) {
      this.assessmentTypes = [...state.commonData.assessmentTypes];
    }
  }

  _uploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = e.detail.success;
      // @ts-ignore
      this.set('assessment.report_attachment', uploadResponse.id);
    }
  }

  resetValidations() {
    this._validationSelectors.forEach((selector) => {
      // @ts-ignore
      const el = this.shadowRoot.querySelector(selector);
      if (el) {
        (el as any).invalid = false;
      }
    });
  }

  validate() {
    let isValid = true;
    this._validationSelectors.forEach((selector) => {
      // @ts-ignore
      const el = this.shadowRoot.querySelector(selector);
      if (el && !(el as any).validate()) {
        isValid = false;
      }
    });

    return isValid;
  }

  _validateAndSaveAssessment() {
    if (!this.validate()) {
      return;
    }
    this._saveAssessment();
  }

  _saveAssessment() {
    if (this.assessment === null) {
      return;
    }
    const isNew = !this.assessment.id;
    const options = {
      method: isNew ? 'POST' : 'PATCH',
      endpoint: this._pickEndpoint(isNew, this.assessment.id),
      body: this._getBody(isNew)
    };

    sendRequest(options)
      .then((resp: any) => {
        this._handleResponse(resp, isNew);
        this.stopSpinner();
        this._onClose();
      })
      .catch((error: any) => {
        this._handleErrorResponse(error);
        this.stopSpinner();
      });
  }

  _getBody(isNew: boolean) {
    if (!this.assessment) {
      return null;
    }
    delete this.assessment.report;

    if (!isNew) {
      delete this.assessment.report_attachment;
    }
    return this.assessment;
  }

  _pickEndpoint(isNew: boolean, assessId: any) {
    const endpointName = isNew ? 'partnerAssessment' : 'patchPartnerAssessment';
    const endpointParam = isNew ? undefined : {assessmentId: assessId};

    // @ts-ignore
    return this.getEndpoint(endpointName, endpointParam);
  }

  _handleResponse(response: any, isNew: boolean) {
    if (isNew) {
      fireEvent(this, 'dialog-closed', {confirmed: true, response: {action: 'assessment-added', detail: response}});
    } else {
      fireEvent(this, 'dialog-closed', {
        confirmed: true,
        response: {
          action: 'assessment-updated',
          detail: {
            before: this.originalAssessment,
            after: response
          }
        }
      });
    }
  }

  _handleErrorResponse(error: any) {
    parseRequestErrorsAndShowAsToastMsgs(error, this);
  }

  startSpinner() {
    (this.$.assessmentDialog as EtoolsDialog).startSpinner();
  }

  stopSpinner() {
    (this.$.assessmentDialog as EtoolsDialog).stopSpinner();
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  _hasId(id: any) {
    return !!id;
  }

  _archivedChanged(e: CustomEvent) {
    this.set('assessment.active', !(e.target as PaperCheckboxElement).checked);
  }

  getCurrentDate() {
    return new Date();
  }
}

window.customElements.define('assessment-dialog', AssessmentDialog);
export {AssessmentDialog};
