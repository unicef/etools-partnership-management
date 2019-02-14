import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import EventHelperMixin from '../../mixins/event-helper-mixin.js';
import { ListQueryParams } from '../../../typings/route.types.js';//TODO - load using tsconfig
import '../../../typings/globals.types.js';
import { PolymerElement } from '@polymer/polymer';

// @ts-ignore
import EtoolsLogsMixin from 'etools-behaviors/etools-logs-mixin';
  /**
   * Module main elements common functionality
   * @polymer
   * @mixinFunction
   * @appliesMixin EtoolsLogsMixin
   * @appliesMixin EventHelperMixin
   */
  const ModuleMainElCommonFunctionalityMixin = dedupingMixin(
    (superClass: any) => class extends (EtoolsLogsMixin(EventHelperMixin(superClass)) as any) {
      static get properties() {
        return {
          /* Gets updated by app-route */
          listPageQueryParams: {
            type: Object,
            observer: '_handleQueryParams'
          },
          /* Gets updated when listPageQueryParams changes, only if listPageQueryParams is not empty,
             otherwise preservedListQueryParams holds on to it's previous data.
             This is to preserve set list page filters like : rows per page , search string, any other filters,
             while navigating between pages from the same category
             (ex. go to intervention list, select to filter by intervention status, go to intervention details,
             click on the Interventions left side menu item => the intervention list is
             still filtered by intervention status).
          */
          preservedListQueryParams: {
            type: Object,
            value: {}
          },
          serverErrors: {
            type: Array,
            value: []
          }
        };
      }

      ready() {
        super.ready();
        this._clearServerErrors = this._clearServerErrors.bind(this);
        this._setServerErrors = this._setServerErrors.bind(this);
        this._reloadListData = this._reloadListData.bind(this);

        this.addEventListener('clear-server-errors', this._clearServerErrors);
        this.addEventListener('set-server-errors', this._setServerErrors);
        this.addEventListener('reload-list', this._reloadListData);
      }

      disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('clear-server-errors', this._clearServerErrors);
        this.removeEventListener('set-server-errors', this._setServerErrors);
        this.removeEventListener('reload-list', this._reloadListData);
      }

      _clearServerErrors() {
        this.set('serverErrors', []);
      }

      _setServerErrors(e: CustomEvent) {
        this.set('serverErrors', e.detail);
      }

      _handleQueryParams(params: ListQueryParams) {
        if (params !== null && Object.keys(params).length &&
            this.routeData.tab !== 'reports') {
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

      _showTabChangeLoadingMsg(e: CustomEvent, loadingSource: string, tabPrefix: string, tab: string) {
        let clickedTabName = tab ? tab : e.detail.item.getAttribute('name');
        let tabEl = this.shadowRoot.querySelector(tabPrefix + clickedTabName);
        if (tabEl instanceof PolymerElement) {
          // tab element already loaded, no need for loading messages
          return;
        }
         this.fireEvent('global-loading', {
          message: 'Loading...',
          active: true,
          loadingSource: loadingSource
        });
      }

      /**
       * "other" can be any property that must be defined before the method
       * is executed (main item displayed on the page, activePage)
       */
      _showSidebarStatus(listPageActive: boolean, tabAttached: boolean, other: boolean) {
        let showStatus = !listPageActive && !!tabAttached;
        return !other ? showStatus : (showStatus && other);
      }

      _reloadListData(e: CustomEvent) {
        e.stopImmediatePropagation();
        try {
          let listElem = this.shadowRoot.querySelector('#list');
          if (listElem && listElem._filterListData) {
            listElem._filterListData(true);
          }
        } catch (err) {
          this.logWarn('List refresh error occurred', '[' + this.moduleName +'-module]', err);
        }
      }

    });

    export default ModuleMainElCommonFunctionalityMixin;
