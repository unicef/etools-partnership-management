import { PolymerElement, html } from '@polymer/polymer';
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import 'etools-dialog/etools-dialog.js';
import 'etools-dropdown/etools-dropdown-multi.js';
import 'etools-upload/etools-upload.js';
import 'etools-date-time/datepicker-lite.js';
import pmpEndpoints from '../../../../../../endpoints/endpoints.js';
import { AgreementAmendment } from '../../../../agreement.types';
import { SharedStyles } from '../../../../../../styles/shared-styles';
import { gridLayoutStyles } from '../../../../../../styles/grid-layout-styles';
import { requiredFieldStarredStyles } from '../../../../../../styles/required-field-styles';
import { fireEvent } from '../../../../../../utils/fire-custom-event.js';

/**
 * @polymer
 * @customElement
 * @appliesMixin EtoolsLogsMixin
 */
class AddAgAmendmentDialog extends EtoolsMixinFactory.combineMixins([
  EtoolsLogsMixin
], PolymerElement) {
  [x: string]: any;

  static get template() {
    return html`
      ${SharedStyles} ${gridLayoutStyles} ${requiredFieldStarredStyles}

      <etools-dialog no-padding
                    keep-dialog-open
                    id="add-ag-amendment"
                    opened="{{opened}}"
                    size="md"
                    hidden$="[[datePickerOpen]]"
                    ok-btn-text="Save"
                    dialog-title="Add Amendment"
                    on-close="_handleDialogClosed"
                    on-confirm-btn-clicked="_validateAndSaveAmendment"
                    disable-confirm-btn="[[uploadInProgress]]"
                    disable-dismiss-btn="[[uploadInProgress]]">

        <div class="row-h flex-c">
          <div class="col col-4">
            <!-- Signed Date -->
            <datepicker-lite id="signedDate"
                              label="Signed Date"
                              value="{{amendment.signed_date}}"
                              required-error-msg="Please select signed date"
                              max-date-error-msg="Date can not be in the future"
                              open="{{datePickerOpen}}"
                              auto-validate="[[autoValidate]]"
                              max-date="[[getCurrentDate()]]"
                              required>
            </datepicker-lite>
          </div>
        </div>
        <div class="row-h flex-c">
          <!-- Signed Agreement -->
          <etools-upload id="signedAmendment"
                        label="Signed Amendment"
                        accept=".doc,.docx,.pdf,.jpg,.png"
                        file-url="[[amendment.signed_amendment_attachment]]"
                        upload-endpoint="[[uploadEndpoint]]"
                        on-upload-finished="_uploadFinished"
                        required
                        upload-in-progress="{{uploadInProgress}}"
                        auto-validate="[[autoValidate]]"
                        error-message="Signed Amendment file is required">
          </etools-upload>
        </div>

        <div class="row-h flex-c">
          <etools-dropdown-multi id="amendmentTypes"
                                label="Amendment Types"
                                options="[[amendmentTypes]]"
                                selected-values="{{amendment.types}}"
                                hide-search
                                error-message="Please select amendment type"
                                required
                                auto-validate="[[autoValidate]]"
                                trigger-value-change-event
                                on-etools-selected-items-changed="_onAmendmentTypesSelected">
          </etools-dropdown-multi>
        </div>

        <template is="dom-if" if="[[_showAuthorizedOfficersField(showAuthorizedOfficers, _aoTypeSelected)]]" restamp>
          <div class="row-h flex-c">
            <etools-dropdown-multi id="officers"
                                  label="Authorized Officers"
                                  placeholder="&#8212;"
                                  options="[[authorizedOfficersOptions]]"
                                  option-value="id"
                                  option-label="name"
                                  selected-values="{{authorizedOfficers}}"
                                  error-message="Please enter Partner Authorized Officer(s)"
                                  required auto-validate>
            </etools-dropdown-multi>
          </div>
        </template>

      </etools-dialog>
    `;
  }

  static get properties() {
    return {
      opened: {
        type: Boolean,
        value: false
      },
      datePickerOpen: {
        type: Boolean,
        value: false
      },
      uploadEndpoint: {
        type: String,
        value: () => pmpEndpoints.attachmentsUpload.url
      },
      amendmentTypes: {
        type: Array,
        value: []
      },
      amendment: Object,
      autoValidate: {
        type: Boolean,
        value: false
      },
      showAuthorizedOfficers: {
        type: Boolean,
        value: false
      },
      authorizedOfficersOptions: {
        type: Array,
        value: []
      },
      authorizedOfficers: {
        type: Array,
        value: []
      },
      _aoTypeSelected: {
        type: Boolean,
        value: false
      },
      _validationSelectors: {
        type: Array,
        value: ['#signedDate', '#signedAmendment', '#amendmentTypes', '#officers']
      },
      uploadInProgress: {
        type: Boolean,
        value: false
      }
    };
  }

  initData(authorizedOfficers: any, showAuthorizedOfficers: any, amendmentTypes: any) {
    this.set('amendment', new AgreementAmendment());
    this.set('amendmentTypes', amendmentTypes);
    this.set('authorizedOfficersOptions',
        JSON.parse(JSON.stringify(authorizedOfficers)));
    this.set('authorizedOfficers', []);
    this.set('showAuthorizedOfficers', showAuthorizedOfficers);
    this.set('autoValidate', true);
    this.set('_aoTypeSelected', false);
    this._resetValidations();
  }

  _validateAndSaveAmendment() {
    if (this.validate()) {
      fireEvent(this, 'update-amendment-and-ao', {
        amendment: this.amendment,
        ao: JSON.parse(JSON.stringify(this.authorizedOfficers))});
      this.set('opened', false);
    }
  }

  _handleDialogClosed() {
    this.set('autoValidate', false);
    this._resetValidations();
  }

  _resetValidations() {
    this._validationSelectors.forEach((selector: string) => {
      let el = this.shadowRoot.querySelector(selector);
      if (el) {
        el.set('invalid', false);
      }
    });
  }

  validate() {
    let isValid = true;
    this._validationSelectors.forEach((selector: string) => {
      let el = this.shadowRoot.querySelector(selector);
      if (el && !el.validate()) {
        isValid = false;
      }
    });
    return isValid;
  }

  _showAuthorizedOfficersField(showAuthorizedOfficers: boolean, _aoTypeSelected: boolean) {
    return showAuthorizedOfficers && _aoTypeSelected;
  }

  _onAmendmentTypesSelected() {
    this.set('_aoTypeSelected', this._isAoTypeSelected());
  }

  _isAoTypeSelected() {
    if (!(this.amendment && this.amendment.types instanceof Array && this.amendment.types.length > 0)) {
      return false;
    }
    return this.amendment.types.indexOf('Change authorized officer') > -1;
  }

  _uploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = JSON.parse(e.detail.success);
      this.set('amendment.signed_amendment_attachment', uploadResponse.id);
    }
  }

  getCurrentDate() {
    return new Date();
  }

}

window.customElements.define('add-ag-amendment-dialog', AddAgAmendmentDialog);
