/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import {PolymerElement, html} from '@polymer/polymer/polymer-element.js';
import {GestureEventListeners} from '@polymer/polymer/lib/mixins/gesture-event-listeners';
import {afterNextRender} from '@polymer/polymer/lib/utils/render-status';
import {setPassiveTouchGestures, setRootPath} from '@polymer/polymer/lib/utils/settings.js';
import {connect} from 'pwa-helpers/connect-mixin.js';
import {installMediaQueryWatcher} from 'pwa-helpers/media-query.js';

// This element is connected to the Redux store.
import {setStore} from '@unicef-polymer/etools-modules-common/dist/utils/redux-store-access';
import {store, RootState} from './redux/store';

// These are the actions needed by this element.
import {
  // navigate,
  updateDrawerState,
  updateStoreRouteDetails
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
import '@polymer/app-route/app-location.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';

import '@polymer/app-route/app-route.js';

import {AppShellStyles} from './components/app-shell/app-shell-styles';

import LoadingMixin from '@unicef-polymer/etools-loading/etools-loading-mixin.js';
import '@unicef-polymer/etools-piwik-analytics/etools-piwik-analytics.js';
import {AppMenuMixin} from './components/app-shell/menu/mixins/app-menu-mixin.js';
import CommonDataMixin from './components/common/common-data.js';
import ToastNotificationsMixin from './components/common/toast-notifications/toast-notification-mixin.js';
import ScrollControlMixin from './components/common/mixins/scroll-control-mixin.js';
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

// import global config and dexie db config
import './config/config.js';
import {RESET_UNSAVED_UPLOADS, RESET_UPLOADS_IN_PROGRESS} from './redux/actions/upload-status.js';
// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

import {BASE_URL} from './config/config';
import UploadsMixin from './components/common/mixins/uploads-mixin.js';
import {fireEvent} from './components/utils/fire-custom-event.js';
import {objectsAreTheSame, isJsonStrMatch} from './components/utils/utils.js';
import {AppDrawerElement} from '@polymer/app-layout/app-drawer/app-drawer.js';
import {property} from '@polymer/decorators';
import {GenericObject, UserPermissions, User} from '@unicef-polymer/etools-types';
import {createDynamicDialog} from '@unicef-polymer/etools-dialog/dynamic-dialog';
import EtoolsDialog from '@unicef-polymer/etools-dialog/etools-dialog';
import {logError} from '@unicef-polymer/etools-behaviors/etools-logging';
import get from 'lodash-es/get';
import {EtoolsRouter} from './components/utils/routes.js';
import {registerTranslateConfig, use} from 'lit-translate';
import {getRedirectToListPath} from './components/utils/subpage-redirect';
import debounce from 'lodash-es/debounce';
import {LitElement} from 'lit-element';
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
const translationConfig = registerTranslateConfig({loader: (lang: string) => fetchLangFiles(lang)});

setRootPath(BASE_URL);

/**
 * @customElement
 * @polymer
 * @appliesMixin GestureEventListeners
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
    GestureEventListeners(
      AppMenuMixin(
        ToastNotificationsMixin(
          ScrollControlMixin(UtilsMixin(LoadingMixin(UserDataMixin(CommonDataMixin(PolymerElement)))))
        )
      )
    )
  )
) {
  public static get template() {
    // main template
    // language=HTML
    return html`
      ${AppShellStyles}

      <environment-flags></environment-flags>

      <etools-piwik-analytics page="[[subroute.prefix]]" user="[[user]]" toast="[[currentToastMessage]]">
      </etools-piwik-analytics>

      <app-location
        route="{{appLocRoute}}"
        path="{{appLocPath}}"
        query-params="{{appLocQueryParams}}"
        url-space-regex="^[[rootPath]]"
      >
      </app-location>

      <app-route
        route="{{route}}"
        pattern="[[rootPath]]:module"
        data="{{routeData}}"
        tail="{{subroute}}"
        on-route-changed="routeChanged"
      >
      </app-route>

      <app-drawer-layout id="layout" responsive-width="850px" fullbleed narrow="{{narrow}}" small-menu$="[[smallMenu]]">
        <!-- Drawer content -->
        <app-drawer
          id="drawer"
          slot="drawer"
          transition-duration="350"
          opened="[[_drawerOpened]]"
          swipe-open="[[narrow]]"
          small-menu$="[[smallMenu]]"
        >
          <!-- App main menu(left sidebar) -->
          <app-menu root-path="[[rootPath]]" selected-option="[[module]]" small-menu$="[[smallMenu]]"></app-menu>
        </app-drawer>

        <!-- Main content -->
        <app-header-layout id="appHeadLayout" fullbleed has-scrolling-region>
          <app-header slot="header" fixed shadow>
            <page-header id="pageheader"></page-header>
          </app-header>

          <!-- Main content -->
          <main role="main" id="page-container" class$="[[_getPageContainerClass(amendmentModeActive)]]">
            <template is="dom-if" if="[[_activeModuleIs(module, 'partners|government-partners')]]" restamp>
              <partners-module
                id="partners"
                class="main-page"
                show-only-government-type="[[_showOnlyGovernmentPartners(_lastActivePartnersModule)]]"
                current-module="[[_lastActivePartnersModule]]"
                route="{{subroute}}"
                permissions="[[permissions]]"
              >
              </partners-module>
            </template>

            <template is="dom-if" if="[[_activeModuleIs(module, 'agreements')]]" restamp>
              <agreements-module id="agreements" class="main-page" route="{{subroute}}" permissions="[[permissions]]">
              </agreements-module>
            </template>

            <template is="dom-if" if="[[_activeModuleIs(module, 'interventions')]]" restamp>
              <interventions-module id="interventions" class="main-page" user-permissions="[[permissions]]">
              </interventions-module>
            </template>

            <template is="dom-if" if="[[_activeModuleIs(module, 'reports')]]" restamp>
              <reports-module id="reports" class="main-page" route="{{subroute}}" permissions="[[permissions]]">
              </reports-module>
            </template>

            <template is="dom-if" if="[[_activeModuleIs(module, 'not-found')]]" restamp>
              <not-found class="main-page"></not-found>
            </template>

            <template is="dom-if" if="[[_activeModuleIs(module, 'settings')]]" restamp>
              <settings-module id="settings" class="main-page"></settings-module>
            </template>
          </main>

          <page-footer></page-footer>

          <div id="floating-footer" hidden>
            <strong> AMENDMENT MODE </strong>
            | All fields in the details tab are now open for editing. Please save before clicking "I am done".
            <paper-button class="primary-btn" on-tap="_closeAmendment">I AM DONE</paper-button>
          </div>
        </app-header-layout>
      </app-drawer-layout>

      <data-refresh-dialog id="dataRefreshDialog" page="[[module]]"></data-refresh-dialog>

      <partners-list-data></partners-list-data>
      <agreements-list-data></agreements-list-data>
    `;
  }

  @property({type: Boolean})
  _drawerOpened = false;

  @property({type: String})
  _page = '';

  /**
   * `module` property represents the current displayed module of the PMP app.
   * It can only have there values: partners, agreements, interventions, reports, settings and not-found.
   * Main modules will have other pages and routing (prefixed by app-shell route).
   */
  @property({
    type: String,
    reflectToAttribute: true,
    observer: AppShell.prototype._moduleChanged
  })
  module!: string;

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

  @property({type: Boolean, reflectToAttribute: true})
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

  @property({type: Object, observer: AppShell.prototype.appLocRouteChanged})
  appLocRoute!: {
    path: string;
    __queryParams: GenericObject;
  };

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

  public static get observers() {
    return ['_routePageChanged(routeData.module)', '_scrollToTopOnPageChange(module)'];
  }

  ready() {
    super.ready();

    this._initListeners();
    this._createLeavePageDialog();
    if (this.$.appHeadLayout) {
      window.EtoolsEsmmFitIntoEl = this.$.appHeadLayout!.shadowRoot!.querySelector('#contentContainer');
      this.etoolsLoadingContainer = window.EtoolsEsmmFitIntoEl;
    }
    if (this.module !== 'not-found') {
      /*
       * Activate the global loading with default message.
       * This will be triggered once at page load or, after page load, on menu option tap event.
       * The loading message is disabled by *-module.html elements ready callback (in both cases)
       */
      fireEvent(this, 'global-loading', {
        active: true,
        loadingSource: 'main-page'
      });
    }
  }

  public connectedCallback() {
    this.updateReduxRouteDetails = debounce(this.updateReduxRouteDetails.bind(this), 20);
    super.connectedCallback();

    this.checkAppVersion();
    this.requestUserData();
    // trigger common data load requests
    // @ts-ignore
    this.loadCommonData();

    installMediaQueryWatcher(`(min-width: 460px)`, () => store.dispatch(updateDrawerState(false)));

    this.createToastNotificationElement();
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

  updateReduxRouteDetails(appLocRoute: any) {
    const routeDetails = EtoolsRouter.getRouteDetails(appLocRoute);
    // If the url is not complete(ex /pmp/interventions), redirect to /pmp/interventions/list
    const redirectTo = getRedirectToListPath(appLocRoute.path);
    if (redirectTo) {
      EtoolsRouter.replaceAppLocation(redirectTo);
    }
    if (!isJsonStrMatch(routeDetails, get(store.getState(), 'app.routeDetails'))) {
      store.dispatch(updateStoreRouteDetails(routeDetails));
    }
  }

  public stateChanged(state: RootState) {
    // TODO: _page is gonna be user with pwa router, not used right now (future improvement)
    // this._page = state.app!.page;
    this._drawerOpened = state.app!.drawerOpened;
    this.smallMenu = state.app!.smallMenu;
    this.uploadsStateChanged(state);

    // @ts-ignore EndpointsMixin
    this.envStateChanged(state);
    if (get(state, 'app.toastNotification.active')) {
      fireEvent(this, 'toast', {
        text: state.app!.toastNotification.message,
        showCloseBtn: state.app!.toastNotification.showCloseBtn
      });
    }

    if (!isJsonStrMatch(state.activeLanguage!.activeLanguage, this.selectedLanguage)) {
      this.selectedLanguage = state.activeLanguage!.activeLanguage;
      this.loadLocalization();
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

  /*
   * When navigating using tabs, the routeChanged is triggered first
   * and then the appLocRouteChanged method is triggered to update the url in the browser.
   * When navigating using updateAppState the url is set first (appLocRouteChanged is triggered)
   * and then routeChanged
   */
  public appLocRouteChanged(appLocRoute: any) {
    this.updateReduxRouteDetails(appLocRoute);
    if (this.route) {
      if (appLocRoute.path === this.route.path) {
        if (objectsAreTheSame(appLocRoute.__queryParams, this.route.__queryParams)) {
          return;
        } else {
          if (this.isInterventionReports(this.appLocRoute.path)) {
            return;
          }
        }
      }
    }

    if (Number(this.uploadsInProgress) > 0 || Number(this.unsavedUploads) > 0) {
      this._openLeavePageDialog();
    } else {
      this.route = JSON.parse(JSON.stringify(appLocRoute));
    }
  }

  public routeChanged() {
    if (
      this.appLocRoute.path === this.route.path &&
      objectsAreTheSame(this.appLocRoute.__queryParams, this.route.__queryParams)
    ) {
      return;
    }

    /* Setting this.appLocRoute = JSON.parse(JSON.stringify(this.route)),
     * makes appLocRouteChanged be triggered twice,
     * first with changes to the path , without the changes to the query string, which ruins everything
     */
    this.setProperties({
      appLocQueryParams: this.route.__queryParams ? JSON.parse(JSON.stringify(this.route.__queryParams)) : {},
      appLocPath: this.route.path
    });
  }

  public isInterventionReports(path: string) {
    const pattern = new RegExp('\\/pmp\\/interventions\\/\\d*\\/reports', 'i');
    return pattern.test(path);
  }

  private _initListeners() {
    this._pageNotFound = this._pageNotFound.bind(this);
    this._updateMainPath = this._updateMainPath.bind(this);
    this._updateQueryParams = this._updateQueryParams.bind(this);
    this._onForbidden = this._onForbidden.bind(this);
    this._openDataRefreshDialog = this._openDataRefreshDialog.bind(this);
    this._drawerChanged = this._drawerChanged.bind(this);

    this.addEventListener('404', this._pageNotFound);
    this.addEventListener('update-main-path', this._updateMainPath as any);
    this.addEventListener('forbidden', this._onForbidden);
    this.addEventListener('open-data-refresh-dialog', this._openDataRefreshDialog);
    this.addEventListener('app-drawer-transitioned', this._drawerChanged);
  }

  private _removeListeners() {
    this.removeEventListener('404', this._pageNotFound);
    this.removeEventListener('update-main-path', this._updateMainPath as any);
    this.removeEventListener('update-route-query-params', this._updateQueryParams as any);
    this.removeEventListener('forbidden', this._onForbidden);
    this.removeEventListener('open-data-refresh-dialog', this._openDataRefreshDialog);
    this.removeEventListener('app-drawer-transitioned', this._drawerChanged);
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this._removeListeners();
  }

  public _drawerChanged() {
    // need this for catching drawer closing event and keep _drawerOpened updated
    store.dispatch(updateDrawerState(Boolean((this.$.drawer as AppDrawerElement).opened)));
  }

  private _showConfirmNewVersionDialog() {
    const msg = document.createElement('span');
    msg.innerText = 'A new version of the app is available. Refresh page?';
    const conf: any = {
      size: 'md',
      closeCallback: this._onConfirmNewVersion.bind(this),
      content: msg
    };
    const confirmNewVersionDialog = createDynamicDialog(conf);
    confirmNewVersionDialog.opened = true;
  }

  private _onConfirmNewVersion(e: CustomEvent) {
    if (e.detail.confirmed) {
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
  private _scrollToTopOnPageChange(module: string) {
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
    if (e.detail.path !== this.route.path.replace(this.rootPath, '')) {
      // set route.path only if received path is different
      this._updatePath(e.detail.path);
    }
    e.stopImmediatePropagation();
  }

  private _updateQueryParams(e: CustomEvent) {
    this.set('appLocQueryParams', e.detail);
  }

  private _updatePath(path: string) {
    this.setProperties({
      appLocQueryParams: {},
      appLocPath: this.rootPath + path
    });
  }

  private _pageNotFound() {
    this._updatePath('not-found');
    // the _moduleChanged method will trigger and clear loading messages so no need to do that here
    fireEvent(this, 'toast', {
      text: 'An error occurred.',
      showCloseBtn: true
    });
  }

  private _openDataRefreshDialog() {
    (this.$.dataRefreshDialog! as unknown as DataRefreshDialog).open();
  }

  private _canAccessPage(module: string) {
    // TODO: (future task) use defer method from utils mixin
    // (NOTE: not all utils behavior functionality is needed)

    const defer: any = {};
    defer.promise = new Promise(function (resolve, reject) {
      defer.resolve = resolve;
      defer.reject = reject;
    });

    const isPrpModule = this._prpModules.indexOf(module) > -1;

    if (!isPrpModule) {
      defer.resolve(true);
    } else {
      // only prp modules can have access restricted
      // @ts-ignore
      this.waitForEnvFlagsToLoad().then(() => {
        // @ts-ignore
        defer.resolve(this.showPrpReports());
      });
    }

    return defer.promise;
  }

  /**
   * Set active module using route module param
   * @param routePage
   */
  // @ts-ignore
  private _routePageChanged(routePage: string) {
    // If no routePage was found in the route data, routePage will be an empty string.
    // Default to 'partners/list' in that case.
    if (!routePage) {
      this._updatePath('partners/list');
      return;
    }

    this._canAccessPage(routePage).then((accessGranted: boolean) => {
      this.waitForTranslationsAndLanguageToLoad().then(() => {
        if (!accessGranted) {
          this._pageNotFound();
        } else {
          this.set('module', routePage);
        }
      });
    });

    // Close a non-persistent drawer when the module & route are changed.
    const appDrawer = this.$.drawer as AppDrawerElement;
    if (!appDrawer.persistent) {
      appDrawer.close();
    }
  }

  private _moduleChanged(module: any, _oldModule: any) {
    // Load module import on demand. Show 404 page if fails
    this._importAppModuleMainEl(module);
    // set last partners active page... needed to make a difference between partners and government-partners
    this._updateLastPartnersModuleActivePage(module);
    // clear loading messages queue
    fireEvent(this, 'clear-loading-messages', {
      bubbles: true,
      composed: true
    });
  }

  // @ts-ignore
  private _getModuleMainElUrl(elementName: string) {
    let url = this._appModuleMainElUrlTmpl.replace('##module##', elementName);
    if (elementName === 'not-found') {
      url = url.replace('-module.', '.');
    }
    return url.replace('##main-el-name##', elementName);
  }

  /**
   * Import app module main element.
   * This element will have it's own routing based on app-shell subroute
   * @param module
   * @private
   */
  private _importAppModuleMainEl(module: string) {
    if (!module) {
      return;
    }
    // resolve element import url
    const appModuleMainElId = this._getAppModuleMainElId(module);
    const pageUrl = this._getModuleMainElUrl(appModuleMainElId);

    // import main module element if needed
    const moduleMainEl = this._getModuleMainElement(appModuleMainElId);
    const isPolymerElement = moduleMainEl instanceof PolymerElement || moduleMainEl instanceof LitElement;
    if (!isPolymerElement) {
      // moduleMainEl is null => make the import
      import(pageUrl)
        .then(() => {
          this._successfulImportCallback(appModuleMainElId);
        })
        .catch((err: any) => {
          logError('Error importing component.', 'app-shell', err);
          this._pageNotFound();
        });
    }
  }

  // @ts-ignore
  private _getAppModuleMainElId(module: string) {
    return module === 'government-partners' ? 'partners' : module;
  }

  private _getModuleMainElement(moduleId: string) {
    return this.shadowRoot!.querySelector('#' + moduleId);
  }

  /**
   * Module main element import success callback
   * @param currentLoadingPage
   */
  // @ts-ignore
  private _successfulImportCallback(moduleId: string) {
    // moduleMainEl will be available only after import successfully completes
    // @ts-ignore
    const moduleMainEl = this._getModuleMainElement(moduleId);
    // make sure to redirect to list page if necessary
    afterNextRender(moduleMainEl, this._redirectToProperListPage.bind(this));
  }

  // @ts-ignore
  private _activeModuleIs(activeModule: string, expectedModule: string) {
    const pagesToMatch = expectedModule.split('|');
    return pagesToMatch.indexOf(activeModule) > -1;
  }

  // @ts-ignore
  private _redirectToProperListPage() {
    if (this.route.path.indexOf('not-found') > -1) {
      return;
    }
    if (this.route.path === this.rootPath || this.route.path === '/') {
      // setting the default path when user enters the app
      // redirect from /pmp/ to /pmp/partners/list
      this.set('route.path', this.rootPath + 'partners/list');
      return;
    }
    // redirect from /pmp/<module> to /pmp/<module>/list
    let currentPath = this.route.path;
    if (currentPath.indexOf('settings') > -1) {
      return;
    }
    if (currentPath.substr(-1) === '/') {
      currentPath = currentPath.slice(0, currentPath.lastIndexOf('/'));
    }
    if (currentPath === this.rootPath + this.routeData.module) {
      this.set('route.path', this.rootPath + this.routeData.module + '/list');
    }
  }

  // @ts-ignore
  private _showOnlyGovernmentPartners(module: string) {
    return module === 'government-partners';
  }

  private _updateLastPartnersModuleActivePage(module: string) {
    if (module && ['partners', 'government-partners'].indexOf(module) > -1) {
      this.set('_lastActivePartnersModule', module);
    }
  }

  private _createLeavePageDialog() {
    const msg = document.createElement('span');
    msg.innerText = 'Are you sure you want to leave this page? All file uploads in progress or unsaved will be lost!';
    const conf: any = {
      title: 'Are you sure you want to leave this page?',
      size: 'md',
      okBtnText: 'Leave',
      cancelBtnText: 'Stay',
      closeCallback: this._onLeavePageConfirmation.bind(this),
      content: msg
    };
    this.leavePageDialog = createDynamicDialog(conf);
  }

  private _openLeavePageDialog() {
    this.leavePageDialog.opened = true;
  }

  // @ts-ignore
  private _onLeavePageConfirmation(e: CustomEvent) {
    if (e.detail.confirmed) {
      // leave
      store.dispatch({type: RESET_UNSAVED_UPLOADS});
      store.dispatch({type: RESET_UPLOADS_IN_PROGRESS});
      this.route = JSON.parse(JSON.stringify(this.appLocRoute));
    } else {
      // stay
      // revert url
      this.appLocRoute = JSON.parse(JSON.stringify(this.route));

      fireEvent(this, 'clear-loading-messages', {
        bubbles: true,
        composed: true
      });
      this.shadowRoot!.querySelector('app-menu')!
        .shadowRoot!.querySelector('iron-selector')!
        .select(this.routeData.module);
    }
  }
}

window.customElements.define('app-shell', AppShell);
