import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import '@polymer/polymer/lib/elements/dom-if.js';
import 'etools-dropdown/etools-dropdown.js';

// @ts-ignore
import {EtoolsMixinFactory} from 'etools-behaviors/etools-mixin-factory.js';
// @ts-ignore
import {EtoolsLogsMixin} from 'etools-behaviors/etools-logs-mixin.js';
// @ts-ignore
import {EtoolsPageRefreshMixin} from 'etools-behaviors/etools-page-refresh-mixin.js';
// @ts-ignore
import {EtoolsAjaxRequestMixin} from  'etools-ajax/etools-ajax-request-mixin.js';

import { connect } from 'pwa-helpers/connect-mixin.js';
import {store, RootState} from "../../../store.js";

// <link rel="import" href="../../../../bower_components/etools-behaviors/etools-mixin-factory.html">
// <link rel="import" href="../../../../bower_components/etools-behaviors/etools-page-refresh-mixin.html">
// <link rel="import" href="../../../../bower_components/etools-ajax/etools-ajax-request-mixin.html">
// <link rel="import" href="../../endpoints/endpoints-mixin.html">
// <link rel="import" href="../../mixins/event-helper-mixin.html">

/**
 * countries dropdown element
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin EtoolsAjaxRequestMixin
 * @appliesMixin EtoolsPageRefreshMixin
 * @appliesMixin EtoolsPmpApp.Mixins.Endpoints
 * @appliesMixin EtoolsPmpApp.Mixins.EventHelper
 */
const CountriesDropdownMixin = EtoolsMixinFactory.combineMixins([
    EtoolsLogsMixin, EtoolsAjaxRequestMixin, EtoolsPageRefreshMixin], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin CountriesDropdownMixin
 */
class CountriesDropdown extends connect(store)(CountriesDropdownMixin) {

  public static get template() {
    // main template
    // language=HTML
    return html`
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

            etools-dropdown {
                width: 160px;

                --paper-listbox: {
                    max-height: 600px;
                };

                --esmm-icons: {
                    color: var(--countries-dropdown-color);
                    cursor: pointer;
                };

                --paper-input-container-underline: {
                    display: none;
                };

                --paper-input-container-underline-focus: {
                    display: none;
                };

                --paper-input-container-underline-disabled: {
                    display: none;
                };

                --paper-input-container-input: {
                    color: var(--countries-dropdown-color);
                    cursor: pointer;
                    min-height: 24px;
                    text-align: right;
                    line-height: 21px;  /* for IE */
                };

                --paper-menu-button-dropdown: {
                    max-height: 380px;
                };
            }
        </style>
        <!-- shown options limit set to 250 as there are currently 195 countries in the UN council and about 230 total -->
        <etools-dropdown id="countrySelector"
                         hidden$="[[!countrySelectorVisible]]"
                         selected="[[currentCountry.id]]"
                         placeholder="Country"
                         allow-outside-scroll
                         no-label-float
                         options="[[countries]]"
                         option-label="name"
                         option-value="id"
                         trigger-value-change-event
                         on-etools-selected-item-changed="_countrySelected"
                         shown-options-limit="250"
                         hide-search></etools-dropdown>
    
    `;
  }

  public static get properties() {
    return {
      currentCountry: Object,
      countries: Array,
        // observer: '_countrySelectorUpdate'
      countrySelectorVisible: Boolean
    };
  }

  public currentCountry: object = {};
  public countries: object[] = [];
  public countrySelectorVisible: Boolean = false;

  public connectedCallback() {
    super.connectedCallback();
    setTimeout( () => {
      // @ts-ignore
      let fitInto = document.querySelector('app-shell').shadowRoot.querySelector('#appHeadLayout');
      this.$.countrySelector.set('fitInto', fitInto);
    }, 0);
  }

  public stateChanged(state: RootState) {
    // TODO
    if (!state) {
      return;
    }



  }

  protected _countrySelected(e: any) {
    if (!e.detail.selectedItem) {
      return;
    }
    let selectedCountryId = parseInt(e.detail.selectedItem.id, 10);
    // @ts-ignore
    if (selectedCountryId !== this.currentCountry.id) {
      // send post request to change_coutry endpoint
      this._triggerCountryChangeRequest(selectedCountryId);
    }
  }

  protected _triggerCountryChangeRequest(countryId: any) {
    let self = this;
    this.fireEvent('global-loading', {
      message: 'Please wait while country data is changing...',
      active: true,
      loadingSource: 'country-change'
    });

    this.sendRequest({
      endpoint: this.getEndpoint('changeCountry'),
      method: 'POST',
      body: {country: countryId}
    }).then(function() {
      self._handleResponse();
    }).catch(function(error: any) {
      self._handleError(error);
    });
  }

  protected _handleResponse() {
    this.fireEvent('update-main-path', {path: 'partners'});
    this.refresh();
  }

  protected _countrySelectorUpdate(countries: any) {
    if (Array.isArray(countries) && (countries.length > 1)) {
      this.countrySelectorVisible = true;
    }
  }

  protected _handleError(error: any) {
    this.logError('Country change failed!', 'countries-dropdown', error);
    // TODO: this should be a larger alert.
    // @ts-ignore
    this.$.countrySelector.set('selected', this.currentCountry.id);
    this.fireEvent('toast', {text: 'Something went wrong changing your workspace. Please try again'});
    this.fireEvent('global-loading', {active: false, loadingSource: 'country-change'});
  }


}

window.customElements.define('countries-dropdown', CountriesDropdown);


