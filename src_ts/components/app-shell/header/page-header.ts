import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners.js';
import '@polymer/iron-flex-layout/iron-flex-layout.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';
import '@polymer/paper-icon-button/paper-icon-button.js';
import {connect} from 'pwa-helpers/connect-mixin';
import {store, RootState} from '../../../store';
import {_checkEnvironment} from '../../../config/config';
import {updateDrawerState} from '../../../actions/app';
import '@unicef-polymer/etools-profile-dropdown/etools-profile-dropdown';
import '@unicef-polymer/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-app-selector/etools-app-selector';
import '../header/countries-dropdown';
import ProfileOperationsMixin from '../../user/profile-operations-mixin';
import {isJsonStrMatch} from '../../utils/utils';
import {fireEvent} from '../../utils/fire-custom-event';
import {GenericObject, LabelAndValue, MinimalUser, User} from '@unicef-polymer/etools-types';
import '../../layout/support-btn';
import {property} from '@polymer/decorators';
import {use} from 'lit-translate';
import {setLanguage} from '../../../actions/active-language.js';
import {activeLanguage} from '../../../reducers/active-language.js';

store.addReducers({
  activeLanguage
});

/**
 * @polymer
 * @customElement
 * @mixinFunction
 * @appliesMixin GestureEventListeners
 * @appliesMixin ProfileOperationsMixin
 */

class PageHeader extends connect(store)(
  // eslint-disable-next-line new-cap
  GestureEventListeners(ProfileOperationsMixin(PolymerElement))
) {
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

        countries-dropdown {
          --countries-dropdown-color: var(--light-secondary-text-color);
        }

        etools-dropdown {

            --paper-listbox: {
              max-height: 600px;
            }

            --esmm-icons: {
              color: var(--light-secondary-text-color);
              cursor: pointer;
            }

            --paper-input-container-underline: {
              display: none;
            }

            --paper-input-container-underline-focus: {
              display: none;
            }

            --paper-input-container-underline-disabled: {
              display: none;
            }

            --paper-input-container-input: {
              color: var(--light-secondary-text-color);
              cursor: pointer;
              min-height: 24px;
              text-align: right;
              line-height: 21px; /* for IE */
            }
        }

        support-btn,
        etools-profile-dropdown,
        #refresh {
          color: var(--light-secondary-text-color);
        }

        #menuButton {
          display: block;
          color: var(--light-secondary-text-color);
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

        .dropdowns {
          display: flex;
          margin-right: 5px;
          max-width: 280px;
        }

        .header {
          flex-wrap: wrap;
          height: 100%;
          justify-content: space-between;
        }

        .nav-menu-button {
          min-width: 70px;
        }

        .header__item {
          display: flex;
          align-items: center;
        }

        .header__right-group {
          justify-content: space-evenly;
        }

        .envWarning {
          color: var(--nonprod-text-warn-color);
          font-weight: 700;
          font-size: 18px;
          line-height: 20px;
        }

        support-btn {
          margin-left: 24px;
        }

        etools-profile-dropdown {
          margin-left: 16px;
        }

        @media (min-width: 850px) {
          #menuButton {
            display: none;
          }
        }
        @media (max-width: 920px) {
          .envWarning {
            font-size: 14px;
            line-height: 16px;
          }
          .titlebar img {
            margin: 0 8px 0 12px;
          }
        }
        @media (max-width: 768px) {
          #app-logo {
            width: 90px;
          }
          .envLong {
            display: none;
          }
          etools-app-selector {
            width: 42px;
          }
          .titlebar img {
            margin: 0 8px 0 12px;
          }
          support-btn {
            margin-left: 4px;
          }
          etools-profile-dropdown{
            margin-left: 0px;
            width: 40px;
        }
      }
      @media (max-width: 576px) {
        etools-app-selector {
        --app-selector-button-padding: 18px 8px;
        }
        #app-logo {
          display: none;
        }
        .envWarning {
          font-size: 10px;
          margin-left: 2px;
        }
        #refresh{
          width: 24px;
          padding: 0px
        }
        app-toolbar {
          padding-right: 4px;
        }
      }
      </style>

      <app-toolbar sticky class="content-align header">
        <div class="header__item">
          <paper-icon-button id="menuButton" icon="menu" on-tap="menuBtnClicked"></paper-icon-button>
          <div class="titlebar content-align">
            <etools-app-selector id="app-selector"></etools-app-selector>
            <img id="app-logo" src$="[[rootPath]]images/etools-logo-color-white.svg">
            <template is="dom-if" if="[[environment]]">
              <div class="envWarning">
                <span class='envLong'> - </span>[[environment]]
                <span class='envLong'>TESTING ENVIRONMENT<span>
              </div>
            </template>
          </div>
        </div>

        <div class="header__item header__right-group">
          <div class="dropdowns">
              <etools-dropdown
                selected="[[selectedLanguage]]"
                options="[[languages]]"
                option-label="display_name"
                option-value="value"
                on-etools-selected-item-changed="languageChanged"
                trigger-value-change-event
                hide-search
                allow-outside-scroll
                no-label-float
                min-width="160px"
                auto-width
              ></etools-dropdown>

              <countries-dropdown id="countries" countries="[[countries]]" current-country="[[profile.country]]">
              </countries-dropdown>

          </div>
          <support-btn></support-btn>

          <etools-profile-dropdown
              sections="[[allSections]]"
              offices="[[allOffices]]"
              users="[[allUsers]]"
              profile="{{profile}}"
              on-save-profile="_saveProfile"
              on-sign-out="_signOut"></etools-profile-dropdown>

          <paper-icon-button id="refresh" icon="refresh" on-tap="_openDataRefreshDialog"></paper-icon-button>
        </div>
      </app-toolbar>
    `;
  }

  @property({type: String})
  rootPath!: string;

  @property({type: Array})
  countries!: any[];

  @property({type: Array})
  offices: any[] = [];

  @property({type: Array})
  sections: any[] = [];

  @property({type: Array})
  users: MinimalUser[] = [];

  @property({
    type: Array,
    notify: true,
    computed: '_convertCollection(sections)'
  })
  allSections: LabelAndValue[] = [];

  @property({
    type: Array,
    notify: true,
    computed: '_convertCollection(offices)'
  })
  allOffices: LabelAndValue[] = [];

  @property({type: Array, notify: true, computed: '_convertUsers(users)'})
  allUsers: LabelAndValue[] = [];

  @property({type: String})
  environment: string | null = _checkEnvironment();

  @property({type: Object})
  profile: User | null = null;

  @property({type: Array})
  editableFields: string[] = ['office', 'section', 'job_title', 'phone_number', 'oic', 'supervisor'];

  @property({type: Object})
  userProfileDialog!: GenericObject;

  languages: GenericObject[] = [{value: 'en', display_name: 'English'}];

  @property({type: String})
  selectedLanguage!: string;

  public static get observers() {
    return ['_updateCountriesList(profile.countries_available)', '_profileChanged(profile)'];
  }

  public connectedCallback() {
    super.connectedCallback();
    this._setBgColor();
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
    if (!isJsonStrMatch(state.activeLanguage!.activeLanguage, this.selectedLanguage)) {
      this.selectedLanguage = state.activeLanguage!.activeLanguage;
    }
    if (state.commonData.currentUser !== null && !isJsonStrMatch(state.commonData.currentUser, this.profile)) {
      this.profile = JSON.parse(JSON.stringify(state.commonData.currentUser));

      if (this.profile && this.profile.countries_available) {
        this.countries = this._updateCountriesList(this.profile.countries_available);
      }
    }
  }

  public menuBtnClicked() {
    store.dispatch(updateDrawerState(true));
  }

  public _setBgColor() {
    // If not production environment, changing header color to red
    if (this.environment) {
      this.updateStyles({'--header-bg-color': 'var(--nonprod-header-color)'});
    }
  }

  private _updateCountriesList(countries: any[]) {
    if (!countries) {
      return [];
    }

    const countriesList: any[] = countries.map((arrayItem) => {
      return {
        id: arrayItem.id,
        name: arrayItem.name
      };
    });

    countriesList.sort((a: string, b: string) => {
      if ((a as any).name < (b as any).name) {
        return -1;
      }
      if ((a as any).name > (b as any).name) {
        return 1;
      }
      return 0;
    });

    return countriesList;
  }

  languageChanged(e: CustomEvent): void {
    if (!e.detail.selectedItem) {
      return;
    }

    const language = e.detail.selectedItem.value;
    if (language !== this.selectedLanguage) {
      localStorage.setItem('defaultLanguage', language);
      use(language)
        .finally(() => store.dispatch(setLanguage(language)))
        .then(() => location.reload());
    }
  }

  // @ts-ignore
  private _openDataRefreshDialog() {
    fireEvent(this, 'open-data-refresh-dialog');
  }

  public _saveProfile(e: any) {
    const modifiedFields = this._getModifiedFields(this.profile, e.detail.profile);
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
    const modifiedFields: GenericObject = {};
    this.editableFields.forEach(function (field: any) {
      if (originalData[field] !== newData[field]) {
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

  protected _profileChanged(profile: User | null) {
    if (profile) {
      const appSelector = this.shadowRoot!.querySelector('#app-selector');
      if (appSelector) {
        (appSelector as PolymerElement).set('user', profile);
      }
    }
  }
}

window.customElements.define('page-header', PageHeader);
