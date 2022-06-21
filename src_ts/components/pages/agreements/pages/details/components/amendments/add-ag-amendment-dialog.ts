import {LitElement, html, customElement, property} from 'lit-element';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown-multi.js';
import '@unicef-polymer/etools-upload/etools-upload.js';
import '@unicef-polymer/etools-date-time/datepicker-lite';

import pmpEndpoints from '../../../../../../endpoints/endpoints.js';
import {validateRequiredFields} from '@unicef-polymer/etools-modules-common/dist/utils/validation-helper';

import {gridLayoutStylesLit} from '@unicef-polymer/etools-modules-common/dist/styles/grid-layout-styles-lit';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {RequiredFieldsStyles} from '@unicef-polymer/etools-modules-common/dist/styles/required-fields-styles';

import {fireEvent} from '../../../../../../utils/fire-custom-event.js';
import {AgreementAmendment} from '@unicef-polymer/etools-types';
import CommonMixinLit from '../../../../../../common/mixins/common-mixin-lit';
import {isJsonStrMatch} from '../../../../../../utils/utils.js';
import {translate} from 'lit-translate';
import cloneDeep from 'lodash-es/cloneDeep';

/**
 * @polymer
 * @customElement
 */
@customElement('add-ag-amendment-dialog')
export class AddAgAmendmentDialog extends CommonMixinLit(LitElement) {
  static get styles() {
    return [gridLayoutStylesLit];
  }
  render() {
    return html`
      ${sharedStyles} ${RequiredFieldsStyles}

      <etools-dialog
        no-padding
        keep-dialog-open
        id="add-ag-amendment"
        opened
        size="md"
        ?hidden="${this.datePickerOpen}"
        .okBtnText="${translate('GENERAL.SAVE')}"
        dialog-title="${translate('ADD_AMENDMENT')}"
        @close="${this._onClose}"
        @confirm-btn-clicked="${this._validateAndSaveAmendment}"
        .disableConfirmBtn="${this.uploadInProgress}"
        .disableDismissBtn="${this.uploadInProgress}"
      >
        <div class="row-h flex-c">
          <div class="col col-4">
            <!-- Signed Date -->
            <datepicker-lite
              id="signedDate"
              label="Signed Date"
              .value="${this.amendment.signed_date}"
              required-error-msg="${translate('PLEASE_SELECT_SIGNED_DATE')}"
              max-date-error-msg="${translate('DATE_CAN_NOT_BE_IN_THE_FUTURE')}"
              .open="${this.datePickerOpen}"
              .autoValidate="${this.autoValidate}"
              max-date="${this.getCurrentDate()}"
              min-date="${this.agreementStart}"
              required
              selected-date-display-format="D MMM YYYY"
              fire-date-has-changed
              @date-has-changed="${(e: CustomEvent) => (this.amendment.signed_date = e.detail.date)}"
            >
            </datepicker-lite>
          </div>
        </div>
        <div class="row-h flex-c">
          <!-- Signed Agreement -->
          <etools-upload
            id="signedAmendment"
            label="${translate('SIGNED_AMENDMENT')}"
            accept=".doc,.docx,.pdf,.jpg,.png"
            .fileUrl="${this.amendment.signed_amendment_attachment}"
            .uploadEndpoint="${this.uploadEndpoint}"
            @upload-started="${this._uploadStarted}"
            @upload-finished="${this._uploadFinished}"
            required
            .uploadInProgress="${this.uploadInProgress}"
            .autoValidate="${this.autoValidate}"
            error-message="${translate('SIGNED_AMENDMENT_FILE_IS_REQUIRED')}"
          >
          </etools-upload>
        </div>

        <div class="row-h flex-c">
          <etools-dropdown-multi
            id="amendmentTypes"
            label="${translate('AMENDMENT_TYPES')}"
            .options="${this.amendmentTypes}"
            .selectedValues="${this.amendment.types}"
            hide-search
            error-message="${translate('PLEASE_SELECT_AMENDMENT_TYPE')}"
            required
            .autoValidate="${this.autoValidate}"
            trigger-value-change-event
            @etools-selected-items-changed="${this.onAmendmentTypesChanged}"
          >
          </etools-dropdown-multi>
        </div>

        ${this._showAuthorizedOfficersField(this.showAuthorizedOfficers, this._aoTypeSelected)
          ? html` <div class="row-h flex-c">
              <etools-dropdown-multi
                id="officers"
                label="${translate('AUTHORIZED_OFFICERS')}"
                placeholder="&#8212;"
                .options="${this.authorizedOfficersOptions}"
                option-value="id"
                option-label="name"
                .selectedValues="${cloneDeep(this.selAuthorizedOfficers)}"
                trigger-value-change-event
                @etools-selected-items-changed="${this.onAuthorizedOfficersChanged}"
                error-message="${translate('PLS_ENTER_PARTNER_AUTH_OFFICERS')}"
                required
                auto-validate
              >
              </etools-dropdown-multi>
            </div>`
          : ''}
      </etools-dialog>
    `;
  }

  @property({type: Boolean})
  datePickerOpen = false;

  @property({type: String})
  uploadEndpoint: string = pmpEndpoints.attachmentsUpload.url;

  @property({type: Array})
  amendmentTypes: [] = [];

  @property({type: Object})
  amendment!: AgreementAmendment;

  @property({type: Boolean})
  autoValidate = false;

  @property({type: Boolean})
  showAuthorizedOfficers = false;

  @property({type: Array})
  authorizedOfficersOptions: [] = [];

  @property({type: Array})
  selAuthorizedOfficers: [] = [];

  @property({type: Boolean})
  _aoTypeSelected = false;

  @property({type: Boolean})
  uploadInProgress = false;

  @property({type: String})
  agreementStart!: string;

  set dialogData(data: any) {
    const {allStaffMembers, showAuthorizedOfficers, amendmentTypes, agreementStart}: any = data;

    this.amendment = new AgreementAmendment();
    this.amendmentTypes = amendmentTypes;
    this.authorizedOfficersOptions = allStaffMembers;
    this.selAuthorizedOfficers = [];
    this.showAuthorizedOfficers = showAuthorizedOfficers;
    this.agreementStart = agreementStart;
    this.autoValidate = true;
    this._aoTypeSelected = false;
  }

  _validateAndSaveAmendment() {
    if (this.validate()) {
      fireEvent(this, 'dialog-closed', {
        confirmed: true,
        response: {
          amendment: this.amendment,
          ao: this.selAuthorizedOfficers
        }
      });
    }
  }

  _onClose() {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  validate() {
    return validateRequiredFields(this);
  }

  _showAuthorizedOfficersField(showAuthorizedOfficers: boolean, _aoTypeSelected: boolean) {
    return showAuthorizedOfficers && _aoTypeSelected;
  }

  onAmendmentTypesChanged(e: CustomEvent) {
    const selectedTypes = e.detail.selectedItems.map((i: any) => i['value']);
    if (!isJsonStrMatch(selectedTypes, this.amendment.types)) {
      this.amendment.types = selectedTypes;
    }
    this._aoTypeSelected = this._isAoTypeSelected();
  }

  onAuthorizedOfficersChanged(e: CustomEvent) {
    const selectedOfficers = e.detail.selectedItems.map((i: any) => String(i['id']));
    if (!isJsonStrMatch(selectedOfficers, this.selAuthorizedOfficers)) {
      this.selAuthorizedOfficers = selectedOfficers;
    }
  }

  _isAoTypeSelected() {
    if (!(this.amendment && this.amendment.types instanceof Array && this.amendment.types.length > 0)) {
      return false;
    }
    return this.amendment.types.indexOf('Change authorized officer') > -1;
  }

  _uploadFinished(e: CustomEvent) {
    if (e.detail.success) {
      const uploadResponse = e.detail.success;
      this.amendment.signed_amendment_attachment = uploadResponse.id;
      this.amendment = {...this.amendment};
      this.uploadInProgress = false;
    }
  }

  _uploadStarted() {
    this.uploadInProgress = true;
  }

  getCurrentDate() {
    return new Date();
  }
}
