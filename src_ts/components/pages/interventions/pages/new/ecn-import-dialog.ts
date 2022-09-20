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
import {LocationObject, MinimalAgreement} from '@unicef-polymer/etools-types';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';

/**
 * @polymer
 * @customElement
 */
@customElement('ecn-import-dialog')
export class EcnImportDialog extends ComponentBaseMixin(LitElement) {
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
        ok-btn-text="${translate('IMPORT')}"
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
            @value-changed="${({detail}: CustomEvent) => {
              this.valueChanged(detail, 'number');
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
            @etools-selected-item-changed="${({detail}: CustomEvent) => this.selectedItemChanged(detail, 'agreement')}"
            required
            auto-validate
          >
          </etools-dropdown>
          <etools-dropdown-multi
            id="locationsDropdw"
            label=${translate('LOCATIONS')}
            placeholder="&#8212;"
            .options="${this.allLocations}"
            option-label="name"
            option-value="id"
            required
            auto-validate
            trigger-value-change-event
            @etools-selected-items-changed="${({detail}: CustomEvent) =>
              this.selectedItemsChanged(detail, 'locations')}"
          >
          </etools-dropdown-multi>
          <etools-dropdown-multi
            id="sectionsDropdw"
            label=${translate('SECTIONS')}
            placeholder="&#8212;"
            .options="${this.allSections}"
            option-label="name"
            option-value="id"
            required
            auto-validate
            trigger-value-change-event
            @etools-selected-items-changed="${({detail}: CustomEvent) => this.selectedItemsChanged(detail, 'sections')}"
          >
          </etools-dropdown-multi>
          <etools-dropdown-multi
            id="officesDropdw"
            label=${translate('OFFICES')}
            placeholder="&#8212;"
            .options="${this.allOffices}"
            option-label="name"
            option-value="id"
            required
            auto-validate
            trigger-value-change-event
            @etools-selected-items-changed="${({detail}: CustomEvent) => this.selectedItemsChanged(detail, 'offices')}"
          >
          </etools-dropdown-multi>
        </div>
      </etools-dialog>
    `;
  }

  @property() loadingInProcess = false;

  @property({type: Array})
  allAgreements!: MinimalAgreement[];

  @property({type: Array})
  allLocations!: LocationObject[];

  @property({type: Array})
  allSections!: any[];

  @property({type: Array})
  allOffices!: any[];

  @property({type: String})
  selectedAgreementId!: string;

  @property({type: Object})
  data!: any;

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.allAgreements = (store.getState() as RootState).agreements!.list;
    this.allLocations = (store.getState() as RootState).commonData!.locations;
    this.allSections = (store.getState() as RootState).commonData!.sections;
    this.allOffices = (store.getState() as RootState).commonData!.offices;
  }

  validate() {
    let valid = true;
    const elements = this.shadowRoot?.querySelectorAll('[required]');
    elements?.forEach((el: any) => {
      if (!el.validate()) {
        valid = false;
      }
    });
    return valid;
  }

  save() {
    if (!this.validate()) {
      return;
    }
    this.loadingInProcess = true;
    sendRequest({
      endpoint: pmpEdpoints.importECN,
      method: 'POST',
      body: this.data
    })
      .then((intervention: any) => {
        this.loadingInProcess = false;
        store.dispatch(setShouldReGetList(true));
        fireEvent(this, 'dialog-closed', {confirmed: true});
        history.pushState(window.history.state, '', `${ROOT_PATH}interventions/${intervention.id}/metadata`);
        window.dispatchEvent(new CustomEvent('popstate'));
      })
      .catch((err: any) => {
        this.loadingInProcess = false;
        parseRequestErrorsAndShowAsToastMsgs(err, this);
      });
  }
}
