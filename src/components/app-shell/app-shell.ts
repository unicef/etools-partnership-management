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

import {AppMenuMixin} from './menu/mixins/app-menu-mixin.js';
import CommonData from '../common-data-mixins/common-data.js'

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
 * @appliesMixin AppMenuMixin
 * @appliesMixin CommonData
 */
class AppShell extends connect(store)(AppMenuMixin(CommonData(PolymerElement)) as any) {

  public static get template() {
    // main template
    // language=HTML
    return html`
    ${AppShellStyles}
    
    <environment-flags></environment-flags>
    
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
        <main role="main" class="main-content">
          <page-one class="page" active$="[[_isActivePage(_page, 'page-one')]]"></page-one>
          <page-two class="page" active$="[[_isActivePage(_page, 'page-two')]]"></page-two>
          <page-not-found class="page" active$="[[_isActivePage(_page, 'page-not-found')]]"></page-not-found>
        </main>

        <page-footer></page-footer>

      </app-header-layout>
    </app-drawer-layout>
    `;
  }

  public static get properties() {
    return {
      _drawerOpened: Boolean,
      _page: String
    };
  }

  // @ts-ignore
  private _page: string = '';
  // @ts-ignore
  private _drawerOpened: boolean = false;

  public connectedCallback() {
    super.connectedCallback();

    // trigger common data load requests
    this.loadCommonData();

    installRouter((location) => store.dispatch(navigate(decodeURIComponent(location.pathname))));
    installMediaQueryWatcher(`(min-width: 460px)`,
        () => store.dispatch(updateDrawerState(false)));
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
}

window.customElements.define('app-shell', AppShell);
