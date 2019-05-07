import {PolymerElement, html} from '@polymer/polymer';
import '@polymer/paper-checkbox/paper-checkbox'
import 'etools-date-time/datepicker-lite.js';
import 'etools-dialog/etools-dialog.js';
import 'etools-dropdown/etools-dropdown.js';
import 'etools-upload/etools-upload.js';

import EndpointsMixin from '../../../../../endpoints/endpoints-mixin.js';

import {gridLayoutStyles} from '../../../../../styles/grid-layout-styles.js';
import {requiredFieldStarredStyles} from '../../../../../styles/required-field-styles.js';
import pmpEndpoints from '../../../../../endpoints/endpoints.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {RootState, store} from '../../../../../../store';
import {isJsonStrMatch, copy} from '../../../../../utils/utils';
import {fireEvent} from '../../../../../utils/fire-custom-event';
import {parseRequestErrorsAndShowAsToastMsgs} from '../../../../../utils/ajax-errors-parser.js';
import {property} from '@polymer/decorators';
import { LabelAndValue } from '../../../../../../typings/globals.types.js';
import { PartnerAssessment } from '../../../../../../models/partners.models.js';
import EtoolsDialog from 'etools-dialog/etools-dialog.js';
import { PaperCheckboxElement } from '@polymer/paper-checkbox/paper-checkbox';

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

      <etools-dialog no-padding
        keep-dialog-open
        id="assessmentDialog"
        opened="{{opened}}"
        size="md"
        ok-btn-text="Save"
        dialog-title="Assessment"
        on-confirm-btn-clicked="_validateAndSaveAssessment"
        disable-confirm-btn="[[uploadInProgress]]"
        disable-dismiss-btn="[[uploadInProgress]]">

        <div class="row-h flex-c">
          <div class="col col-4">
            <etools-dropdown id="assessmentType"
                             label="Assessment Type"
                             placeholder="&#8212;"
                             options="[[assessmentTypes]]"
                             selected="{{assessment.type}}"
                             error-message="Please select Assessment Type"
                             hide-search
                             required
                             auto-validate></etools-dropdown>
          </div>
          <div class="col col-5 padd-left">
            <datepicker-lite id="dateSubmitted"
                               label="Date of Assessment"
                               value="{{assessment.completed_date}}"
                               auto-validate
                               max-date-error-msg="Date can not be in the future"
                               max-date="[[getCurrentDate()]]"
                               required
                               selected-date-display-format="D MMM YYYY">
            </datepicker-lite>
          </div>
        </div>
        <div class="row-h">
          <etools-upload id="report"
                         label="Report"
                         accept=".doc,.docx,.pdf,.jpg,.png"
                         file-url="[[assessment.report_attachment]]"
                         upload-endpoint="[[uploadEndpoint]]"
                         on-upload-finished="_uploadFinished"
                         required
                         readonly="[[_hasId(assessment.id)]]"
                         show-change="[[!_hasId(assessment.id)]]"
                         error-message="Please select the report file">
          </etools-upload>
        </div>
        <div class="row-h">
          <paper-checkbox checked="[[!assessment.active]]" on-change="_archivedChanged">
            Archived
          </paper-checkbox>
        </div>

      </etools-dialog>
    `;
  }

  @property({type: Object})
  assessment!: PartnerAssessment;

  @property({type: String})
  uploadEndpoint: string = pmpEndpoints.attachmentsUpload.url;

  @property({type: Boolean, notify: true})
  opened: boolean = false;

  @property({type: Boolean})
  uploadInProgress: boolean = false;

  @property({type: Array})
  assessmentTypes!: LabelAndValue[];

  @property({type: Object})
  toastEventSource!: PolymerElement;

  @property({type: Object})
  originalAssessment!: PartnerAssessment;

  private _validationSelectors: string[] = ['#assessmentType', '#dateSubmitted', '#report'];

  public stateChanged(state: RootState) {
    if (!state.commonData) {
      return;
    }
    if (!isJsonStrMatch(state.commonData.assessmentTypes, this.assessmentTypes)) {
      this.assessmentTypes = [...state.commonData.assessmentTypes];
    }
  }

  ready() {
    super.ready();
  }

  _uploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = JSON.parse(e.detail.success);
      // @ts-ignore
      this.set('assessment.report_attachment', uploadResponse.id);
    }
  }

  validate() {
    let isValid = true;
    this._validationSelectors.forEach((selector) => {
      // @ts-ignore
      let el = this.shadowRoot.querySelector(selector);
      if (el && !(el as any).validate()) {
        isValid = false;
      }
    });

    return isValid;
  }

  public _validateAndSaveAssessment() {
    if (!this.validate()) {
      return;
    }
    this._saveAssessment();
  }

  public _saveAssessment() {
    if (this.assessment === null) {
      return;
    }
    const isNew = !this.assessment.id;
    let options = {
      method: isNew ? 'POST' : 'PATCH',
      endpoint: this._pickEndpoint(isNew, this.assessment.id),
      body: this._getBody(isNew)
    };

    this.sendRequest(options)
        .then((resp: any) => {
          this._handleResponse(resp, isNew);
          this.stopSpinner();
        }).catch((error: any) => {
      this._handleErrorResponse(error);
      this.stopSpinner();
    });

  }

  public _getBody(isNew: boolean) {
    if (!this.assessment) {
      return null;
    }
    delete this.assessment.report;

    if (!isNew) {
      delete this.assessment.report_attachment;
    }
    return this.assessment;
  }

  public _pickEndpoint(isNew: boolean, assessId: any) {
    let endpointName = isNew ? 'partnerAssessment' : 'patchPartnerAssessment';
    let endpointParam = isNew ? undefined :
        {assessmentId: assessId};

    // @ts-ignore
    return this.getEndpoint(endpointName, endpointParam);
  }

  public _handleResponse(response: any, isNew: boolean) {

    this.set('opened', false);

    if (isNew) {
      fireEvent(this, 'assessment-added', response);
    } else {
      fireEvent(this, 'assessment-updated', {
        before: this.originalAssessment,
        after: response
      });
    }

  }

  public _handleErrorResponse(error: any) {
    parseRequestErrorsAndShowAsToastMsgs(error, this.toastEventSource);
  }

  public startSpinner() {
    (this.$.assessmentDialog as EtoolsDialog).startSpinner();
  }

  public stopSpinner() {
    (this.$.assessmentDialog as EtoolsDialog).stopSpinner();
  }

  public resetValidations() {
    this._validationSelectors.forEach((selector) => {
      // @ts-ignore
      let el = this.shadowRoot.querySelector(selector);
      if (el) {
        (el as any).invalid = false;
      }
    });
  }

  public initAssessment(assessment: any, partnerId?: any) {
    if (!assessment) {
      assessment = new PartnerAssessment();
      assessment.partner = partnerId;
    }

    this.assessment = assessment;
    this.originalAssessment = copy(this.assessment);
    this.resetValidations();
  }

  public _hasId(id: any) {
    return !!id;
  }

  public _archivedChanged(e: CustomEvent) {
    this.set('assessment.active', !(e.target as PaperCheckboxElement).checked);
  }

  getCurrentDate() {
    return new Date();
  }


}

window.customElements.define('assessment-dialog', AssessmentDialog);
export {AssessmentDialog}
