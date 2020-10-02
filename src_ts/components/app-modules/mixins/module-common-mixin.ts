// import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import {ListQueryParams} from '../../../typings/route.types.js'; // TODO - load using tsconfig
import '../../../typings/globals.types.js';
import {PolymerElement} from '@polymer/polymer';

import {fireEvent} from '../../utils/fire-custom-event.js';
import {logWarn} from '@unicef-polymer/etools-behaviors/etools-logging.js';
import {Constructor, GenericObject} from '../../../typings/globals.types.js';
import {property} from '@polymer/decorators';

/**
 * Module main elements common functionality
 * @polymer
 * @mixinFunction
 */
function ModuleMainElCommonFunctionalityMixin<T extends Constructor<PolymerElement>>(baseClass: T) {
  class ModuleMainElCommonFunctionalityClass extends baseClass {
    /* Gets updated by app-route */
    @property({
      type: Object,
      observer: ModuleMainElCommonFunctionalityClass.prototype._handleQueryParams
    })
    listPageQueryParams!: GenericObject;

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

    ready() {
      super.ready();
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
      this.set('serverErrors', []);
    }

    _setServerErrors(e: CustomEvent) {
      this.set('serverErrors', e.detail);
    }

    _handleQueryParams(params: ListQueryParams) {
      if (
        params !== null &&
        Object.keys(params).length &&
        // @ts-ignore
        this.routeData.tab !== 'reports'
      ) {
        this.set('preservedListQueryParams', params);
      }
    }

    _pageEquals(activePage: string, expectedPage: string) {
      return activePage === expectedPage;
    }

    _removeStrDash(str: string) {
      return str ? str.replace(new RegExp('-', 'g'), ' ') : '';
    }

    _showPageTabs(page: string) {
      return page !== 'list';
    }

    _showTabChangeLoadingMsg(e: CustomEvent | null, loadingSource: string, tabPrefix: string, tab?: string) {
      const clickedTabName = tab ? tab : e!.detail.item.getAttribute('name');
      const selector = tabPrefix + clickedTabName;
      const tabEl = this.shadowRoot!.querySelector(selector);

      if(tabEl && selector === 'intervention-tabs') {
          if(tabEl.shadowRoot!.querySelector('intervention-details') !== null) {
            return;
          }
      }

      if (tabEl instanceof PolymerElement) {
        // tab element already loaded, no need for loading messages
        return;
      }
      fireEvent(this, 'global-loading', {
        message: 'Loading...',
        active: true,
        loadingSource: loadingSource
      });
    }

    /**
     * "other" can be any property that must be defined before the method
     * is executed (main item displayed on the page, activePage)
     */
    _showSidebarStatus(listPageActive: boolean, tabAttached: boolean, other?: boolean) {
      const showStatus = !listPageActive && !!tabAttached;
      return !other ? showStatus : showStatus && other;
    }

    _reloadListData(e: CustomEvent) {
      e.stopImmediatePropagation();
      try {
        const listElem = this.shadowRoot!.querySelector('#list') as PolymerElement & {
          _filterListData(forceNoLoading: boolean): void;
        };
        if (listElem && listElem._filterListData) {
          listElem._filterListData(true);
        }
      } catch (err) {
        // @ts-ignore
        logWarn('List refresh error occurred', '[' + this.moduleName + '-module]', err);
      }
    }
  }
  return ModuleMainElCommonFunctionalityClass;
}

export default ModuleMainElCommonFunctionalityMixin;
