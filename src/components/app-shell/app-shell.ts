/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// import { LitElement, html, property, PropertyValues } from '@polymer/lit-element';
import { PolymerElement, html } from '@polymer/polymer/polymer-element.js';
import { setPassiveTouchGestures, setRootPath} from '@polymer/polymer/lib/utils/settings.js';
import { connect } from 'pwa-helpers/connect-mixin.js';
import { installMediaQueryWatcher } from 'pwa-helpers/media-query.js';
import {installRouter} from "pwa-helpers/router.js";

// This element is connected to the Redux store.
import { store, RootState } from '../../store.js';

// These are the actions needed by this element.
import {
  navigate,
  updateDrawerState
} from '../../actions/app.js';

// Lazy loading CommonData reducer.
import commonData from '../../reducers/common-data.js';
store.addReducers({
  // @ts-ignore
  commonData
});

// These are the elements needed by this element.
import '@polymer/app-layout/app-drawer-layout/app-drawer-layout.js';
import '@polymer/app-layout/app-drawer/app-drawer.js';
import '@polymer/app-layout/app-header-layout/app-header-layout.js';
import '@polymer/app-layout/app-header/app-header.js';
import '@polymer/app-layout/app-toolbar/app-toolbar.js';

import {AppShellStyles} from './app-shell-styles';

// @ts-ignore
import EtoolsMixinFactory from 'etools-behaviors/etools-mixin-factory.js';
// @ts-ignore
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin.js';

import {AppMenuMixin} from './menu/mixins/app-menu-mixin.js';
import CommonData from '../common-data-mixins/common-data.js'
import ToastNotifications from '../toast-notifications/toast-notification-mixin.js';
import EnvironmentFlags from "../environment-flags/environment-flags-mixin.js";
import ScrollControl from "../mixins/scroll-control-mixin.js";
import AmendmentModeUIMixin from "../amendment-mode/amendment-mode-UI-mixin.js";
import UserDataMixin from "../user/user-data-mixin";

import './menu/app-menu.js';
import './header/page-header.js'
import './footer/page-footer.js'

import '../environment-flags/environment-flags';

import './app-theme.js';

// Gesture events like tap and track generated from touch will not be
// preventable, allowing for better scrolling performance.
setPassiveTouchGestures(true);

setRootPath('/pmp_poly3/');

/**
 * @customElement
 * @polymer
 * @appliesMixin EtoolsLogsMixin
 * @appliesMixin AppMenuMixin
 * @appliesMixin CommonData
 * @appliesMixin ToastNotifications
 * @appliesMixin EnvironmentFlags
 * @appliesMixin ScrollControl
 * @appliesMixin AmendmentModeUIMixin
 * @appliesMixin UserDataMixin
 */
class AppShell extends connect(store)(EtoolsMixinFactory.combineMixins([
  EtoolsLogsMixin,
  AppMenuMixin,
  CommonData,
  ToastNotifications,
  EnvironmentFlags,
  ScrollControl,
  AmendmentModeUIMixin,
  UserDataMixin,
  // EventHelper,
  // Utils,
  // DynamicDialogMixin,
  // Uploads
], PolymerElement) as any) {

  public static get template() {
    // main template
    // language=HTML
    return html`
    ${AppShellStyles}
    
    <environment-flags></environment-flags>
    
    <!--<app-location-->
        <!--route="{{appLocRoute}}"-->
        <!--path="{{appLocPath}}"-->
        <!--query-params="{{appLocQueryParams}}"-->
        <!--url-space-regex="^[[rootPath]]">-->
    <!--</app-location>-->

    <!--<app-route-->
        <!--route="{{route}}"-->
        <!--pattern="[[rootPath]]:module"-->
        <!--data="{{routeData}}"-->
        <!--tail="{{subroute}}"-->
        <!--on-route-changed="routeChanged">-->
    <!--</app-route>-->
    
    <app-drawer-layout id="layout" responsive-width="850px"
                       fullbleed narrow="{{narrow}}" small-menu$="[[smallMenu]]">
      <!-- Drawer content -->
      <app-drawer id="drawer" slot="drawer" transition-duration="350" 
                  opened="[[_drawerOpened]]"
                  swipe-open="[[narrow]]" small-menu$="[[smallMenu]]">
        <!-- App main menu(left sidebar) -->
        <app-menu root-path="[[rootPath]]"
                  selected-option="[[_page]]"
                  small-menu$="[[smallMenu]]"></app-menu>
      </app-drawer>

      <!-- Main content -->
      <app-header-layout id="appHeadLayout" fullbleed has-scrolling-region>

        <app-header slot="header" fixed shadow>
          <page-header id="pageheader" title="eTools"></page-header>
        </app-header>

        <!-- Main content -->
        <main role="main" id="page-container" class$="main-content [[_getPageContainerClass(amendmentModeActive)]]">
        
        
          <!--<page-one class="page" active$="[[_isActivePage(_page, 'page-one')]]"></page-one>-->
          <!--<page-two class="page" active$="[[_isActivePage(_page, 'page-two')]]"></page-two>-->
          <page-not-found class="page" active$="[[_isActivePage(_page, 'page-not-found')]]"></page-not-found>
        
        
        </main>

        <page-footer hidden$="[[amendmentModeActive]]"></page-footer>
        
        <div id="floating-footer"
             hidden$="[[!amendmentModeActive]]">
          <strong> AMENDMENT MODE </strong>
          | All fields in the details tab are now open for editing.
          Please save before clicking "I am done".
          <paper-button class="primary-btn" on-tap="_closeAmendment">I AM DONE</paper-button>
        </div>

      </app-header-layout>
    </app-drawer-layout>
    
    <!-- TODO: polymer 3 - refactor, migrate, uncomment -->
    <!--<data-refresh-dialog id="dataRefreshDialog" page="{{module}}"></data-refresh-dialog>-->

    <!--<partners-list-data></partners-list-data>-->
    <!--<agreements-list-data></agreements-list-data>-->

    <!--<etools-piwik-analytics-->
        <!--page="[[subroute.prefix]]"-->
        <!--user="[[user]]"-->
        <!--toast="[[currentToastMessage]]">-->
    <!--</etools-piwik-analytics>-->
    
    `;
  }

  public static get properties() {
    return {
      _drawerOpened: Boolean,
      _page: String,

      /**
       * `module` property represents the current displayed module of the PMP app.
       * It can only have there values: partners, agreements, interventions, reports, settings and not-found.
       * Main modules will have other pages and routing (prefixed by app-shell route).
       */
      module: {
        type: String,
        reflectToAttribute: true,
        observer: '_moduleChanged'
      },
      route: {
        type: Object
      },
      routeData: Object,
      subroute: Object,
      // This shouldn't be neccessary, but the Analyzer isn't picking up
      // Polymer.Element#rootPath
      rootPath: String,
      narrow: {
        type: Boolean,
        reflectToAttribute: true
      },
      user: Object,
      permissions: {
        type: Object,
        value: null
      },
      _lastActivePartnersModule: String,
      _prpModules: {
        type: Array,
        value: ['reports', 'settings']
      },
      _appModuleMainElUrlTmpl: {
        type: String,
        value: 'modules/app-modules/##module##/##main-el-name##-module.html'
      },
      appLocRoute: {
        type: Object,
        observer: 'appLocRouteChanged'
      },
      leavePageDialog: {
        type: Object
      },
      appLocQueryParams: Object,
      appLocPath: String

    };
  }

  // @ts-ignore
  private _page: string = '';
  // @ts-ignore
  private _drawerOpened: boolean = false;

  public static get observers() {
    return [
      '_routePageChanged(routeData.module)',
      '_scrollToTopOnPageChange(module)'
    ];
  }

  ready() {
    super.ready();

    this._initListeners();
    // TODO - polymer 3
    // this.requestUserData();
    this._createLeavePageDialog();
    window.EtoolsEsmmFitIntoEl = this.$.appHeadLayout.shadowRoot.querySelector('#contentContainer');

    if (this.module !== 'not-found') {
      /*
       * Activate the global loading with default message.
       * This will be triggered once at page load or, after page load, on menu option tap event.
       * The loading message is disabled by *-module.html elements ready callback (in both cases)
       */
      // TODO: polymer 3
      // this.fireEvent('global-loading', {
      //   active: true,
      //   loadingSource: 'main-page'
      // });
    }
  }

  public connectedCallback() {
    super.connectedCallback();

    this.requestUserData();

    // trigger common data load requests
    this.loadCommonData();

    installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname))));
    installMediaQueryWatcher(`(min-width: 460px)`,
        () => store.dispatch(updateDrawerState(false)));

    this.createToastNotificationElement();
  }

  public stateChanged(state: RootState) {
    this._page = state.app!.page;
    this._drawerOpened = state.app!.drawerOpened;
  }

  protected _isActivePage(_page: string, expectedPageName: string): boolean {
    return _page === expectedPageName;
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
    if (this.route) {
      if (appLocRoute.path === this.route.path) {
        if (this.objectsAreTheSame(appLocRoute.__queryParams, this.route.__queryParams)) {
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
    if (this.appLocRoute.path === this.route.path &&
        this.objectsAreTheSame(this.appLocRoute.__queryParams, this.route.__queryParams)) {
      return;
    }

    /* Setting this.appLocRoute = JSON.parse(JSON.stringify(this.route)),
     * makes appLocRouteChanged be triggered twice,
     * first with changes to the path , without the changes to the query string, which ruins everything
     */
    this.setProperties({
      'appLocQueryParams': this.route.__queryParams ? JSON.parse(JSON.stringify(this.route.__queryParams)) : {},
      'appLocPath': this.route.path
    });
  }

  public isInterventionReports(path: string) {
    let pattern = new RegExp('\\/pmp\\/interventions\\/\\d*\\/reports', 'i');
    return pattern.test(path);
  }

  private _initListeners() {
    this._pageNotFound = this._pageNotFound.bind(this);
    this._updateMainPath = this._updateMainPath.bind(this);
    this._updateQueryParams = this._updateQueryParams.bind(this);
    this._onForbidden = this._onForbidden.bind(this);
    this._openDataRefreshDialog = this._openDataRefreshDialog.bind(this);

    this.addEventListener('404', this._pageNotFound);
    this.addEventListener('update-main-path', this._updateMainPath);
    this.addEventListener('forbidden', this._onForbidden);
    this.addEventListener('open-data-refresh-dialog', this._openDataRefreshDialog);
  }

  private _removeListeners() {
    this.removeEventListener('404', this._pageNotFound);
    this.removeEventListener('update-main-path', this._updateMainPath);
    this.removeEventListener('update-route-query-params', this._updateQueryParams);
    this.removeEventListener('forbidden', this._onForbidden);
    this.removeEventListener('open-data-refresh-dialog', this._openDataRefreshDialog);
  }

  public disconnectedCallback() {
    super.disconnectedCallback();
    this._removeListeners();
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
    // TODO: polymer 3
    // this.fireEvent('toast', {text: 'An error occurred.', showCloseBtn: true});
  }

  private _openDataRefreshDialog() {
    this.$.dataRefreshDialog.open();
  }

  private _canAccessPage(module: string) {
    // TODO: (future task) use defer method from utils mixin
    // (NOTE: not all utils behavior functionality is needed)
    let defer: any = {};
    defer.promise = new Promise(function(resolve, reject) {
      defer.resolve = resolve;
      defer.reject = reject;
    });

    let isPrpModule = this._prpModules.indexOf(module) > -1;

    if (!isPrpModule) {
      defer.resolve(true);
    } else {
      // only prp modules can have access restricted
      this._waitForEnvFlagsToLoad().then(() => {
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
      if (!accessGranted) {
        this._pageNotFound();
      } else {
        this.set('module', routePage);
      }
    });

    // Close a non-persistent drawer when the module & route are changed.
    if (!this.$.drawer.persistent) {
      this.$.drawer.close();
    }
  }

  // @ts-ignore
  private _moduleChanged(module: string) {
    // Load module import on demand. Show 404 page if fails
    this._importAppModuleMainEl(module);
    // set last partners active page... needed to make a difference between partners and government-partners
    this._updateLastPartnersModuleActivePage(module);
    // clear loading messages queue
    // TODO: polymer 3
    // this.fireEvent('clear-loading-messages', {bubbles: true, composed: true});
    this.updateReduxInAmendment(false);
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
    // let appModuleMainElId = this._getAppModuleMainElId(module);
    // let resolvedPageUrl = this.resolveUrl(this._getModuleMainElUrl(appModuleMainElId));

    // import main module element if needed
    // let moduleMainEl = this._getModuleMainElement(appModuleMainElId);
    // let isPolymerElement = moduleMainEl instanceof Polymer.Element;
    // if (!isPolymerElement) {
    //   // moduleMainEl is null => make the import
    //   Polymer.importHref(
    //       resolvedPageUrl,
    //       this._successfulImportCallback.bind(this, appModuleMainElId),
    //       this._pageNotFound.bind(this),
    //       true);
    // }
  }

  // @ts-ignore
  private _getAppModuleMainElId(module: string) {
    return module === 'government-partners' ? 'partners' : module;
  }

  private _getModuleMainElement(moduleId: string) {
    return this.shadowRoot.querySelector('#' + moduleId);
  }

  /**
   * Module main element import success callback
   * @param currentLoadingPage
   */
  // @ts-ignore
  private _successfulImportCallback(moduleId: string) {
    // moduleMainEl will be available only after import successfully completes
    // @ts-ignore
    let moduleMainEl = this._getModuleMainElement(moduleId);
    // make sure to redirect to list page if necessary
    // TODO - polymer 3
    // Polymer.RenderStatus.afterNextRender(moduleMainEl, this._redirectToProperListPage.bind(this));
  }

  // @ts-ignore
  private _activeModuleIs(activeModule: string, expectedModule: string) {
    let pagesToMatch = expectedModule.split('|');
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
    let msg = document.createElement('span');
    msg.innerText = 'Are you sure you want to leave this page? All file uploads in progress or unsaved will be lost!';
    // TODO: polymer 3
    // let conf: any = {
    //   title: 'Are you sure you want to leave this page?',
    //   size: 'md',
    //   okBtnText: 'Leave',
    //   cancelBtnText: 'Stay',
    //   closeCallback: this._onLeavePageConfirmation.bind(this),
    //   content: msg
    // };
    // this.leavePageDialog = this.createDynamicDialog(conf);
  }

  private _openLeavePageDialog() {
    this.leavePageDialog.opened = true;
  }

  // @ts-ignore
  private _onLeavePageConfirmation(e: CustomEvent) {
    if (e.detail.confirmed) { // leave
      this.dispatch('resetUploadsInProgress');
      this.dispatch('resetUnsavedUploads');
      this.route = JSON.parse(JSON.stringify(this.appLocRoute));
    } else { // stay
      // revert url
      this.appLocRoute = JSON.parse(JSON.stringify(this.route));

      // TODO: polymer 3
      // this.fireEvent('clear-loading-messages', {bubbles: true, composed: true});
      this.shadowRoot.querySelector('app-sidebar-menu')
          .shadowRoot.querySelector('iron-selector').select(this.routeData.module);
    }
  }
}

window.customElements.define('app-shell', AppShell);
