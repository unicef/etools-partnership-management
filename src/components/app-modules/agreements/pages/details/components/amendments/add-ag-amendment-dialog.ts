import { PolymerElement, html } from '@polymer/polymer';
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
// @ts-ignore
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';
import EventHelperMixin from '../../../../../../mixins/event-helper-mixin';
import pmpEndpoints from '../../../../../../endpoints/endpoints.js';
import { AgreementAmendment } from '../../../../agreement';

/**
 * @polymer
 * @customElement
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin EventHelperMixin
 */
class AddAgAmendmentDialog extends EtoolsMixinFactory.combineMixins([
  EtoolsLogsMixin,
  EventHelperMixin
], PolymerElement) {

  static get template() {
    return html`

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
        value: function() {
          return pmpEndpoints.attachmentsUpload.url;
        }
      },
      amendmentTypes: {
        type: Array,
        value: []
      },
      amendment: Object,
      amendmentModel: {
        type: Object,
        value: () => new AgreementAmendment()
      },
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

  initData(authorizedOfficers: any, showAuthorizedOfficers: boolean, amendmentTypes: []) {
    this.set('amendment', JSON.parse(JSON.stringify(this.amendmentModel)));
    this.set('amendmentTypes', amendmentTypes);
    this.set('authorizedOfficersOptions',
        JSON.parse(JSON.stringify(authorizedOfficers)));
    this.set('authorizedOfficers', []);
    this.set('showAuthorizedOfficers', showAuthorizedOfficers);
    this.set('autoValidate', true);
    this.set('_aoTypeSelected', false);
    this._resetValidations();
  }

  _validateAndSaveAmendment(e: CustomEvent) {
    if (this.validate()) {
      this.fireEvent('update-amendment-and-ao', {
        amendment: this.amendment,
        ao: JSON.parse(JSON.stringify(this.authorizedOfficers))});
      this.set('opened', false);
    }
  }

  _handleDialogClosed(e: CustomEvent) {
    this.set('autoValidate', false);
    this._resetValidations();
  }

  _resetValidations() {
    this._validationSelectors.forEach((selector) => {
      let el = this.shadowRoot.querySelector(selector);
      if (el) {
        el.set('invalid', false);
      }
    });
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

}

window.customElements.define('add-ag-amendment-aialog', AddAgAmendmentDialog);
