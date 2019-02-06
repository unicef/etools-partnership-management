import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import {store, RootState} from "../../../store";
import {isProductionServer, isStagingServer} from '../../../config/config.js';
import {updateDrawerState} from "../../../actions/app";
// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
import 'etools-profile-dropdown/etools-profile-dropdown.js';
import 'etools-app-selector/etools-app-selector.js'
// import '../layout/countries-dropdown.js';
import EventHelperMixin from "../../mixins/event-helper-mixin";
import ProfileOperations from "../../user/profile-operations-mixin";
import {isJsonStrMatch} from "../../utils/utils";

/**
 * page header mixin
 * @polymer
 * @mixinFunction
 * @appliesMixin GestureEventListeners
 * @appliesMixin EventHelper
 * @appliesMixin ProfileOperations
 */
const PageHeaderMixins = EtoolsMixinFactory.combineMixins([
    GestureEventListeners, ProfileOperations, EventHelperMixin], PolymerElement);

/**
 * @polymer
 * @customElement
 * @appliesMixin PageHeaderMixins
 */
class PageHeader extends connect(store)(PageHeaderMixins) {

  public static get template() {
    // main template
    // language=HTML
    return html`
      <style>
        app-toolbar {
          padding: 0 16px 0 0;
          height: 60px;
          background-color: var(--header-bg-color);
        }

        .titlebar {
          color: var(--header-color);
        }

        #menuButton {
          display: block;
          color: var(--header-color);
        }

        .titlebar {
          @apply --layout-flex;
          font-size: 28px;
          font-weight: 300;
        }

        .titlebar img {
          width: 34px;
          margin: 0 8px 0 24px;
        }

        .content-align {
          @apply --layout-horizontal;
          @apply --layout-center;
        }

        #app-logo {
          height: 32px;
          width: auto;
        }

        .envWarning {
          color: var(--nonprod-text-warn-color);
          font-weight: 700;
          font-size: 18px;
        }

        @media (min-width: 850px) {
          #menuButton {
            display: none;
          }
        }
      </style>

      <app-toolbar sticky class="content-align">
        <paper-icon-button id="menuButton" icon="menu" on-tap="menuBtnClicked"></paper-icon-button>
        <div class="titlebar content-align">
          <etools-app-selector></etools-app-selector>
          <img id="app-logo" src$="[[rootPath]]images/etools-logo-color-white.svg">
          <dom-if if="[[_isStaging]]">
            <template>
              <div class="envWarning"> - STAGING TESTING ENVIRONMENT</div>
            </template>
          </dom-if>
        </div>
        <div class="content-align">
          <!--<countries-dropdown id="countries" countries="[[countries]]"-->
                              <!--current-country="[[profile.country]]"></countries-dropdown>-->

          <etools-profile-dropdown
              sections="[[allSections]]"
              offices="[[allOffices]]"
              users="[[allUsers]]"
              profile="{{profile}}"
              on-save-profile="_saveProfile"
              on-sign-out="_signOut"></etools-profile-dropdown>

          <!--<paper-icon-button id="refresh" icon="refresh" on-tap="_openDataRefreshDialog"></paper-icon-button>-->
        </div>
      </app-toolbar>
    `;
  }

  public static get properties() {
    return {
      // This shouldn't be neccessary, but the polymer lint isn't picking up
      rootPath: String,
      _isStaging: Boolean,

      countries: Array,
      offices: Array,
      sections: Array,
      users: Array,

      allSections: {
        type: Object,
        notify: true,
        computed: '_convertCollection(sections)'
      },
      allOffices: {
        type: Object,
        notify: true,
        computed: '_convertCollection(offices)'
      },
      allUsers: {
        type: Object,
        notify: true,
        computed: '_convertUsers(users)'
      },

      profile: Object,

      editableFields: {
        type: Array,
        value: [
          'office',
          'section',
          'job_title',
          'phone_number',
          'oic',
          'supervisor'
        ]
      },

      userProfileDialog: Object
    };
  }

  // @ts-ignore
  private _isStaging: boolean = false;

  public sections: object[] = [];
  public allSections: object = {};

  public offices: object[] = [];
  public allOffices: object = {};

  public users: object[] = [];
  public allUsers: object = {};

  public profile: object | null = null;

  public static get observers() {
    return ['_updateCountriesList(profile.countries_available)'];
  }

  public connectedCallback() {
    super.connectedCallback();
    this._setBgColor();
    this._isStaging = isStagingServer();
  }

  public stateChanged(state: RootState) {
    if (!state.commonData) {
      return;
    }
    if (!isJsonStrMatch(state.commonData.offices, this.offices)) {
      this.offices = [...state.commonData.offices];
    }
    if (!isJsonStrMatch(state.commonData.sections, this.sections)) {
      this.sections = [...state.commonData.sections];
    }
    if (!isJsonStrMatch(state.commonData.unicefUsersData, this.users)) {
      this.users = [...state.commonData.unicefUsersData];
    }
    if (state.commonData.currentUser !== null &&
        !isJsonStrMatch(state.commonData.currentUser, this.profile)) {
      this.profile = JSON.parse(JSON.stringify(state.commonData.currentUser));
      if (this.profile && (this.profile as any).countries_available) {
        this.countries = this._updateCountriesList((this.profile as any).countries_available);
      }
    }
  }

  public menuBtnClicked() {
    store.dispatch(updateDrawerState(true));
  }

  public _setBgColor() {
    // If not production environment, changing header color to red
    if (!isProductionServer()) {
      // @ts-ignore
      this.updateStyles({'--header-bg-color': 'var(--nonprod-header-color)'});
    }
  }

  private _updateCountriesList(countries: any[]) {
    if (!countries) {
      return;
    }

    const countriesList: any[] = countries.map((arrayItem) => {
      return {
        id: arrayItem.id,
        name: arrayItem.name
      };
    });

    countriesList.sort((a: string, b: string) => {
      if((a as any).name < (b as any).name) { return -1; }
      if((a as any).name > (b as any).name) { return 1; }
      return 0;
    });

    return countriesList;
  }

  // @ts-ignore
  private _openDataRefreshDialog() {
    this.fireEvent('open-data-refresh-dialog');
  }

  public _saveProfile(e: any) {
    let modifiedFields = this._getModifiedFields(this.profile, e.detail.profile);
    // @ts-ignore
    this.saveProfile(modifiedFields);
  }

  public _convertUsers(data: any) {
    return data.map((d: any) => {
      return {
        value: parseInt(d.id, 10),
        label: d.name
      };
    });
  }

  protected _convertCollection(data: any) {
    return data.map((item: any) => {
      return {label: item.name, value: item.id};
    });
  }

  protected _getModifiedFields(originalData: any, newData: any) {
    let modifiedFields = {};
    this.editableFields.forEach(function(field: any) {
      if (originalData[field] !== newData[field]) {
        // @ts-ignore
        modifiedFields[field] = newData[field];
      }
    });

    return modifiedFields;
  }

  protected _signOut() {
    this._clearDexieDbs();
    this._clearLocalStorage();
    window.location.href = window.location.origin + '/logout';
  }

  protected _clearDexieDbs() {
    window.EtoolsPmpApp.DexieDb.delete();
  }

  protected _clearLocalStorage() {
    localStorage.clear();
  }
}

window.customElements.define('page-header', PageHeader);
