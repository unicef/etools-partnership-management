// import {dedupingMixin} from '@polymer/polymer/lib/utils/mixin.js';

import {LitElement, property, PropertyValues} from 'lit-element';
import {BASE_URL} from '../../../config/config';
import {Route} from '../../../typings/route.types';
import {Constructor, GenericObject} from '@unicef-polymer/etools-types';
/**
 * Module main elements common functionality
 * @polymer
 * @mixinFunction
 */
function ModuleRoutingMixinLit<T extends Constructor<LitElement>>(baseClass: T) {
  class ModuleRoutingClass extends baseClass {
    @property({type: Boolean})
    listActive!: boolean;

    @property({type: Boolean})
    tabsActive!: boolean;

    @property({type: Object})
    route!: Route;

    @property({type: Object})
    routeData!: GenericObject;

    @property({type: Object})
    subroute: any = null;

    @property({type: Object})
    subRouteData: any;

    @property({type: String})
    rootPath = BASE_URL;

    @property({type: String})
    moduleName!: string;

    @property({type: String})
    activePage!: string;

    /**
     * This flag is used to make sure status sidebar doesn't show before tab content is loaded.
     * The flag is updated:
     *    - true: when the main tab element fires tab-content-attached event (_requestedTabContentHasBeenAttached)
     *    - false: - when activePage is changed and it's one of the main tabs &&
     *             - the previous activePage value is not the list &&
     *             - tab content element was not loaded before (_resetTabAttachedFlagIfNeeded)
     */
    @property({type: Boolean})
    tabAttached = false;

    public connectedCallback() {
      super.connectedCallback();

      this._requestedTabContentHasBeenAttached = this._requestedTabContentHasBeenAttached.bind(this);
      this.addEventListener('tab-content-attached', this._requestedTabContentHasBeenAttached);
    }

    disconnectedCallback() {
      super.disconnectedCallback();
      this.removeEventListener('tab-content-attached', this._requestedTabContentHasBeenAttached);
    }

    updated(changedProperties: PropertyValues) {
      if (changedProperties.has('activePage')) {
        this._activePageChanged(this.activePage);
      }
    }

    _activePageChanged(currentModule: string | undefined, previousPage?: string) {
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
      this.tabAttached = true;
    }

    /*
     * Reset tabAttached flag if the tab element hasn't been loaded before, you're navigating to it from the list
     */
    _resetTabAttachedFlagIfNeeded(currentModule: string, previousPage?: string) {
      const selectedTab = this.shadowRoot!.querySelector('[name="' + currentModule + '"]');
      if (this.listActive || (!selectedTab && previousPage && previousPage === 'list')) {
        this.tabAttached = false;
      }
      if (selectedTab) {
        // tab already loaded, make sure the flag is true when coming from the list
        this.tabAttached = true;
      }
    }

    isActiveModule(moduleName?: string) {
      const mName = !moduleName ? this.moduleName : moduleName;
      return this.rootPath + mName === this.route.prefix;
    }
  }
  return ModuleRoutingClass;
}

export default ModuleRoutingMixinLit;
