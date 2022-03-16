import {LitElement, html, customElement, property} from 'lit-element';
import '@polymer/paper-checkbox/paper-checkbox';
import '@unicef-polymer/etools-date-time/datepicker-lite.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import '@unicef-polymer/etools-upload/etools-upload.js';

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {RequiredFieldsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/required-fields-styles';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import pmpEndpoints from '../../../../../endpoints/endpoints.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../../../../redux/store';
import {isJsonStrMatch, copy} from '../../../../../utils/utils';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser.js';
import {PartnerAssessment} from '../../../../../../models/partners.models.js';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog.js';
import {PaperCheckboxElement} from '@polymer/paper-checkbox/paper-checkbox';
import {LabelAndValue} from '@unicef-polymer/etools-types';
import {formatDate} from '@unicef-polymer/etools-modules-common/dist/utils/date-utils';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import pmpEdpoints from '../../../../../endpoints/endpoints.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin EndpointsMixin
 */
@customElement('assessment-dialog')
export class AssessmentDialog extends connect(store)(EndpointsLitMixin(LitElement)) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      ${sharedStyles} ${RequiredFieldsStyles}
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
        @close="${this._onClose}"
        @confirm-btn-clicked="${this._validateAndSaveAssessment}"
        ?disable-confirm-btn="${this.uploadInProgress}"
        ?disable-dismiss-btn="${this.uploadInProgress}"
      >
        <div class="row-h flex-c">
          <div class="col col-4">
            <etools-dropdown
              id="assessmentType"
              label="Assessment Type"
              placeholder="&#8212;"
              .options="${this.assessmentTypes}"
              .selected="${this.assessment.type}"
              @etools-selected-item-changed="${({detail}: CustomEvent) => {
                if (!detail.selectedItem) {
                  return;
                }
                this.assessment.type = detail.selectedItem ? detail.selectedItem.value : '';
              }}"
              trigger-value-change-event
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
              .value="${this.assessment.completed_date}"
              @date-has-changed="${(e: CustomEvent) => {
                this.assessment.completed_date = e.detail.date ? formatDate(e.detail.date, 'YYYY-MM-DD') : null;
              }}"
              auto-validate
              max-date-error-msg="Date can not be in the future"
              .maxDate="${this.getCurrentDate()}"
              required
              selected-date-display-format="D MMM YYYY"
              fire-date-has-changed
              data-field-path="assessment.completed_date"
            >
            </datepicker-lite>
          </div>
        </div>
        <div class="row-h">
          <etools-upload
            id="report"
            label="Report"
            accept=".doc,.docx,.pdf,.jpg,.png"
            .fileUrl="${this.assessment.report_attachment}"
            .uploadEndpoint="${this.uploadEndpoint}"
            @upload-finished="${this._uploadFinished}"
            required
            ?readonly="${this._hasId(this.assessment.id)}"
            .showChange="${!this._hasId(this.assessment.id)}"
            error-message="Please select the report file"
          >
          </etools-upload>
        </div>
        <div class="row-h">
          <paper-checkbox ?checked="${!this.assessment.active}" @checked-changed="${this._archivedChanged}"
            >Archived</paper-checkbox
          >
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
      this.assessment.report_attachment = uploadResponse.id;
      this.assessment = {...this.assessment};
    }
  }

  resetValidations() {
    this._validationSelectors.forEach((selector) => {
      const el = this.shadowRoot!.querySelector(selector);
      if (el) {
        (el as any).invalid = false;
      }
    });
  }

  validate() {
    let isValid = true;
    this._validationSelectors.forEach((selector) => {
      const el = this.shadowRoot!.querySelector(selector);
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
    return this.getEndpoint(pmpEdpoints, endpointName, endpointParam);
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
    (this.shadowRoot!.querySelector('#assessmentDialog') as EtoolsDialog).startSpinner();
  }

  stopSpinner() {
    (this.shadowRoot!.querySelector('#assessmentDialog') as EtoolsDialog).stopSpinner();
  }

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  _hasId(id: any) {
    return !!id;
  }

  _archivedChanged(e: CustomEvent) {
    this.assessment.active = !(e.target as PaperCheckboxElement).checked;
  }

  getCurrentDate() {
    return new Date();
  }
}
