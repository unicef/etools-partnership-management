import {ListQueryParams} from '../../../typings/route.types'; // TODO - load using tsconfig;
import {LitElement} from 'lit';
import {property} from 'lit/decorators.js';

import {fireEvent} from '@unicef-polymer/etools-utils/dist/fire-event.util';
import {EtoolsLogger} from '@unicef-polymer/etools-utils/dist/singleton/logger';
import {Constructor, GenericObject} from '@unicef-polymer/etools-types';

/**
 * Module main elements common functionality
 * @LitElement
 * @mixinFunction
 */
function ModuleMainElCommonFunctionalityMixinLit<T extends Constructor<LitElement>>(baseClass: T) {
  class ModuleMainElCommonFunctionalityClass extends baseClass {
    _listPageQueryParams!: GenericObject;
    /* Gets updated by app-route */
    get listPageQueryParams() {
      return this._listPageQueryParams;
    }

    @property({type: Object})
    set listPageQueryParams(newVal) {
      this._listPageQueryParams = newVal;
      this._handleQueryParams(this.listPageQueryParams);
    }

    /* Gets updated when listPageQueryParams changes, only if listPageQueryParams is not empty,
        otherwise preservedListQueryParams holds on to it's previous data.
        This is to preserve set list page filters like : rows per page , search string, any other filters,
        while navigating between pages from the same category
        (ex. go to intervention list, select to filter by intervention status, go to intervention details,
        click on the Interventions left side menu item => the intervention list is
        still filtered by intervention status).
    */
    @property({type: Object})
    preservedListQueryParams: GenericObject = {};

    @property({type: Array})
    serverErrors: any[] = [];

    connectedCallback() {
      super.connectedCallback();

      this._clearServerErrors = this._clearServerErrors.bind(this);
      this._setServerErrors = this._setServerErrors.bind(this);
      this._reloadListData = this._reloadListData.bind(this);

      this.addEventListener('clear-server-errors', this._clearServerErrors as any);
      this.addEventListener('set-server-errors', this._setServerErrors as any);
      this.addEventListener('reload-list', this._reloadListData as any);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('clear-server-errors', this._clearServerErrors);
      this.removeEventListener('set-server-errors', this._setServerErrors as any);
      this.removeEventListener('reload-list', this._reloadListData as any);
    }

    _clearServerErrors() {
      this.serverErrors = [];
    }

    _setServerErrors(e: CustomEvent) {
      this.serverErrors = e.detail;
    }

    _handleQueryParams(params: ListQueryParams) {
      if (
        params &&
        Object.keys(params).length &&
        // @ts-ignore
        (!this.routeData || this.routeData.tab !== 'reports')
      ) {
        this.preservedListQueryParams = params;
      }
    }

    _pageEquals(activePage: string, expectedPage: string) {
      return activePage === expectedPage;
    }

    _removeStrDash(str: string) {
      return str ? str.replace(new RegExp('-', 'g'), ' ') : '';
    }

    _showPageTabs(page: string) {
      return page && page !== 'list';
    }

    _showTabChangeLoadingMsg(e: CustomEvent | null, loadingSource: string, tabPrefix: string, tab?: string) {
      const clickedTabName = tab ? tab : e!.detail.name;
      const selector = tabPrefix + clickedTabName;
      const tabEl = this.shadowRoot!.querySelector(selector);

      if (tabEl) {
        if (tabEl instanceof LitElement) {
          // tab element already loaded, no need for loading messages
          return;
        }
        if (selector === 'intervention-tabs' && tabEl.shadowRoot!.querySelector('intervention-metadata') !== null) {
          // intervention-tabs tab element already loaded, no need for loading messages
          return;
        }
        if (selector === 'gdd-intervention-tabs' && tabEl.shadowRoot!.querySelector('intervention-metadata') !== null) {
          // intervention-tabs tab element already loaded, no need for loading messages
          return;
        }
      }
      fireEvent(this, 'global-loading', {
        active: true,
        loadingSource: loadingSource
      });
    }

    /**
     * "other" can be any property that must be defined before the method
     * is executed (main item displayed on the page, activePage)
     */
    _showSidebarStatus(listPageActive: boolean, tabAttached: boolean, other?: any) {
      const showStatus = !listPageActive && !!tabAttached;
      return !other ? showStatus : showStatus && other;
    }

    _reloadListData(e: CustomEvent) {
      e.stopImmediatePropagation();
      try {
        const listElem = this.shadowRoot!.querySelector('#list') as LitElement & {
          _filterListData(forceNoLoading: boolean): void;
        };
        if (listElem && listElem._filterListData) {
          listElem._filterListData(true);
        }
      } catch (err) {
        // @ts-ignore
        EtoolsLogger.warn('List refresh error occurred', '[' + this.moduleName + '-module]', err);
      }
    }
  }
  return ModuleMainElCommonFunctionalityClass;
}

export default ModuleMainElCommonFunctionalityMixinLit;
