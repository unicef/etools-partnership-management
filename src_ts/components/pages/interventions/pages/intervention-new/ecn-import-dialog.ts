/* eslint-disable lit-a11y/no-autofocus */
import {LitElement, html} from 'lit';
import {property, customElement} from 'lit/decorators.js';
import '@unicef-polymer/etools-unicef/src/etools-dialog/etools-dialog.js';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown-multi';
import {sharedStyles} from '@unicef-polymer/etools-modules-common/dist/styles/shared-styles-lit';
import {translate} from '@unicef-polymer/etools-unicef/src/etools-translate';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {sendRequest} from '@unicef-polymer/etools-utils/dist/etools-ajax';
import pmpEdpoints from '../../../../endpoints/endpoints';
import {parseRequestErrorsAndShowAsToastMsgs} from '@unicef-polymer/etools-utils/dist/etools-ajax/ajax-error-parser';
import {RootState, store} from '../../../../../redux/store';
import {setShouldReGetList} from '../intervention-tab-pages/common/actions/interventions';
import {LocationObject, MinimalAgreement} from '@unicef-polymer/etools-types';
import ComponentBaseMixin from '@unicef-polymer/etools-modules-common/dist/mixins/component-base-mixin';
import CONSTANTS from '../../../../../config/app-constants';
import {csoPartnersSelector} from '../../../../../redux/reducers/partners';
import {EtoolsInput} from '@unicef-polymer/etools-unicef/src/etools-input/etools-input';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';

/**
 * @LitElement
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
        paper-input {
          --paper-input-container: {
            max-width: 650px;
          };
        }
      </style>
      <etools-dialog
        id="ecnDialog"
        size="md"
        ok-btn-text="${translate('IMPORT')}"
        dialog-title="${translate('IMPORT_ECN')}"
        keep-dialog-open
        ?show-spinner="${this.loadingInProcess}"
        @close="${this._onClose}"
        @confirm-btn-clicked="${this.save}"
      >
        <div id="container">
          <etools-input
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
          ></etools-input>
          <etools-input
            id="unppNumber"
            pattern="CEF/[a-zA-Z]{3}/\\d{4}/\\d{3}"
            label=${translate('UNPP_CFEI_DSR_REF_NUM')}
            placeholder="CEF/___/____/___"
            error-message="${translate('NEW_INTERVENTION.CFEI_EXPECTED_FORMAT_SHORT')}"
            required
            @blur="${(ev: CustomEvent) => this.validateCFEI(ev)}"
            @value-changed="${({detail}: CustomEvent) => this.valueChanged(detail, 'cfei_number')}"
          ></etools-input>
          <etools-dropdown
            id="partnerDropdw"
            label=${translate('NEW_INTERVENTION.PARTNER_ORGANIZATION')}
            placeholder="&#8212;"
            .options="${this.allPartners}"
            option-value="id"
            option-label="name"
            error-message=${translate('NEW_INTERVENTION.PARTNER_REQUIRED')}
            trigger-value-change-event
            @etools-selected-item-changed="${(event: CustomEvent) => this.partnerChanged(event)}"
            required
            auto-validate
          >
          </etools-dropdown>
          <etools-dropdown
            id="agreement"
            .options="${this.filteredAgreements}"
            label="${translate('AGREEMENT')}"
            option-value="id"
            option-label="agreement_number"
            trigger-value-change-event
            error-message="${translate('GENERAL.REQUIRED_FIELD')}"
            @etools-selected-item-changed="${({detail}: CustomEvent) => this.selectedItemChanged(detail, 'agreement')}"
            required
            auto-validate
          >
          </etools-dropdown>
          <etools-dropdown-multi
            id="locationsDropdw"
            label=${translate('LOCATIONS')}
            placeholder="&#8212;"
            .options="${this.allLocations || []}"
            .loadDataMethod="${this.loadLocationsDropdownOptions}"
            option-label="name"
            option-value="id"
            required
            preserve-search-on-close
            error-message="${translate('GENERAL.REQUIRED_FIELD')}"
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
            error-message="${translate('GENERAL.REQUIRED_FIELD')}"
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
            error-message="${translate('GENERAL.REQUIRED_FIELD')}"
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
  allPartners: Partner[] = [];

  @property({type: Array})
  allAgreements!: MinimalAgreement[];

  @property({type: Array})
  filteredAgreements: MinimalAgreement[] = [];

  @property({type: Array})
  allLocations: LocationObject[] = [];

  @property({type: Array})
  allSections!: any[];

  @property({type: Array})
  allOffices!: any[];

  @property({type: String})
  selectedAgreementId!: string;

  @property({type: Object})
  data!: any;

  @property({type: Object})
  loadLocationsDropdownOptions!: (search: string, page: number, shownOptionsLimit: number) => void;

  _onClose(): void {
    fireEvent(this, 'dialog-closed', {confirmed: false});
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.loadLocationsDropdownOptions = this._loadLocationsDropdownOptions.bind(this);
    this.allPartners = [...csoPartnersSelector(store.getState())];
    this.allAgreements = (store.getState() as RootState).agreements!.list;
    this.allSections = (store.getState() as RootState).commonData!.sections;
    this.allOffices = (store.getState() as RootState).commonData!.offices;
  }

  async _loadLocationsDropdownOptions(search: string, page: number, shownOptionsLimit: number) {
    const params = {search: search, page: page, page_size: shownOptionsLimit, is_active: true};
    if (!this.allLocations || page == 1) {
      this.allLocations = [];
    }

    const endpoint = pmpEdpoints.locations;
    endpoint.url += `?${EtoolsRouter.encodeQueryParams(params)}`;
    sendRequest({
      method: 'GET',
      endpoint: endpoint
    })
      .then((resp: any) => {
        this.allLocations = this.allLocations.concat(resp.results);
      })
      .catch((_err: any) => {
        //parseRequestErrorsAndShowAsToastMsgs(err, this);
      });
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

  validateCFEI(e?: CustomEvent) {
    const elem = e ? (e.currentTarget as EtoolsInput) : this.shadowRoot?.querySelector<EtoolsInput>('#unppNumber')!;
    return elem.validate();
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
        fireEvent(this, 'dialog-closed', {confirmed: true});
        history.pushState(window.history.state, '', `${Environment.basePath}interventions/${intervention.id}/metadata`);
        window.dispatchEvent(new CustomEvent('popstate'));
        this.waitForRouteDetailsUpdate().then(() => store.dispatch(setShouldReGetList(true)));
      })
      .catch((err: any) => {
        this.loadingInProcess = false;
        parseRequestErrorsAndShowAsToastMsgs(err, this);
      });
  }

  // Avoid redirect to list
  waitForRouteDetailsUpdate() {
    return new Promise((resolve) => {
      const interv = setInterval(() => {
        if ((store.getState() as RootState).app?.routeDetails?.subRouteName === 'metadata') {
          clearInterval(interv);
          resolve(true);
        }
      }, 1000);
    });
  }

  partnerChanged({detail}: CustomEvent): void {
    this.selectedItemChanged(detail, 'partner');
    this.filterAgreements(detail.selectedItem ? detail.selectedItem.id : null);
  }

  filterAgreements(partnerId: number | null): void {
    if (!partnerId) {
      this.filteredAgreements = [];
      return;
    }

    this.filteredAgreements = this.allAgreements.filter((agreement: MinimalAgreement) => {
      return (
        agreement.partner === partnerId &&
        ['suspended', 'terminated'].indexOf(agreement.status!) === -1 &&
        agreement.agreement_type !== CONSTANTS.AGREEMENT_TYPES.MOU
      );
    });
  }
}
