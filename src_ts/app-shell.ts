/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import {setPassiveTouchGestures, setRootPath} from '@polymer/polymer/lib/utils/settings.js';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {installMediaQueryWatcher} from 'pwa-helpers/media-query.js';

// This element is connected to the Redux store.
import {setStore} from '@unicef-polymer/etools-utils/dist/store.util';
import {store, RootState} from './redux/store';

// These are the actions needed by this element.
import {
  handleUrlChange
  // navigate,
} from './redux/actions/app.js';

// Lazy loading CommonData reducer.
import commonData from './redux/reducers/common-data.js';
import uploadStatus from './redux/reducers/upload-status.js';
import agreements from './redux/reducers/agreements.js';
import partners from './redux/reducers/partners.js';
import user from './redux/reducers/user';

setStore(store as any);
store.addReducers({
  // @ts-ignore
  commonData,
  uploadStatus,
  partners,
  agreements,
  user
});

// These are the elements needed by this element.
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';

import {AppShellStyles} from './components/app-shell/app-shell-styles';

import LoadingMixin from '@unicef-polymer/etools-loading/etools-loading-mixin.js';
import '@unicef-polymer/etools-piwik-analytics/etools-piwik-analytics.js';
import {AppMenuMixin} from './components/app-shell/menu/mixins/app-menu-mixin.js';
import CommonDataMixin from './components/common/common-data.js';
import '@unicef-polymer/etools-toasts';
import UserDataMixin from './components/common/user/user-data-mixin';

import './components/app-shell/menu/app-menu.js';
import './components/app-shell/header/page-header.js';
import './components/app-shell/header/data-refresh-dialog';
import {DataRefreshDialog} from './components/app-shell/header/data-refresh-dialog';
import './components/app-shell/footer/page-footer.js';

import './components/common/environment-flags/environment-flags';
import './components/pages/partners/data/partners-list-data.js';
import './components/pages/agreements/data/agreements-list-data.js';

import './components/app-shell/app-theme.js';
import './components/styles/app-mixins.js';
import UtilsMixin from './components/common/mixins/utils-mixin.js';
import '@unicef-polymer/etools-modules-common/dist/layout/are-you-sure';

// import global config and dexie db config
import './config/config.js';
import './components/utils/routes';
// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

import {BASE_URL} from './config/config';
import UploadsMixin from './components/common/mixins/uploads-mixin.js';
import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {isJsonStrMatch} from '@unicef-polymer/etools-utils/dist/equality-comparisons.util';
import {AppDrawerElement} from '@polymer/app-layout/app-drawer/app-drawer.js';
import {GenericObject, UserPermissions, User, RouteDetails} from '@unicef-polymer/etools-types';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {EtoolsRouter} from '@unicef-polymer/etools-utils/dist/singleton/router';
import {registerTranslateConfig, use, translate, get as getTranslation} from 'lit-translate';
import {ROOT_PATH} from '@unicef-polymer/etools-modules-common/dist/config/config';
import {installRouter} from 'pwa-helpers/router';
import {openDialog} from '@unicef-polymer/etools-utils/dist/dialog.util';
import {html, LitElement, property, PropertyValues} from 'lit-element';
import ScrollControlMixinLit from './components/common/mixins/scroll-control-mixin-lit';
import {getTranslatedValue} from '@unicef-polymer/etools-utils/dist/language.util';


declare const dayjs: any;
declare const dayjs_plugin_utc: any;
declare const dayjs_plugin_isSameOrBefore: any;
declare const dayjs_plugin_isSameOrAfter: any;
declare const dayjs_plugin_isBetween: any;

dayjs.extend(dayjs_plugin_utc);
dayjs.extend(dayjs_plugin_isSameOrAfter);
dayjs.extend(dayjs_plugin_isSameOrBefore);
dayjs.extend(dayjs_plugin_isBetween);

function fetchLangFiles(lang: string) {
  return Promise.allSettled([
    fetch(`assets/i18n/${lang}.json`).then((res: any) => res.json()),
    fetch(`src/components/pages/interventions/pages/intervention-tab-pages/assets/i18n/${lang}.json`).then((res: any) =>
      res.json()
    )
  ]).then((response: any) => {
    return Object.assign(response[0].value, response[1].value);
  });
}
const translationConfig = registerTranslateConfig({
  empty: (key) => `${key && key[0].toUpperCase() + key.slice(1).toLowerCase()}`,
  loader: (lang: string) => fetchLangFiles(lang)
});

setRootPath(BASE_URL);

/**
 * @customElement
 * @polymer
 * @appliesMixin AppMenuMixin
 * @appliesMixin CommonDataMixin
 * @appliesMixin ToastNotifications
 * @appliesMixin ScrollControlMixin
 * @appliesMixin AmendmentModeUIMixin
 * @appliesMixin UserDataMixin
 * @appliesMixin LoadingMixin
 * @appliesMixin UtilsMixin
 */
class AppShell extends connect(store)(
  UploadsMixin(
    // eslint-disable-next-line new-cap
    AppMenuMixin(ScrollControlMixinLit(UtilsMixin(LoadingMixin(CommonDataMixin(UserDataMixin(LitElement))))))
  )
) {
  render() {
    // main template
    // language=HTML
    return html`
      ${AppShellStyles}

      <environment-flags></environment-flags>

      <etools-piwik-analytics
        .page="${this._getRootPathAndModule(this.module)}"
        .user="${this.user}"
        .toast="${this.currentToastMessage}"
      >
      </etools-piwik-analytics>
      <etools-toasts></etools-toasts>

      <app-drawer-layout
        id="layout"
        responsive-width="850px"
        fullbleed
        ?narrow="${this.narrow}"
        ?small-menu="${this.smallMenu}"
      >
        <!-- Drawer content -->
        <app-drawer
          id="drawer"
          slot="drawer"
          transition-duration="350"
          ?opened="${this._drawerOpened}"
          ?swipe-open="${this.narrow}"
          ?small-menu="${this.smallMenu}"
        >
          <!-- App main menu(left sidebar) -->
          <app-menu
            .rootPath="${this.rootPath}"
            .selectedOption="${this.module}"
            ?small-menu="${this.smallMenu}"
          ></app-menu>
        </app-drawer>

        <!-- Main content -->
        <app-header-layout id="appHeadLayout" fullbleed has-scrolling-region>
          <app-header slot="header" fixed shadow>
            <page-header id="pageheader"></page-header>
          </app-header>

          <!-- Main content -->
          <main role="main" id="page-container">
            <partners-module
              id="partners"
              class="main-page"
              .permissions="${this.permissions}"
              ?hidden="${!this._activeModuleIs(this.module, 'partners|government-partners')}"
            >
            </partners-module>

            <agreements-module
              id="agreements"
              class="main-page"
              .permissions="${this.permissions}"
              ?hidden="${!this._activeModuleIs(this.module, 'agreements')}"
            >
            </agreements-module>

            <interventions-module
              id="interventions"
              class="main-page"
              .userPermissions="${this.permissions}"
              ?hidden="${!this._activeModuleIs(this.module, 'interventions')}"
            >
            </interventions-module>

            <reports-module
              id="reports"
              class="main-page"
              .permissions="${this.permissions}"
              ?hidden="${!this._activeModuleIs(this.module, 'reports')}"
            >
            </reports-module>

            <not-found class="main-page" ?hidden="${!this._activeModuleIs(this.module, 'not-found')}"></not-found>

            <settings-module
              id="settings"
              class="main-page"
              ?hidden="${!this._activeModuleIs(this.module, 'settings')}"
            ></settings-module>
          </main>

          <page-footer></page-footer>
        </app-header-layout>
      </app-drawer-layout>

      <data-refresh-dialog id="dataRefreshDialog" .page="${this.module}"></data-refresh-dialog>

      <partners-list-data></partners-list-data>
      <agreements-list-data></agreements-list-data>
    `;
  }

  @property({type: Boolean})
  _drawerOpened = false;

  @property({type: String})
  _page?: string | null;

  /**
   * `module` property represents the current displayed module of the PMP app.
   * It can only have there values: partners, agreements, interventions, reports, settings and not-found.
   * Main modules will have other pages and routing (prefixed by app-shell route).
   */
  private _module!: string;
  @property({type: String})
  get module() {
    return this._module;
  }

  set module(val: string) {
    if (val !== this._module) {
      this._module = val;
      this._scrollToTopOnModuleChange(this._module);
    }
  }

  @property({type: Object})
  route!: GenericObject;

  @property({type: Object})
  routeData!: {module: string};

  @property({type: Object})
  subroute!: GenericObject;

  // This shouldn't be neccessary, but the Analyzer isn't picking up
  // Polymer.Element#rootPath
  @property({type: String})
  rootPath!: string;

  @property({type: Boolean})
  narrow!: boolean;

  @property({type: Object})
  user!: User;

  @property({type: Object})
  permissions!: UserPermissions;

  @property({type: String})
  _lastActivePartnersModule!: string;

  @property({type: Array})
  _prpModules: string[] = ['reports', 'settings'];

  @property({type: String})
  _appModuleMainElUrlTmpl = './components/pages/##module##/##main-el-name##-module.js';

  @property({type: Object})
  leavePageDialog!: EtoolsDialog;

  @property({type: Object})
  appLocQueryParams!: GenericObject;

  @property({type: String})
  appLocPath!: string;

  @property({type: String})
  selectedLanguage!: string;

  @property({type: Boolean})
  currentLanguageIsSet!: boolean;

  @property({type: Object})
  reduxRouteDetails?: RouteDetails;

  @property({type: Boolean})
  private translationFilesAreLoaded = false;

  public connectedCallback() {
    super.connectedCallback();

    this._initListeners();
    if (this.shadowRoot?.querySelector('#appHeadLayout')) {
      window.EtoolsEsmmFitIntoEl = this.shadowRoot
        ?.querySelector('#appHeadLayout')!
        .shadowRoot!.querySelector('#contentContainer');
      this.etoolsLoadingContainer = window.EtoolsEsmmFitIntoEl;
    }

    // Override ajax error parser inside @unicef-polymer/etools-ajax
    // for string translation using lit-translate
    window.ajaxErrorParserTranslateFunction = (key: string) => {
      return getTranslatedValue(key);
    };

    if (this.module !== 'not-found') {
      /*
       * Activate the global loading with default message.
       * This will be triggered once at page load or, after page load, on menu option tap event.
       * The loading message is de-activated by *-module.ts elements connectedCallback (in both cases)
       */
      fireEvent(this, 'global-loading', {
        active: true,
        loadingSource: 'main-page'
      });
    }
    installRouter((location) =>
      this.preliminaryUrlChangeHandling(decodeURIComponent(location.pathname + location.search))
    );
    this.requestUserData();
    // trigger common data load requests
    // @ts-ignore
    this.loadCommonData();

    installMediaQueryWatcher(`(min-width: 460px)`, () => fireEvent(this, 'change-drawer-state'));
    // @ts-ignore
    this.addEventListener('toast', ({detail}: CustomEvent) => (this.currentToastMessage = detail.text));
  }

  firstUpdated(changedProperties: PropertyValues) {
    super.firstUpdated(changedProperties);
    this.waitForTranslationsAndLanguageToLoad().then(() => {
      this.checkAppVersion();
    });
  }

  public stateChanged(state: RootState) {
    this.uploadsStateChanged(state);

    // @ts-ignore EndpointsMixin
    this.envStateChanged(state);
    if (
      state.activeLanguage!.activeLanguage &&
      !isJsonStrMatch(state.activeLanguage!.activeLanguage, this.selectedLanguage)
    ) {
      if (this.selectedLanguage) {
        // on language change, reload parts of commonData in order to use BE localized text
        this.loadCommonDataOnLanguageChange();
      }
      this.selectedLanguage = state.activeLanguage!.activeLanguage;
      this.loadLocalization();
    }

    this.waitForTranslationsAndLanguageToLoad().then(() => {
      this.translationFilesAreLoaded = true;
      this.waitForEnvFlagsToLoad().then(() => {
        if (state.app?.routeDetails && this.canAccessPage(state.app?.routeDetails.routeName!)) {
          this.module = state.app?.routeDetails.routeName!;
          this.reduxRouteDetails = state.app?.routeDetails;
        } else {
          this._pageNotFound();
        }
      });
    });
  }

  protected shouldUpdate(changedProperties: Map<PropertyKey, unknown>): boolean {
    return this.translationFilesAreLoaded && super.shouldUpdate(changedProperties);
  }

  async preliminaryUrlChangeHandling(path: string) {
    if (this.existsUploadsUnsavedOrInProgress()) {
      // when user tries to navigate away => show the confirmation dialog
      const currentRouteDetails = EtoolsRouter.getRouteDetails(path);
      if (
        this.reduxRouteDetails?.routeName != currentRouteDetails?.routeName ||
        this.reduxRouteDetails?.subRouteName != currentRouteDetails?.subRouteName ||
        this.reduxRouteDetails?.subSubRouteName != currentRouteDetails?.subSubRouteName
      ) {
        if (await this.stayingOnPage()) {
          return;
        }
      }
    }

    store.dispatch(handleUrlChange(path));
  }

  // @ts-ignore // TODO - verify if still needed
  private _showOnlyGovernmentPartners(module: string) {
    return module === 'government-partners';
  }

  _getRootPathAndModule(module: string) {
    return `${ROOT_PATH}${module}`;
  }

  checkAppVersion() {
    fetch('version.json')
      .then((res) => res.json())
      .then((version) => {
        if (version.revision != document.getElementById('buildRevNo')!.innerText) {
          console.log('version.json', version.revision);
          console.log('buildRevNo ', document.getElementById('buildRevNo')!.innerText);
          this._showConfirmNewVersionDialog();
        }
      });
  }

  private canAccessPage(module: string) {
    const isPrpModule = this._prpModules.indexOf(module) > -1;
    if (isPrpModule) {
      return this.shouldShowPrpReports();
    } else {
      return true;
    }
  }

  async loadLocalization() {
    this.waitForTranslationsToLoad().then(async () => {
      await use(this.selectedLanguage);
      this.currentLanguageIsSet = true;
    });
  }

  waitForTranslationsToLoad() {
    return new Promise((resolve) => {
      const translationsCheck = setInterval(() => {
        if (translationConfig) {
          clearInterval(translationsCheck);
          resolve(true);
        }
      }, 50);
    });
  }

  waitForTranslationsAndLanguageToLoad() {
    return new Promise((resolve) => {
      const translationAndLanguageCheck = setInterval(() => {
        if (translationConfig && this.currentLanguageIsSet) {
          clearInterval(translationAndLanguageCheck);
          resolve(true);
        }
      }, 50);
    });
  }

  // dev purpose - to be removed in the future
  public logStoreState() {
    console.log(store.getState());
  }

  public isInterventionReports(path: string) {
    const pattern = new RegExp('\\/pmp\\/interventions\\/\\d*\\/reports', 'i');
    return pattern.test(path);
  }

  private _initListeners() {
    this._pageNotFound = this._pageNotFound.bind(this);
    this._updateMainPath = this._updateMainPath.bind(this);
    this._onForbidden = this._onForbidden.bind(this);
    this._openDataRefreshDialog = this._openDataRefreshDialog.bind(this);

    this.addEventListener('404', this._pageNotFound);
    this.addEventListener('update-main-path', this._updateMainPath as any);
    this.addEventListener('forbidden', this._onForbidden);
    this.addEventListener('open-data-refresh-dialog', this._openDataRefreshDialog);
    // Event trigerred by the app-drawer component
    this.addEventListener('app-drawer-transitioned', this.syncWithDrawerState);
    this.addEventListener('change-drawer-state', this.changeDrawerState);
  }

  private _removeListeners() {
    this.removeEventListener('404', this._pageNotFound);
    this.removeEventListener('update-main-path', this._updateMainPath as any);
    this.removeEventListener('forbidden', this._onForbidden);
    this.removeEventListener('open-data-refresh-dialog', this._openDataRefreshDialog);
    this.removeEventListener('app-drawer-transitioned', this.syncWithDrawerState);
    this.removeEventListener('change-drawer-state', this.changeDrawerState);
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this._removeListeners();
  }

  public syncWithDrawerState() {
    this._drawerOpened = Boolean((this.shadowRoot?.querySelector('#drawer') as AppDrawerElement).opened);
  }

  public changeDrawerState() {
    this._drawerOpened = !this._drawerOpened;
  }

  private async _showConfirmNewVersionDialog() {
    const confirmed = await openDialog({
      dialog: 'are-you-sure',
      dialogData: {
        content: translate('A_NEW_VERSION_OF_THE_APP_IS_AV'),
        confirmBtnText: translate('YES')
      }
    }).then(({confirmed}) => {
      return confirmed;
    });

    if (confirmed) {
      if (navigator.serviceWorker) {
        caches.keys().then((cacheNames) => {
          cacheNames.forEach((cacheName) => {
            caches.delete(cacheName);
          });
          location.reload();
        });
      }
    }
  }

  // @ts-ignore
  private _scrollToTopOnModuleChange(module: string) {
    // TODO: polymer2 - check if this observer is correct. Do we really need it?
    // Tested- seems to work the same without it..
    if (!module) {
      return;
    }
    this.scrollToTop();
  }

  private _onForbidden() {
    window.location.href = window.location.origin + '/login/';
  }

  private _updateMainPath(e: CustomEvent) {
    // if (e.detail.path !== this.route.path.replace(this.rootPath, '')) {
    // set route.path only if received path is different
    this._updatePath(e.detail.path);
    // }
    e.stopImmediatePropagation();
  }

  private _updatePath(path: string) {
    history.pushState(window.history.state, '', `${ROOT_PATH}${path}`);
    window.dispatchEvent(new CustomEvent('popstate'));
  }

  private _pageNotFound() {
    this._updatePath('not-found');
    // the _moduleChanged method will trigger and clear loading messages so no need to do that here
    fireEvent(this, 'toast', {
      text: getTranslation('GENERAL.ERR_OCCURRED')
    });
  }

  private _openDataRefreshDialog() {
    (this.shadowRoot?.querySelector('#dataRefreshDialog')! as unknown as DataRefreshDialog).open();
  }

  // @ts-ignore
  private _activeModuleIs(activeModule: string, expectedModule: string) {
    const pagesToMatch = expectedModule.split('|');
    return pagesToMatch.indexOf(activeModule) > -1;
  }

  async stayingOnPage(): Promise<boolean> {
    const confirmed = await this.confirmLeaveUploadInProgress();
    if (confirmed) {
      return false;
    } else {
      history.go(-1);
      fireEvent(this, 'clear-loading-messages', {
        bubbles: true,
        composed: true
      });
      this.shadowRoot!.querySelector('app-menu')!.shadowRoot!.querySelector('iron-selector')!.select(this.module);
      return true;
    }
  }
}

window.customElements.define('app-shell', AppShell);
