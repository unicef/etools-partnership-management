import {PolymerElement, html} from '@polymer/polymer';
import 'etools-dialog/etools-dialog.js';
import 'etools-dropdown/etools-dropdown.js';
import 'etools-upload/etools-upload.js';
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';

import EndpointsMixin from '../../../../../endpoints/endpoints-mixin.js';
import AjaxErrorsParserMixin from '../../../../../mixins/ajax-errors-parser-mixin.js';
import EventHelperMixin from '../../../../../mixins/event-helper-mixin.js';
// <link rel="import" href="../../../../../validators/required-and-not-future-date-validator.html">

// <link rel="import" href="../../../../../layout/components/etools-date-input.html">

import {gridLayoutStyles} from '../../../../../styles/grid-layout-styles.js';
import {requiredFieldStarredStyles} from '../../../../../styles/required-field-styles.js';

/**
 * @customElement
 * @polymer
 * @appliesMixin EndpointsMixin
 * @appliesMixin AjaxErrorsParserMixin
 * @appliesMixin EventHelperMixin
 */
const AssessmentDialogMixins = EtoolsMixinFactory.combineMixins([
  EndpointsMixin,
  AjaxErrorsParserMixin,
  EventHelperMixin
]);

/**
 * @polymer
 * @customElement
 * @appliesMixin AssessmentDialogMixins
 */
class AssesmentDialog extends AssessmentDialogMixins {

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
            <required-and-not-future-date-validator validator-name="dateSubmittedValidator"
                                                    field-selector="#dateSubmitted">
            </required-and-not-future-date-validator>
            <etools-date-input id="dateSubmitted"
                               label="Date of Assessment"
                               value="{{assessment.completed_date}}"
                               auto-validate
                               required-and-not-future-date
                               validator="dateSubmittedValidator"
                               no-init show-clear-btn
                               required>
            </etools-date-input>
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

  static get properties() {
    return {
      assessment: {
        type: Object
      },
      uploadEndpoint: {
        type: String,
        value: () => window.EtoolsPmpApp.Endpoints.attachmentsUpload.url
      },
      opened: {
        type: Boolean,
        notify: true
      },
      uploadInProgress: {
        type: Boolean,
        value: false
      },
      assessmentModel: {
        type: Object,
        value: {
          type: null,
          completed_date: null,
          current: false,
          report_attachment: null,
          active: true,
          partner: null
        }
      },
      assessmentTypes: {
        type: Array,
        statePath: 'assessmentTypes'
      },
      _validationSelectors: {
        type: Array,
        value: [
          '#assessmentType', '#dateSubmitted', '#report'
        ]
      }
    };

  }

  ready() {
    super.ready();
  }

  _uploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = JSON.parse(e.detail.success);
      this.set('assessment.report_attachment', uploadResponse.id);
    }
  }

  validate() {
    let isValid = true;
    this._validationSelectors.forEach((selector) => {
      let el = this.shadowRoot.querySelector(selector);
      if (el && !el.validate()) {
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
    if (!isNew) {
      delete this.assessment.report;
      delete this.assessment.report_attachment;
    }
    return this.assessment;
  }

  public _pickEndpoint(isNew: boolean, assessId: any) {
    let endpointName = isNew ? 'partnerAssessment' : 'patchPartnerAssessment';
    let endpointParam = isNew ? undefined :
        {assessmentId: assessId};

    return this.getEndpoint(endpointName, endpointParam);
  }

  public _handleResponse(response: any, isNew: boolean) {
    this.set('opened', false);
    this.fireEvent(isNew ? 'assessment-added' : 'assessment-updated', response);
  }

  public _handleErrorResponse(error: any) {
    this.parseRequestErrorsAndShowAsToastMsgs(error, this.toastEventSource);
  }

  public startSpinner() {
    this.$.assessmentDialog.startSpinner();
  }

  public stopSpinner() {
    this.$.assessmentDialog.stopSpinner();
  }

  public resetValidations() {
    this._validationSelectors.forEach((selector) => {
      let el = this.shadowRoot.querySelector(selector);
      if (el) {
        el.invalid = false;
      }
    });
  }

  public initAssessment(assessment: any, partnerId: any) {
    if (!assessment) {
      assessment = JSON.parse(JSON.stringify(this.assessmentModel));
      assessment.partner = partnerId;
    }

    this.assessment = assessment;
    this.resetValidations();
  }

  public _hasId(id: any) {
    return !!id;
  }

  public _archivedChanged(e: CustomEvent) {
    this.set('assessment.active', !e.target.checked);
  }

}

window.customElements.define('assesment-dialog', AssesmentDialog);




