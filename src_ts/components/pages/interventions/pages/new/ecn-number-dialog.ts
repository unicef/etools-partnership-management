/* eslint-disable lit-a11y/no-autofocus */
import {LitElement, html, customElement, property} from 'lit-element';
import '@polymer/paper-input/paper-input.js';
import '@unicef-polymer/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {translate} from 'lit-translate';
import {fireEvent} from '@unicef-polymer/etools-modules-common/dist/utils/fire-custom-event';
import {sendRequest} from '@unicef-polymer/etools-ajax';
import pmpEdpoints from '../../../../endpoints/endpoints';
import {ROOT_PATH} from '@unicef-polymer/etools-modules-common/dist/config/config';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-ajax/ajax-error-parser';
import {RootState, store} from '../../../../../redux/store';
import {setShouldReGetList} from '../intervention-tab-pages/common/actions/interventions';
import {MinimalAgreement} from '@unicef-polymer/etools-types';

/**
 * @polymer
 * @customElement
 */
@customElement('ecn-number-dialog')
export class EcnNumberDialog extends LitElement {
  render() {
    // language=HTML
    return html`
      ${sharedStyles}
      <style>
        #container {
          padding-top: 12px;
          padding-bottom: 12px;
        }
      </style>
      <etools-dialog
        id="ecnDialog"
        size="md"
        ok-btn-text="Save"
        ?disable-confirm-btn="${this.numberIsEmpty}"
        dialog-title="${translate('IMPORT_ECN')}"
        keep-dialog-open
        ?show-spinner="${this.loadingInProcess}"
        opened
        @close="${this._onClose}"
        @confirm-btn-clicked="${this.save}"
      >
        <div id="container">
          <paper-input
            id="ecnNo"
            label="${translate('ECN_NUMBER')}"
            .value="${this.ecnNumber}"
            @value-changed="${({detail}: CustomEvent) => {
              this.ecnNumber = detail.value;
            }}"
            placeholder="&#8212;"
            autofocus
            required
            auto-validate
            error-message="${translate('GENERAL.REQUIRED_FIELD')}"
          ></paper-input>
          <etools-dropdown
            id="agreement"
            .options="${this.allAgreements}"
            label="${translate('AGREEMENT')}"
            option-value="id"
            option-label="agreement_number"
            trigger-value-change-event
            @etools-selected-item-changed="${(e: CustomEvent) => {
              const id = e.detail.selectedItem?.id;
              if (this.selectedAgreementId && this.selectedAgreementId == id) {
                return;
              }
              this.selectedAgreementId = id;
            }}"
            required
            auto-validate
          >
          </etools-dropdown>
        </div>
      </etools-dialog>
    `;
  }

  _ecnNumber!: string;

  set ecnNumber(ecnNo: string) {
    this._ecnNumber = ecnNo;
    this.numberIsEmpty = !this.ecnNumber || !this.ecnNumber.trim();
  }

  @property({type: String})
  get ecnNumber() {
    return this._ecnNumber;
  }

  @property({type: Boolean})
  numberIsEmpty = true;

  @property() loadingInProcess = false;

  @property({type: Array})
  allAgreements!: MinimalAgreement[];

  @property({type: String})
  selectedAgreementId!: string;

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.allAgreements = (store.getState() as RootState).agreements!.list;
  }

  save() {
    if (!this.ecnNumber.trim() || !this.selectedAgreementId) {
      return;
    }
    this.loadingInProcess = true;
    sendRequest({
      endpoint: pmpEdpoints.importECN,
      method: 'POST',
      body: {number: this.ecnNumber.trim(), agreement: this.selectedAgreementId}
    })
      .then((interventionId: number) => {
        this.loadingInProcess = false;
        store.dispatch(setShouldReGetList(true));
        fireEvent(this, 'dialog-closed', {confirmed: true});
        history.pushState(window.history.state, '', `${ROOT_PATH}interventions/${interventionId}/metadata`);
        window.dispatchEvent(new CustomEvent('popstate'));
      })
      .catch((err: any) => {
        this.loadingInProcess = false;
        parseRequestErrorsAndShowAsToastMsgs(err, this);
      });
  }
}
