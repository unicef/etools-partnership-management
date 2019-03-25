import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';
import { GenericObject } from '../../../typings/globals.types'; // TODO - load using tsconfig
import '../../../typings/globals.types.js';

import {PolymerElement} from "@polymer/polymer/polymer-element";
import { fireEvent } from '../../utils/fire-custom-event';
import {getDomainByEnv} from '../../../config/config';
import {logError} from "etools-behaviors/etools-logging";
/**
 * Module main elements common functionality
 * @polymer
 * @mixinFunction
 * @appliesMixin EtoolsLogsMixin
 */
const ModuleRoutingMixin = dedupingMixin(
    // @ts-ignore
    (superClass: any) => class extends (superClass) {

      static get properties() {
        return {
          listActive: Boolean,
          tabsActive: Boolean,
          route: Object,
          routeData: Object,
          rootPath: String,
          moduleName: String,
          activePage: {
            type: String,
            notify: true,
            observer: '_activePageChanged'
          },
          /**
           * This flag is used to make sure status sidebar doesn't show before tab content is loaded.
           * The flag is updated:
           *    - true: when the main tab element fires tab-content-attached event (_requestedTabContentHasBeenAttached)
           *    - false: - when activePage is changed and it's one of the main tabs &&
           *             - the previous activePage value is not the list &&
           *             - tab content element was not loaded before (_resetTabAttachedFlagIfNeeded)
           */
          tabAttached: {
            type: Boolean,
            value: false
          }
        };
      }

      ready() {
        super.ready();

        this._requestedTabContentHasBeenAttached = this._requestedTabContentHasBeenAttached.bind(this);
        this.addEventListener('tab-content-attached', this._requestedTabContentHasBeenAttached);
      }

      disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('tab-content-attached', this._requestedTabContentHasBeenAttached);
      }

      _activePageChanged(currentModule: string | undefined, previousPage: string) {
        if (typeof currentModule === 'undefined') {
          return;
        }
        this._resetTabAttachedFlagIfNeeded(currentModule, previousPage);
      }

      /**
       * Use tabAttached to mark when requested tab has been attached to DOM.
       * Used to make sure sidebar doesn't show while tab element is still loading
       */
      _requestedTabContentHasBeenAttached() {
        this.set('tabAttached', true);
      }

      /*
       * Reset tabAttached flag if the tab element hasn't been loaded before, you're navigating to it from the list
       */
      _resetTabAttachedFlagIfNeeded(currentModule: string, previousPage: string) {
        let selectedTab = this.shadowRoot.querySelector('[name="' + currentModule + '"]');
        if (this.listActive || (!selectedTab && previousPage && previousPage === 'list')) {
          this.set('tabAttached', false);
        }
        if (selectedTab) {
          // tab already loaded, make sure the flag is true when coming from the list
          this.set('tabAttached', true);
        }
      }

      _getFilenamePrefix(listActive: boolean, fileImportDetails: GenericObject) {
        // set page element prefix... filename prefix ex: partners- or partner- , agreements- or agreement-
        return (listActive ? (fileImportDetails.filenamePrefix + 's') : fileImportDetails.filenamePrefix) + '-';
      }

      /**
       * Each module(partners|agreements|interventions|reports|settings etc.) will have a pages folder and this
       * will contain a folder for each page (list|details|overview etc.)
       * @param {string} page
       * @param {function} appendBasePathAdditionalFolder
       * @return {string}
       */
      _getFileBaseUrl(currentModule: string, page: string, appendBasePathAdditionalFolder: object) {
        let baseUrl = currentModule + '/pages/' + page + '/';
        if (typeof appendBasePathAdditionalFolder === 'function') {
          // the file might be in a folder named as current tab name (ex: intervention reports and progress tabs)
          baseUrl = appendBasePathAdditionalFolder.bind(this, baseUrl, page)();
        }
        return baseUrl;
      }

      _handleSuccessfulImport(page: string, successCallback: object) {
        // set active page
        this.set('activePage', page);
        if (typeof successCallback === 'function') {
          successCallback.bind(this)();
        }
      }

      _handleFailedImport(err: GenericObject, page: string, fileImportDetails: GenericObject) {
        // log page element import failed error
        let importErrMsgPrefix = fileImportDetails.errMsgPrefixTmpl.replace('##page##', page);
        logError(fileImportDetails.importErrMsg, importErrMsgPrefix, err);

        fireEvent(this, 'global-loading', {active: false, loadingSource: fileImportDetails.loadingMsgSource});
        fireEvent(this, '404');
      }

      setActivePage(listActive: boolean, tab: string, fileImportDetails: GenericObject, canAccessTab: object,
                    appendBasePathAdditionalFolder: object, successfulImportCallback: object) {
        let page = listActive ? 'list' : tab;

        if (listActive) {
          // clear server errors for the list
          fireEvent(this, 'clear-server-errors');
        } else {
          if (typeof canAccessTab === 'function' && !canAccessTab.bind(this, page)()) {
            // the user can not access this tab (ex: prp tabs on interventions)
            fireEvent(this, '404');
            return;
          }
        }

        if (page && page !== this.activePage) {
          // import main page element
          let importFilenamePrefix = this._getFilenamePrefix(listActive, fileImportDetails);

          let baseUrl = this._getFileBaseUrl(fileImportDetails.filenamePrefix + 's',
                        page, appendBasePathAdditionalFolder);

          let fileName = importFilenamePrefix + page;

          this.importPageElement(fileName, baseUrl).then(() => {
            this._handleSuccessfulImport(page, successfulImportCallback);
          }).catch((err) => {
            this._handleFailedImport(err, page, fileImportDetails);
          });
        }
      }

      _updateNewItemPageFlag(routeData: GenericObject, listActive: boolean) {
        return routeData && routeData.id === 'new' && !listActive;
      }

      importPageElement(fileName: string, baseUrl: string) {
        return new Promise((resolve, reject) => {
          let customElement = this.shadowRoot.querySelector(fileName);
          if (customElement instanceof PolymerElement === false) {

            /* Imports are resolved relative to the current module, in this case module-routing-mixin,
             * So non-absolute paths will be relative to
             * `http://localhost:8082/pmp/src/components/app-modules/mixins/`
             */
            let pageUrl = getDomainByEnv() + '/src/components/app-modules/' + baseUrl + fileName + '.js';
            console.log('Root path: ', this.rootPath );
            import(pageUrl).then(() => {
              resolve();
            }).catch((err) => {
              console.error(err);
              reject(err);
            });
          } else {
            resolve();
          }
        });
      }

      isActiveModule(moduleName: string) {
        const mName = !moduleName ? this.moduleName : moduleName;
        return this.rootPath + mName === this.route.prefix;
      }

    });

export default ModuleRoutingMixin;
