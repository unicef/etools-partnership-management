import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-input/paper-input.js';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import 'etools-dialog/etools-dialog.js';
import 'etools-dropdown/etools-dropdown-multi.js';
import 'etools-upload/etools-upload.js';
import 'etools-date-time/datepicker-lite.js';


import '../../../../../../layout/etools-warn-message.js';
import '../../../../../../../validators/required-and-not-future-date-validator.js';
import EndpointsMixin from '../../../../../../endpoints/endpoints-mixin.js';
import { fireEvent } from '../../../../../../utils/fire-custom-event.js';
import AjaxErrorsParserMixin from '../../../../../../mixins/ajax-errors-parser-mixin.js';
import { connect } from 'pwa-helpers/connect-mixin';
import { store, RootState } from '../../../../../../../store.js';
import { gridLayoutStyles } from '../../../../../../styles/grid-layout-styles.js';
import { buttonsStyles } from '../../../../../../styles/buttons-styles.js';
import { SharedStyles } from '../../../../../../styles/shared-styles.js';
import { requiredFieldStarredStyles } from '../../../../../../styles/required-field-styles.js';
import pmpEndpoints from '../../../../../../endpoints/endpoints.js';
import CONSTANTS from '../../../../../../../config/app-constants.js';
import { isJsonStrMatch } from '../../../../../../utils/utils.js';



/**
 * @polymer
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin EventHelper
 * @appliesMixin AjaxErrorsParser
 */
const AddAmendmentDialogMixin = EtoolsMixinFactory.combineMixins([
  EndpointsMixin,
  AjaxErrorsParserMixin,
], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin AddAmendmentDialogMixin
 */
class AddAmendmentDialog extends connect(store)(AddAmendmentDialogMixin) {
  static get template() {
    return html`
      ${gridLayoutStyles} ${buttonsStyles} ${SharedStyles} ${requiredFieldStarredStyles}
      <style>

        paper-input#other {
          width: 100%;
        }

        .row-h {
          padding-top: 0;
          padding-bottom: 16px;
          overflow: hidden;
        }
      </style>

      <etools-dialog no-padding
                    keep-dialog-open
                    id="add-amendment"
                    opened="{{opened}}"
                    size="md"
                    hidden$="[[datePickerOpen]]"
                    ok-btn-text="Save"
                    dialog-title="Add Amendment"
                    on-confirm-btn-clicked="_validateAndSaveAmendment"
                    disable-confirm-btn="[[uploadInProgress]]"
                    disable-dismiss-btn="[[uploadInProgress]]">

        <div class="row-h flex-c">

          <!-- Signed Date -->
          <datepicker-lite id="signed-date"
                            label="Signed date"
                            value="{{newAmendment.signed_date}}"
                            open="{{datePickerOpen}}"
                            max-date="[[getCurrentDate()]]"
                            max-date-error-msg="Date can not be in the future"
                            auto-validate
                            required>
          </datepicker-lite>
        </div>
        <div class="row-h flex-c">
          <!-- Amendment Type -->
          <etools-dropdown-multi id="amendment-types"
                                label="Amendment Types"
                                placeholder="&#8212;"
                                options="[[filteredAmendmentTypes]]"
                                selected-values="{{newAmendment.types}}"
                                hide-search
                                required auto-validate
                                error-message="Type is required">
          </etools-dropdown-multi>
        </div>
        <div class="row-h flex-c" hidden$="[[!newAmendment.types.length]]">
          <etools-warn-message message="[[_getSelectedAmendmentTypeWarning(newAmendment.types, newAmendment.types.length)]]">
          </etools-warn-message>
        </div>
        <div class="row-h" hidden$="[[!_showOtherInput(newAmendment.types, newAmendment.types.length)]]">
          <paper-input id="other"
                      placeholder="&#8212;"
                      label="Other"
                      invalid
                      required
                      auto-validate
                      error-message="This is required"
                      value="{{newAmendment.other_description}}">
          </paper-input>
        </div>
        <div class="row-h flex-c">
          <!-- Signed Agreement -->
          <etools-upload id="signed-agreement-upload"
                        label="Signed Amendment"
                        accept=".doc,.docx,.pdf,.jpg,.png"
                        file-url="[[newAmendment.signed_amendment_attachment]]"
                        upload-endpoint="[[uploadEndpoint]]"
                        on-upload-finished="_amendmentUploadFinished"
                        required
                        auto-validate
                        upload-in-progress="{{amdUploadInProgress}}"
                        error-message="Attachment required">
          </etools-upload>
        </div>
        <div class="row-h flex-c">
          <etools-upload id="prc-review-upload"
                        label="Internal / PRC Reviews"
                        accept=".doc,.docx,.pdf,.jpg,.png"
                        file-url="[[newAmendment.internal_prc_review]]"
                        upload-endpoint="[[uploadEndpoint]]"
                        upload-in-progress="{{prcUploadInProgress}}"
                        on-upload-finished="_prcReviewUploadFinished">
          </etools-upload>
        </div>
      </etools-dialog>
    `;
  }

  static get properties() {
    return {
      endpointName: {
        type: String,
        value: 'interventionAmendmentAdd'
      },
      toastEventSource: {
        type: Object
      },
      datePickerOpen: {
        type: Boolean,
        value: false
      },
      opened: {
        type: Boolean,
        notify: true,
        observer: '_resetFields'
      },
      interventionId: {
        type: Number
      },
      interventionDocumentType: {
        type: String
      },
      amendmentTypes: {
        type: Object,
        statePath: 'interventionAmendmentTypes'
      },
      filteredAmendmentTypes: {
        type: Object
      },
      newAmendment: {
        type: Object
      },
      newAmendmentModel: {
        type: Object,
        value: {
          'types': [],
          'other_description': null,
          'signed_date': null,
          'signed_amendment_attachment': null,
          'amendment_number': null,
          'internal_prc_review': null
        }
      },
      uploadEndpoint: {
        type: String,
        value: function() {
          return pmpEndpoints.attachmentsUpload.url;
        }
      },
      _validationSelectors: {
        type: Array,
        value: ['#amendment-types', '#signed-date', '#signed-agreement-upload', '#other']
      },
      uploadInProgress: {
        type: Boolean,
        value: false,
        computed: 'getUploadInProgress(amdUploadInProgress, prcUploadInProgress)'
      },
      amdUploadInProgress: {
        type: Boolean,
        value: false
      },
      prcUploadInProgress: {
        type: Boolean,
        value: false
      }
    };
  }

  static get observers() {
    return [
      '_filterAmendmentTypes(amendmentTypes, interventionDocumentType)'
    ];
  }

  stateChanged(state: RootState) {
    if (!isJsonStrMatch(this.amendmentTypes, state.commonData!.interventionAmendmentTypes)) {
      this.amendmentTypes = [...state.commonData!.interventionAmendmentTypes];
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this.resetAmendment();
  }

  getUploadInProgress(amdInProgress: boolean, prcInProgress: boolean) {
    return amdInProgress || prcInProgress;
  }

  resetAmendment() {
    this.set('newAmendment', JSON.parse(JSON.stringify(this.newAmendmentModel)));
  }

  startSpinner() {
    this.shadowRoot.querySelector('#add-amendment').startSpinner();
  }

  stopSpinner() {
    this.shadowRoot.querySelector('#add-amendment').stopSpinner();
  }

  _filterAmendmentTypes(amendmentTypes: any, interventionDocumentType: any) {
    if (!amendmentTypes || !interventionDocumentType) {
      return;
    }
    if (interventionDocumentType === CONSTANTS.DOCUMENT_TYPES.SSFA) {
      this.filteredAmendmentTypes = this.amendmentTypes.filter((newAmendment) => {
        return [CONSTANTS.PD_AMENDMENT_TYPES.Dates,
                CONSTANTS.PD_AMENDMENT_TYPES.Other].indexOf(newAmendment.label) > -1;
      });
    } else {
      this.filteredAmendmentTypes = JSON.parse(JSON.stringify(this.amendmentTypes));
    }
    const typesDropdw = this.shadowRoot.querySelector('#amendment-types');
    if (typesDropdw) {
      typesDropdw.set('invalid', false); // to fix eager validation
    }
  }

  _showOtherInput() {
    let amdTypes = this.newAmendment.types;
    return amdTypes && amdTypes.indexOf('other') > -1;
  }

  isValidAmendment() {
    let isValid = true;
    this._validationSelectors.forEach((selector: string) => {
      let el = this.shadowRoot.querySelector(selector);
      if (selector === '#other' && !this._showOtherInput()) {
        return;
      }
      if (el && !el.validate()) {
        isValid = false;
      }
    });
    return isValid;
  }

  _resetFields() {
    this.resetAmendment();
    this._resetAmendmentValidations();
  }

  _resetAmendmentValidations() {
    this._validationSelectors.forEach((selector: string) => {
      let el = this.shadowRoot.querySelector(selector);
      if (el) {
        el.set('invalid', false);
      }
    });
  }

  _getSelectedAmendmentTypeWarning(types: any) {
    if (!types || !types.length) {
      return;
    }
    let message = 'Please make sure you update ';
    types.forEach((amdType: string) => {
      switch (amdType) {
        case 'dates':
          message += 'Dates, ';
          break;
        case 'results':
          message += 'Programme Results, ';
          break;
        case 'budget':
          message += 'Planned Budget, ';
          break;
        case 'other':
          message += 'Other, ';
          break;
      }
    });
    message = message.substring(0, message.length - 2);
    message += ' section' + (message.indexOf(',') > -1 ? 's' : '') + ' of this PD/SSFA';
    return message;
  }

  _validateAndSaveAmendment() {
    if (!this.isValidAmendment()) {
      return;
    }
    this._saveAmendment(this.newAmendment);
  }

  _saveAmendment(newAmendment: any) {
    if (!newAmendment.internal_prc_review) {
      delete newAmendment.internal_prc_review;
    }
    let options = {
      method: 'POST',
      endpoint: this.getEndpoint(this.endpointName, {intervId: this.interventionId}),
      body: newAmendment
    };
    this.startSpinner();
    this.sendRequest(options)
        .then((resp: any) => {
          this._handleResponse(resp);
          this.stopSpinner();
        }).catch((error: any) => {
          this._handleErrorResponse(error);
          this.stopSpinner();
    });
  }

  _handleResponse(response: any) {
    this.set('opened', false);
    fireEvent(this, 'amendment-added', response);
  }

  _handleErrorResponse(error: any) {
    this.parseRequestErrorsAndShowAsToastMsgs(error, this.toastEventSource);
  }

  _amendmentUploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = JSON.parse(e.detail.success);
      this.set('newAmendment.signed_amendment_attachment', uploadResponse.id);
    }
  }

  _prcReviewUploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = JSON.parse(e.detail.success);
      this.set('newAmendment.internal_prc_review', uploadResponse.id);
    }
  }

  getCurrentDate() {
    return new Date();
  }
}

window.customElements.define('add-amendment-dialog', AddAmendmentDialog);
