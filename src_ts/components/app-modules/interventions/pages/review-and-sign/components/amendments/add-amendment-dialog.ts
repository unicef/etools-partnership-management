import { PolymerElement, html } from '@polymer/polymer';
import '@polymer/paper-input/paper-input.js';
import 'etools-dialog/etools-dialog.js';
import 'etools-dropdown/etools-dropdown-multi.js';
import 'etools-upload/etools-upload.js';
import 'etools-date-time/datepicker-lite.js';

import '../../../../../../layout/etools-warn-message';
import EndpointsMixin from '../../../../../../endpoints/endpoints-mixin';
import { fireEvent } from '../../../../../../utils/fire-custom-event';
import { connect } from 'pwa-helpers/connect-mixin';
import { store, RootState } from '../../../../../../../store';
import { gridLayoutStyles } from '../../../../../../styles/grid-layout-styles';
import { buttonsStyles } from '../../../../../../styles/buttons-styles';
import { SharedStyles } from '../../../../../../styles/shared-styles';
import { requiredFieldStarredStyles } from '../../../../../../styles/required-field-styles';
import pmpEndpoints from '../../../../../../endpoints/endpoints';
import { isJsonStrMatch } from '../../../../../../utils/utils';
import { LabelAndValue } from '../../../../../../../typings/globals.types';
import { InterventionAmendment } from '../../../../../../../typings/intervention.types';
import {parseRequestErrorsAndShowAsToastMsgs} from '../../../../../../utils/ajax-errors-parser';
import CONSTANTS from '../../../../../../../config/app-constants';
import {property} from '@polymer/decorators';
import EtoolsDialog from "etools-dialog/etools-dialog";
import {EtoolsDropdownMultiEl} from "etools-dropdown/etools-dropdown-multi";



/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 */
class AddAmendmentDialog extends connect(store)(EndpointsMixin(PolymerElement)) {
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
                            required
                            selected-date-display-format="D MMM YYYY">
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
          <etools-warn-message messages="[[_getSelectedAmendmentTypeWarning(newAmendment.types, newAmendment.types.length)]]">
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

  @property({type: String})
  endpointName: string = 'interventionAmendmentAdd';

  @property({type: Object})
  toastEventSource!: PolymerElement;

  @property({type: Boolean})
  datePickerOpen: boolean = false;

  @property({type: Boolean, notify: true, observer: '_resetFields'})
  opened: boolean = false;

  @property({type: Number})
  interventionId: number | null = null;

  @property({type: String})
  interventionDocumentType: string = '';

  @property({type: Array})
  amendmentTypes!: LabelAndValue[];

  @property({type: Object})
  newAmendment!: InterventionAmendment;

  @property({type: String})
  uploadEndpoint: string =  pmpEndpoints.attachmentsUpload.url;

  @property({type: Boolean, computed: 'getUploadInProgress(amdUploadInProgress, prcUploadInProgress)'})
  uploadInProgress: boolean = false;

  @property({type: Boolean})
  amdUploadInProgress: boolean = false;

  @property({type: Boolean})
  prcUploadInProgress: boolean = false;

  @property({type: Array})
  filteredAmendmentTypes!: LabelAndValue[];

  private _validationSelectors: string[] = ['#amendment-types', '#signed-date', '#signed-agreement-upload', '#other'];

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
    this.set('newAmendment', new InterventionAmendment());
  }

  startSpinner() {
    (this.shadowRoot!.querySelector('#add-amendment') as EtoolsDialog).startSpinner();
  }

  stopSpinner() {
    (this.shadowRoot!.querySelector('#add-amendment') as EtoolsDialog).stopSpinner();
  }

  _filterAmendmentTypes(amendmentTypes: LabelAndValue[], interventionDocumentType: string) {
    if (!amendmentTypes || !interventionDocumentType) {
      return;
    }
    if (interventionDocumentType === CONSTANTS.DOCUMENT_TYPES.SSFA) {
       this.filteredAmendmentTypes = this.amendmentTypes.filter((type: LabelAndValue) => {
       return ['no_cost',
               'other'].indexOf(type.value) > -1;
             });
    } else {
      this.filteredAmendmentTypes = JSON.parse(JSON.stringify(this.amendmentTypes));
    }
    const typesDropdw = this.shadowRoot!.querySelector('#amendment-types') as EtoolsDropdownMultiEl;

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
      let el = this.shadowRoot!.querySelector(selector) as PolymerElement & {validate(): boolean};
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
      let el = this.shadowRoot!.querySelector(selector) as PolymerElement;
      if (el) {
        el.set('invalid', false);
      }
    });
  }

  _getSelectedAmendmentTypeWarning(types: string[]) {
    if (!types || !types.length) {
      return;
    }
    let messages: string[] = [];
    types.forEach((amdType: string) => {
      switch (amdType) {
        case 'admin_error':
          messages.push('Corrections in the programme document due to typos or administrative error.');
          break;
        case 'budget_lte_20':
          messages.push('Changes to the budget of activities resulting in a change in the UNICEF contribution ≤20% of ' +
              'previously approved cash and/or supplies, with or without changes to the programme results.');
          break;
        case 'budget_gt_20':
          messages.push('Changes to the budget of activities resulting in a change in the UNICEF contribution >20% of ' +
              'previously approved cash and/or supplies, with or without changes to the programme results.');
          break;
        case 'no_cost':
          messages.push('No cost extension');
          break;
        case 'change':
          messages.push('Changes to planned results, population or geographical coverage of the programme with no ' +
              'change in UNICEF contribution.');
          break;
        case 'other':
          messages.push('Other');
          break;
      }
    });
    return messages;
  }

  _validateAndSaveAmendment() {
    if (!this.isValidAmendment()) {
      return;
    }
    this._saveAmendment(this.newAmendment);
  }

  _saveAmendment(newAmendment: InterventionAmendment) {
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
        .then((resp: InterventionAmendment) => {
          this._handleResponse(resp);
          this.stopSpinner();
        }).catch((error: any) => {
          this._handleErrorResponse(error);
          this.stopSpinner();
    });
  }

  _handleResponse(response: InterventionAmendment) {
    this.set('opened', false);
    fireEvent(this, 'amendment-added', response);
  }

  _handleErrorResponse(error: any) {
    parseRequestErrorsAndShowAsToastMsgs(error, this.toastEventSource);
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
export {AddAmendmentDialog};
