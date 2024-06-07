import '@unicef-polymer/etools-unicef/src/etools-app-layout/app-toolbar';
import {connect} from '@unicef-polymer/etools-utils/dist/pwa.utils';
import {store, RootState} from '../../../redux/store';
import '@unicef-polymer/etools-unicef/src/etools-profile-dropdown/etools-profile-dropdown';
import '@unicef-polymer/etools-unicef/src/etools-dropdown/etools-dropdown';
import '@unicef-polymer/etools-unicef/src/etools-app-selector/etools-app-selector';
import '@unicef-polymer/etools-modules-common/dist/components/dropdowns/countries-dropdown';
import '@unicef-polymer/etools-modules-common/dist/components/dropdowns/organizations-dropdown';
import '@unicef-polymer/etools-modules-common/dist/components/dropdowns/languages-dropdown';
import '@unicef-polymer/etools-modules-common/dist/components/buttons/support-button';
import ProfileOperationsMixin from '../../common/user/profile-operations-mixin';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {GenericObject, LabelAndValue, MinimalUser, User} from '@unicef-polymer/etools-types';
import {property} from 'lit/decorators.js';
import {translate} from 'lit-translate';
import {activeLanguage} from '../../../redux/reducers/active-language.js';
import {html, LitElement} from 'lit';
import MatomoMixin from '@unicef-polymer/etools-piwik-analytics/matomo-mixin';
import '@unicef-polymer/etools-unicef/src/etools-icon-button/etools-icon-button';
import pmpEdpoints from '../../endpoints/endpoints';
import {updateUserData} from '../../../redux/actions/user';
import {setActiveLanguage} from '../../../redux/actions/active-language';
import {DexieRefresh} from '@unicef-polymer/etools-utils/dist/singleton/dexie-refresh';
import {Environment} from '@unicef-polymer/etools-utils/dist/singleton/environment';
import {appLanguages} from '../../../config/app-constants';
import UploadsMixin from '../../common/mixins/uploads-mixin';

store.addReducers({
  activeLanguage
});

/**
 * @LitElement
 * @customElement
 * @mixinFunction
 * @appliesMixin ProfileOperationsMixin
 */

class PageHeader extends connect(store)(
  // eslint-disable-next-line new-cap
  UploadsMixin(MatomoMixin(ProfileOperationsMixin(LitElement)))
) {
  @property({type: Array})
  offices: any[] = [];

  @property({type: Array})
  sections: any[] = [];

  @property({type: Array})
  users: MinimalUser[] = [];

  @property({type: Array})
  allSections: LabelAndValue[] = [];

  @property({type: Array})
  allOffices: LabelAndValue[] = [];

  @property({type: Array})
  allUsers: LabelAndValue[] = [];

  @property({type: Object})
  profile: User | null = null;

  @property({type: Array})
  editableFields: string[] = ['office', 'section', 'job_title', 'phone_number', 'oic', 'supervisor'];

  @property({type: Object})
  userProfileDialog!: GenericObject;

  @property({type: String})
  activeLanguage?: string;

  render() {
    // main template
    // language=HTML
    return html`
      <app-toolbar
        @menu-button-clicked="${this.menuBtnClicked}"
        .profile=${this.profile}
        responsive-width="850.9px"
        sticky
        class="content-align header"
      >
        <div slot="dropdowns">
          <languages-dropdown
            .profile="${this.profile}"
            .availableLanguages="${appLanguages}"
            .activeLanguage="${this.activeLanguage}"
            .changeLanguageEndpoint="${pmpEdpoints.myProfile}"
            @user-language-changed="${this.languageChanged}"
          ></languages-dropdown>
          <countries-dropdown
            id="countries"
            .profile="${this.profile}"
            .changeCountryEndpoint="${pmpEdpoints.changeCountry}"
            .selectionValidator="${this.countrySelectionValidator.bind(this)}"
            @country-changed="${this.countryOrOrganizationChanged}"
          >
          </countries-dropdown>
          <organizations-dropdown
            .profile="${this.profile}"
            .changeOrganizationEndpoint="${pmpEdpoints.changeOrganization}"
            @organization-changed="${this.countryOrOrganizationChanged}"
          ></organizations-dropdown>
        </div>
        <div slot="icons">
          <support-btn></support-btn>
          <etools-profile-dropdown
            title="${translate('PROFILE_AND_SIGNOUT')}"
            .sections="${this.allSections}"
            .offices="${this.allOffices}"
            .users="${this.allUsers}"
            .profile="${this.profile}"
            @save-profile="${this._saveProfile}"
            @sign-out="${this._signOut}"
          ></etools-profile-dropdown>

          <etools-icon-button
            title="${translate('GENERAL.REFRESH')}"
            id="refresh"
            label="refresh"
            name="refresh"
            tracker="hard refresh"
            @click="${this._onRefreshClick}"
          >
          </etools-icon-button>
        </div>
      </app-toolbar>
    `;
  }

  public connectedCallback() {
    super.connectedCallback();
  }

  public languageChanged(e: any) {
    store.dispatch(updateUserData(e.detail.user));
    store.dispatch(setActiveLanguage(e.detail.language));
  }

  public countryOrOrganizationChanged() {
    DexieRefresh.refresh();
    DexieRefresh.clearLocalStorage();

    history.pushState(window.history.state, '', `${Environment.basePath}partners`);
  }

  public async countrySelectionValidator() {
    if (this.existsUploadsUnsavedOrInProgress()) {
      return await this.confirmLeaveUploadInProgress();
    }

    return true;
  }

  public stateChanged(state: RootState) {
    if (!state.commonData) {
      return;
    }
    if (!isJsonStrMatch(state.commonData.offices, this.offices)) {
      this.offices = [...state.commonData.offices];
      this.allOffices = this._convertCollection(this.offices);
    }
    if (!isJsonStrMatch(state.commonData.sections, this.sections)) {
      this.sections = [...state.commonData.sections];
      this.allSections = this._convertCollection(this.sections);
    }
    if (!isJsonStrMatch(state.commonData.unicefUsersData, this.users)) {
      this.users = [...state.commonData.unicefUsersData];
      this.allUsers = this._convertUsers(this.users);
    }

    if (state.user!.data !== null && !isJsonStrMatch(state.user!.data, this.profile)) {
      this.profile = state.user!.data;
      this._profileChanged(this.profile);
    }

    if (this.activeLanguage !== state.activeLanguage?.activeLanguage) {
      this.activeLanguage = state.activeLanguage?.activeLanguage;
    }
  }

  public menuBtnClicked() {
    fireEvent(this, 'change-drawer-state');
  }

  private _onRefreshClick(e: CustomEvent) {
    this.trackAnalytics(e);
    this._openDataRefreshDialog();
  }

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
    window.location.href = window.location.origin + '/social/unicef-logout/';
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
        (appSelector as any).user = profile;
      }
    }
  }
}

window.customElements.define('page-header', PageHeader);
