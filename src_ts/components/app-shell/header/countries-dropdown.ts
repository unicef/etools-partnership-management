import {connect} from 'pwa-helpers/connect-mixin.js';
import {store, RootState} from '../../../redux/store.js';
import '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import EtoolsPageRefreshMixinLit from '@unicef-polymer/etools-behaviors/etools-page-refresh-mixin-lit.js';
import UploadsMixin from '../../../components/common/mixins/uploads-mixin';
import {sendRequest} from '@unicef-polymer/etools-ajax/etools-ajax-request';
import {fireEvent} from '../../utils/fire-custom-event.js';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import {EtoolsDropdownEl} from '@unicef-polymer/etools-dropdown/etools-dropdown.js';
import {GenericObject} from '@unicef-polymer/etools-types';
import {html, LitElement, property} from 'lit-element';
import EndpointsLitMixin from '@unicef-polymer/etools-modules-common/dist/mixins/endpoints-mixin-lit';
import pmpEdpoints from '../../endpoints/endpoints.js';
import {headerDropdownStyles} from './header-dropdown-styles';
import {ROOT_PATH} from '@unicef-polymer/etools-modules-common/dist/config/config.js';
import {get as getTranslation, translate} from 'lit-translate';

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin EndpointsMixin
 * @appliesMixin EtoolsPageRefreshMixin
 */
class CountriesDropdown extends connect(store)(UploadsMixin(EtoolsPageRefreshMixinLit(EndpointsLitMixin(LitElement)))) {
  render() {
    // main template
    // language=HTML
    return html`
      ${headerDropdownStyles}
      <style>
        *[hidden] {
          display: none !important;
        }

        :host {
          display: block;
        }

        :host(:hover) {
          cursor: pointer;
        }

        :host-context([dir='rtl']) etools-dropdown {
          --paper-input-container-shared-input-style: {
            color: var(--light-secondary-text-color);
            cursor: pointer;
            font-size: 16px;
            text-align: left;
            width: 100px;
          }
        }

        @media (max-width: 768px) {
          etools-dropdown {
            width: 130px;
          }
        }
      </style>
      <!-- shown options limit set to 250 as there are currently 195 countries in the UN council and about 230 total -->
      <etools-dropdown
        id="countrySelector"
        class="w100"
        ?hidden="${!this.countrySelectorVisible}"
        .selected="${this.currentCountry?.id}"
        placeholder="${translate('COUNTRY')}"
        allow-outside-scroll
        no-label-float
        .options="${this.countries}"
        option-label="name"
        option-value="id"
        trigger-value-change-event
        @etools-selected-item-changed="${this._countrySelected}"
        .shownOptionsLimit="${250}"
        hide-search
        auto-width
      ></etools-dropdown>
    `;
  }

  @property({type: Object})
  currentCountry: GenericObject = {};

  private _countries: [] = [];
  @property({type: Array})
  get countries() {
    return this._countries;
  }

  set countries(val: []) {
    this._countries = val;
    this._countrySelectorUpdate(this._countries);
  }

  @property({type: Boolean})
  countrySelectorVisible = false;

  public connectedCallback() {
    super.connectedCallback();

    setTimeout(() => {
      const fitInto = document.querySelector('app-shell')!.shadowRoot!.querySelector('#appHeadLayout');
      (this.shadowRoot?.querySelector('#countrySelector') as EtoolsDropdownEl).fitInto = fitInto;
    }, 0);
  }

  public stateChanged(state: RootState) {
    // TODO: polymer 3 do what?
    if (!state) {
      return;
    }
    this.uploadsStateChanged(state);
  }

  protected async _countrySelected(e: any) {
    if (!e.detail.selectedItem) {
      return;
    }

    const selectedCountryId = parseInt(e.detail.selectedItem.id, 10);

    if (selectedCountryId !== this.currentCountry.id) {
      if (this.existsUploadsUnsavedOrInProgress()) {
        const prevCountryId = this.currentCountry.id;
        this.currentCountry = {...this.currentCountry, id: selectedCountryId};
        const confirmed = await this.confirmLeaveUploadInProgress();
        if (!confirmed) {
          // reset country dropdown to the previous value
          this.currentCountry = {...this.currentCountry, id: prevCountryId};
          return;
        }
      }
      // send post request to change_country endpoint
      this._triggerCountryChangeRequest(selectedCountryId);
    }
  }

  protected _triggerCountryChangeRequest(countryId: any) {
    fireEvent(this, 'global-loading', {
      message: 'Please wait while country data is changing...',
      active: true,
      loadingSource: 'country-change'
    });

    sendRequest({
      endpoint: pmpEdpoints.changeCountry,
      method: 'POST',
      body: {country: countryId}
    })
      .then(() => {
        this._handleResponse();
      })
      .catch((error: any) => {
        this._handleError(error);
      });
  }

  protected _handleResponse() {
    history.pushState(window.history.state, '', `${ROOT_PATH}partners`);
    this.refresh();
  }

  protected _countrySelectorUpdate(countries: any[]) {
    if (Array.isArray(countries) && countries.length > 1) {
      this.countrySelectorVisible = true;
    }
  }

  protected _handleError(error: any) {
    logError('Country change failed!', 'countries-dropdown', error);
    (this.shadowRoot?.querySelector('#countrySelector') as EtoolsDropdownEl).selected = this.currentCountry.id;
    fireEvent(this, 'toast', {
      text: getTranslation('ERROR_CHANGE_WORKSPACE')
    });
    fireEvent(this, 'global-loading', {
      active: false,
      loadingSource: 'country-change'
    });
  }
}

window.customElements.define('countries-dropdown', CountriesDropdown);
